import fs from "node:fs/promises";
import fsSync from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFile } from "node:child_process";
import { GoogleAuth, OAuth2Client } from "google-auth-library";
import { loadProjectEnv } from "./lib/env.mjs";

await loadProjectEnv();

const args = new Map(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const [key, ...value] = arg.slice(2).split("=");
      return [key, value.join("=") || "1"];
    }),
);

const propertyId = args.get("property") || process.env.GA4_PROPERTY_ID;
const startDate = args.get("start") || process.env.GA4_START_DATE || "2026-01-01";
const endDate = args.get("end") || process.env.GA4_END_DATE || "today";
const outRoot = args.get("out") || "data/ga4";
const rawDir = path.join(outRoot, "raw");
const derivedDir = path.join(outRoot, "derived");

const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GA4_SERVICE_ACCOUNT_JSON ||
  process.env.GA4_CREDENTIALS_PATH;
const oauthClientPath = process.env.GA4_OAUTH_CLIENT_JSON || "secrets/ga4-oauth-client.json";
const oauthTokenPath = process.env.GA4_OAUTH_TOKEN_JSON || "secrets/ga4-oauth-token.json";
const oauthTimeoutMs = Number(process.env.GA4_OAUTH_TIMEOUT_MS || 10 * 60 * 1000);
const analyticsScope = "https://www.googleapis.com/auth/analytics.readonly";

if (!propertyId || (!credentialsPath && !fsSync.existsSync(oauthClientPath))) {
  console.error(
    [
      "Missing GA4 configuration.",
      "Set GA4_PROPERTY_ID and either GOOGLE_APPLICATION_CREDENTIALS or GA4_OAUTH_CLIENT_JSON.",
      "Example:",
      "GA4_PROPERTY_ID=123456789",
      "GA4_OAUTH_CLIENT_JSON=secrets/ga4-oauth-client.json",
    ].join("\n"),
  );
  process.exit(1);
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function openBrowser(url) {
  if (process.platform === "win32") {
    execFile("rundll32", ["url.dll,FileProtocolHandler", url]);
  } else if (process.platform === "darwin") {
    execFile("open", [url]);
  } else {
    execFile("xdg-open", [url]);
  }
}

async function getOAuthClient() {
  const config = JSON.parse(await fs.readFile(oauthClientPath, "utf8"));
  const clientConfig = config.installed || config.web;
  if (!clientConfig?.client_id || !clientConfig?.client_secret) {
    throw new Error(`Invalid OAuth client file: ${oauthClientPath}`);
  }

  if (await fileExists(oauthTokenPath)) {
    const oauth = new OAuth2Client(clientConfig.client_id, clientConfig.client_secret);
    oauth.setCredentials(JSON.parse(await fs.readFile(oauthTokenPath, "utf8")));
    return oauth;
  }

  const preferredPort = Number(process.env.GA4_OAUTH_PORT || 53682);

  const codeAndRedirect = await new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      try {
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : preferredPort;
        const redirectUri = `http://localhost:${port}/oauth2callback`;
        const url = new URL(request.url, redirectUri);
        if (url.pathname !== "/oauth2callback") {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        const error = url.searchParams.get("error");
        if (error) throw new Error(error);
        const receivedCode = url.searchParams.get("code");
        if (!receivedCode) throw new Error("OAuth code not found in callback.");
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end("<h1>Autenticacao concluida</h1><p>Voce pode voltar ao Codex.</p>");
        server.close();
        resolve({ code: receivedCode, redirectUri });
      } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(error.message);
        server.close();
        reject(error);
      }
    });
    server.listen(preferredPort, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : preferredPort;
      const redirectUri = `http://localhost:${port}/oauth2callback`;
      const oauth = new OAuth2Client(clientConfig.client_id, clientConfig.client_secret, redirectUri);
      const authUrl = oauth.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [analyticsScope],
      });
      console.log("Opening browser for GA4 OAuth consent...");
      console.log(authUrl);
      openBrowser(authUrl);
    });
    server.on("error", (error) => {
      if (error.code !== "EADDRINUSE") {
        reject(error);
        return;
      }
      server.listen(0, () => {
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : preferredPort;
        const redirectUri = `http://localhost:${port}/oauth2callback`;
        const oauth = new OAuth2Client(clientConfig.client_id, clientConfig.client_secret, redirectUri);
        const authUrl = oauth.generateAuthUrl({
          access_type: "offline",
          prompt: "consent",
          scope: [analyticsScope],
        });
        console.log("Opening browser for GA4 OAuth consent...");
        console.log(authUrl);
        openBrowser(authUrl);
      });
    });
    setTimeout(() => {
      server.close();
      reject(new Error("OAuth timeout. Run the command again and complete browser consent."));
    }, oauthTimeoutMs);
  });

  const oauth = new OAuth2Client(
    clientConfig.client_id,
    clientConfig.client_secret,
    codeAndRedirect.redirectUri,
  );
  const { tokens } = await oauth.getToken(codeAndRedirect.code);
  oauth.setCredentials(tokens);
  await fs.mkdir(path.dirname(oauthTokenPath), { recursive: true });
  await fs.writeFile(oauthTokenPath, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
  return oauth;
}

async function getAuthClient() {
  if (credentialsPath && (await fileExists(credentialsPath))) {
    const auth = new GoogleAuth({
      keyFile: credentialsPath,
      scopes: [analyticsScope],
    });
    return auth.getClient();
  }
  return getOAuthClient();
}

const authClient = await getAuthClient();

function metric(name) {
  return { name };
}

function dimension(name) {
  return { name };
}

function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function rowsToObjects(response) {
  const dimensions = response.dimensionHeaders?.map((header) => header.name) || [];
  const metrics = response.metricHeaders?.map((header) => header.name) || [];
  return (response.rows || []).map((row) => {
    const object = {};
    row.dimensionValues?.forEach((value, index) => {
      object[dimensions[index]] = value.value;
    });
    row.metricValues?.forEach((value, index) => {
      object[metrics[index]] = Number(value.value);
    });
    return object;
  });
}

async function runReport(name, config) {
  const response = await authClient.request({
    url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    method: "POST",
    data: {
    dateRanges: [{ startDate, endDate }],
    dimensions: config.dimensions?.map(dimension) || [],
    metrics: config.metrics.map(metric),
    limit: config.limit || 10000,
    orderBys: config.orderBy
      ? [
          {
            metric: { metricName: config.orderBy },
            desc: true,
        },
      ]
      : undefined,
    dimensionFilter: config.dimensionFilter,
    },
  });
  const data = response.data;
  const objects = rowsToObjects(data);
  await writeJson(path.join(rawDir, `${sanitizeFileName(name)}.json`), {
    name,
    request: config,
    rowCount: data.rowCount,
    rows: objects,
  });
  console.log(`${name}: ${objects.length} rows`);
  return objects;
}

function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

async function writeCsv(file, rows) {
  if (!rows.length) {
    await fs.writeFile(file, "", "utf8");
    return;
  }
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ];
  await fs.writeFile(file, `${lines.join("\n")}\n`, "utf8");
}

const reports = [
  {
    name: "overview-by-device",
    dimensions: ["deviceCategory"],
    metrics: [
      "sessions",
      "totalUsers",
      "engagedSessions",
      "conversions",
      "totalRevenue",
      "ecommercePurchases",
      "addToCarts",
      "checkouts",
    ],
    orderBy: "sessions",
  },
  {
    name: "traffic-by-channel-device",
    dimensions: ["sessionDefaultChannelGroup", "sessionSourceMedium", "deviceCategory"],
    metrics: ["sessions", "totalUsers", "conversions", "totalRevenue", "ecommercePurchases"],
    orderBy: "sessions",
  },
  {
    name: "landing-pages-mobile",
    dimensions: ["landingPagePlusQueryString", "deviceCategory"],
    metrics: ["sessions", "engagedSessions", "conversions", "totalRevenue", "ecommercePurchases"],
    orderBy: "sessions",
    dimensionFilter: {
      filter: {
        fieldName: "deviceCategory",
        stringFilter: { matchType: "EXACT", value: "mobile" },
      },
    },
  },
  {
    name: "pages",
    dimensions: ["pagePathPlusQueryString", "pageTitle"],
    metrics: ["screenPageViews", "sessions", "totalRevenue", "conversions"],
    orderBy: "screenPageViews",
  },
  {
    name: "item-categories",
    dimensions: ["itemCategory", "itemCategory2", "itemCategory3"],
    metrics: ["itemsViewed", "itemsAddedToCart", "itemsPurchased", "itemRevenue"],
    orderBy: "itemRevenue",
  },
  {
    name: "items",
    dimensions: ["itemName", "itemId", "itemCategory"],
    metrics: ["itemsViewed", "itemsAddedToCart", "itemsPurchased", "itemRevenue"],
    orderBy: "itemRevenue",
  },
  {
    name: "events",
    dimensions: ["eventName"],
    metrics: ["eventCount", "totalUsers", "totalRevenue"],
    orderBy: "eventCount",
  },
  {
    name: "internal-search",
    dimensions: ["searchTerm"],
    metrics: ["eventCount", "totalUsers"],
    orderBy: "eventCount",
  },
];

await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(derivedDir, { recursive: true });

const output = {};
for (const report of reports) {
  try {
    output[report.name] = await runReport(report.name, report);
  } catch (error) {
    output[report.name] = { error: error.message };
    console.error(`${report.name}: ${error.message}`);
  }
}

await writeJson(path.join(derivedDir, "summary.json"), {
  propertyId,
  startDate,
  endDate,
  exportedAt: new Date().toISOString(),
  reports: Object.fromEntries(
    Object.entries(output).map(([name, rows]) => [
      name,
      Array.isArray(rows) ? { rows: rows.length } : rows,
    ]),
  ),
});

for (const [name, rows] of Object.entries(output)) {
  if (Array.isArray(rows)) {
    await writeCsv(path.join(derivedDir, `${sanitizeFileName(name)}.csv`), rows);
  }
}
