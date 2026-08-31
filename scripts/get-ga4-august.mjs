import { loadProjectEnv } from "./lib/env.mjs";
import fs from "node:fs/promises";
import { OAuth2Client } from "google-auth-library";

await loadProjectEnv();

async function main() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const oauthTokenPath = process.env.GA4_OAUTH_TOKEN_JSON || "secrets/ga4-oauth-token.json";
  const oauthClientPath = process.env.GA4_OAUTH_CLIENT_JSON || "secrets/ga4-oauth-client.json";

  const config = JSON.parse(await fs.readFile(oauthClientPath, "utf8"));
  const clientConfig = config.installed || config.web;
  const oauth = new OAuth2Client(clientConfig.client_id, clientConfig.client_secret);
  oauth.setCredentials(JSON.parse(await fs.readFile(oauthTokenPath, "utf8")));

  const response = await oauth.request({
    url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    method: "POST",
    data: {
      dateRanges: [{ startDate: "2026-08-01", endDate: "today" }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }, { name: "sessionSourceMedium" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "ecommercePurchases" },
        { name: "totalRevenue" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    },
  });

  const rows = (response.data.rows || []).map((r) => ({
    canal: r.dimensionValues[0]?.value,
    origemMeio: r.dimensionValues[1]?.value,
    sessoes: Number(r.metricValues[0]?.value || 0),
    usuarios: Number(r.metricValues[1]?.value || 0),
    compras: Number(r.metricValues[2]?.value || 0),
    receita: Number(r.metricValues[3]?.value || 0),
  }));

  console.log(JSON.stringify(rows, null, 2));
}

main().catch(console.error);
