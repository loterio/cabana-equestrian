// Comparativo de vendas por mes (Magazord / Cabana)
import { loadProjectEnv } from "./lib/env.mjs";

await loadProjectEnv();

const baseUrl = process.env.MAGAZORD_BASE_URL;
const auth = Buffer.from(
  `${process.env.MAGAZORD_TOKEN}:${process.env.MAGAZORD_PASSWORD || process.env.MAGAZORD_SENHA}`,
).toString("base64");
const delay = 600;
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

async function ordersSince(since) {
  const all = [];
  const LIMIT = 100;
  for (let page = 1; page <= 100; page += 1) {
    const payload = await api("/v2/site/pedido", {
      limit: LIMIT,
      page,
      "dataHora[gte]": since,
      orderDirection: "asc",
    });
    const batch = items(payload);
    all.push(...batch);
    if (batch.length < LIMIT) break;
    await sleep(delay);
  }
  return all;
}

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const isCancelado = (d = "") => /cancel|devolv|estorn/i.test(d);

// puxa tudo de 2025-01-01 pra frente e agrupa por mes
console.log(">>> baixando pedidos desde 2025-01-01 (pode demorar)...");
const orders = await ordersSince("2025-01-01");
console.log(`pedidos: ${orders.length}\n`);

const byMonth = new Map();
for (const o of orders) {
  const m = String(o.dataHora || "").slice(0, 7);
  if (!m) continue;
  const cur = byMonth.get(m) || { qtd: 0, valor: 0, cancQtd: 0, cancValor: 0 };
  if (isCancelado(o.pedidoSituacaoDescricao)) {
    cur.cancQtd += 1;
    cur.cancValor += Number(o.valorTotal || 0);
  } else {
    cur.qtd += 1;
    cur.valor += Number(o.valorTotal || 0);
  }
  byMonth.set(m, cur);
}

console.log("MES      PEDIDOS   FATURAMENTO      TICKET    CANCELADOS");
for (const [m, v] of [...byMonth.entries()].sort()) {
  const ticket = v.qtd ? v.valor / v.qtd : 0;
  console.log(
    `${m}  ${String(v.qtd).padStart(7)}  ${brl(v.valor).padStart(14)}  ${brl(ticket).padStart(10)}  ${String(v.cancQtd).padStart(4)} (${brl(v.cancValor)})`,
  );
}

// origem dos pedidos no mes corrente
const mesAtual = new Date().toISOString().slice(0, 7);
const doMes = orders.filter((o) => String(o.dataHora || "").startsWith(mesAtual));
const byOrigem = new Map();
for (const o of doMes) {
  const k = o.origem ?? "?";
  byOrigem.set(k, (byOrigem.get(k) || 0) + 1);
}
console.log(`\nOrigem dos pedidos de ${mesAtual}:`, Object.fromEntries(byOrigem));
