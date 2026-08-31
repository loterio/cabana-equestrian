import { loadProjectEnv } from "./lib/env.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { GoogleAuth, OAuth2Client } from "google-auth-library";

await loadProjectEnv();

const baseUrl = process.env.MAGAZORD_BASE_URL;
const auth = Buffer.from(
  `${process.env.MAGAZORD_TOKEN}:${process.env.MAGAZORD_PASSWORD || process.env.MAGAZORD_SENHA}`
).toString("base64");

const delay = 300;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(endpoint, params = {}) {
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });
    const text = await res.text();
    if (res.ok) return text ? JSON.parse(text) : null;
    if (res.status !== 429 && res.status < 500) {
      throw new Error(`${res.status} ${res.statusText} ${url}\n${text.slice(0, 300)}`);
    }
    await sleep(delay * 2 ** attempt);
  }
}

const items = (p) => p?.data?.items ?? p?.items ?? (Array.isArray(p?.data) ? p.data : []);
const isCancelado = (d = "") => /cancel|devolv|estorn/i.test(d);

async function main() {
  const startDate = "2026-08-01";
  console.log(`>>> Buscando pedidos da Magazord a partir de ${startDate}...`);

  const allOrders = [];
  for (let page = 1; page <= 50; page += 1) {
    const payload = await api("/v2/site/pedido", {
      limit: 100,
      page,
      "dataHora[gte]": startDate,
      orderDirection: "asc",
    });
    const batch = items(payload);
    allOrders.push(...batch);
    if (batch.length < 100) break;
    await sleep(delay);
  }

  console.log(`Total de pedidos encontrados na Magazord: ${allOrders.length}`);

  // Fetch detailed info for each order to get full details and exact origin
  const detailedOrders = [];
  for (const [idx, o] of allOrders.entries()) {
    if (!o.codigo) continue;
    try {
      const detail = await api(`/v2/site/pedido/${encodeURIComponent(o.codigo)}`, { listaContatos: 0 });
      const dData = detail?.data || detail || {};
      detailedOrders.push({ ...o, ...dData });
    } catch (e) {
      detailedOrders.push(o);
    }
    await sleep(150);
  }

  // Analytics Magazord
  let totalValorGeral = 0;
  let qtdValidos = 0;
  let totalValorValidos = 0;
  let qtdCancelados = 0;
  let totalValorCancelados = 0;

  const origemMapGeral = new Map();
  const origemMapValidos = new Map();
  const situacaoMap = new Map();

  for (const o of detailedOrders) {
    const val = Number(o.valorTotalFinal ?? o.valorTotal ?? 0);
    const orig = String(o.origem || "Não informada").trim();
    const sit = String(o.pedidoSituacaoDescricao || o.situacao || "Desconhecido").trim();

    totalValorGeral += val;
    situacaoMap.set(sit, (situacaoMap.get(sit) || 0) + 1);

    // Origem Geral
    const og = origemMapGeral.get(orig) || { qtd: 0, valor: 0 };
    og.qtd += 1;
    og.valor += val;
    origemMapGeral.set(orig, og);

    if (isCancelado(sit)) {
      qtdCancelados += 1;
      totalValorCancelados += val;
    } else {
      qtdValidos += 1;
      totalValorValidos += val;

      // Origem Válidos
      const ov = origemMapValidos.get(orig) || { qtd: 0, valor: 0 };
      ov.qtd += 1;
      ov.valor += val;
      origemMapValidos.set(orig, ov);
    }
  }

  const ticketMedioGeral = allOrders.length ? totalValorGeral / allOrders.length : 0;
  const ticketMedioValidos = qtdValidos ? totalValorValidos / qtdValidos : 0;

  const result = {
    periodo: "01/08/2026 até hoje",
    resumoMagazord: {
      totalPedidosGeral: allOrders.length,
      faturamentoGeral: totalValorGeral,
      ticketMedioGeral,
      pedidosValidos: qtdValidos,
      faturamentoValidos: totalValorValidos,
      ticketMedioValidos,
      pedidosCancelados: qtdCancelados,
      faturamentoCancelados: totalValorCancelados,
    },
    statusPedidos: Object.fromEntries(situacaoMap),
    origemGeral: Object.fromEntries(
      [...origemMapGeral.entries()].map(([k, v]) => [
        k,
        { ...v, ticketMedio: v.qtd ? v.valor / v.qtd : 0 },
      ])
    ),
    origemValidos: Object.fromEntries(
      [...origemMapValidos.entries()].map(([k, v]) => [
        k,
        { ...v, ticketMedio: v.qtd ? v.valor / v.qtd : 0 },
      ])
    ),
  };

  console.log("\n=== RESULTADO MAGAZORD ===");
  console.log(JSON.stringify(result, null, 2));

  // Try GA4 if configured
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const oauthTokenPath = process.env.GA4_OAUTH_TOKEN_JSON || "secrets/ga4-oauth-token.json";
    const oauthClientPath = process.env.GA4_OAUTH_CLIENT_JSON || "secrets/ga4-oauth-client.json";

    if (propertyId && (await fs.stat(oauthTokenPath).catch(() => null))) {
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
            { name: "ecommercePurchases" },
            { name: "totalRevenue" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        },
      });

      const ga4Rows = (response.data.rows || []).map((r) => ({
        channel: r.dimensionValues[0]?.value,
        sourceMedium: r.dimensionValues[1]?.value,
        sessions: Number(r.metricValues[0]?.value || 0),
        purchases: Number(r.metricValues[1]?.value || 0),
        revenue: Number(r.metricValues[2]?.value || 0),
      }));

      console.log("\n=== GA4 CANAIS E ORIGENS DE TRÁFEGO (01/08 a hoje) ===");
      console.log(JSON.stringify(ga4Rows, null, 2));
      result.ga4CanalOrigem = ga4Rows;
    }
  } catch (gaError) {
    console.log("Aviso ao buscar GA4:", gaError.message);
  }

  await fs.writeFile(
    "analises/vendas-mes-atual.json",
    JSON.stringify(result, null, 2),
    "utf8"
  );
}

main().catch(console.error);
