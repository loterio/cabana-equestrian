// Estoque atual completo (Magazord / Cabana)
import fs from "node:fs/promises";
import { loadProjectEnv } from "./lib/env.mjs";

await loadProjectEnv();

const baseUrl = process.env.MAGAZORD_BASE_URL;
const auth = Buffer.from(
  `${process.env.MAGAZORD_TOKEN}:${process.env.MAGAZORD_PASSWORD || process.env.MAGAZORD_SENHA}`,
).toString("base64");
const delay = Number(process.env.MAGAZORD_REQUEST_DELAY_MS || 600);
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
      throw new Error(`${res.status} ${res.statusText} ${url}\n${text.slice(0, 400)}`);
    }
    await sleep(delay * 2 ** attempt);
  }
  throw new Error(`falhou: ${endpoint}`);
}

const items = (p) => p?.data?.items ?? p?.items ?? (Array.isArray(p?.data) ? p.data : []);

// /v1/listEstoque: limite real da API e 100 por pagina, paginado por offset
async function fetchEstoque() {
  const all = [];
  const LIMIT = 100;
  for (let offset = 0; offset < 200000; offset += LIMIT) {
    const payload = await api("/v1/listEstoque", { limit: LIMIT, offset, ativo: true });
    const batch = items(payload);
    all.push(...batch);
    process.stdout.write(`\r  estoque offset=${offset} total=${all.length}   `);
    if (batch.length < LIMIT) break;
    await sleep(delay);
  }
  console.log("");
  return all;
}

async function paginate(endpoint, params = {}) {
  const all = [];
  const LIMIT = 100;
  for (let page = 1; page <= 200; page += 1) {
    const payload = await api(endpoint, { limit: LIMIT, page, ...params });
    const batch = items(payload);
    all.push(...batch);
    process.stdout.write(`\r  ${endpoint} page=${page} total=${all.length}   `);
    if (batch.length < LIMIT) break;
    await sleep(delay);
  }
  console.log("");
  return all;
}

console.log(">>> produtos");
const products = await paginate("/v2/site/produto", { tipoProduto: "1" });

console.log(">>> estoque");
const stock = await fetchEstoque();

console.log(`\nprodutos=${products.length}  linhas de estoque=${stock.length}`);
console.log("amostra linha estoque:", JSON.stringify(stock[0], null, 2));

const stockBySku = new Map();
for (const row of stock) {
  const sku = row.produto ?? row.codigo ?? row.produtoDerivacaoCodigo;
  const qty = Number(row.quantidadeDisponivelVenda ?? row.quantidade ?? 0);
  stockBySku.set(sku, (stockBySku.get(sku) || 0) + qty);
}

const prodStock = products.map((p) => {
  const derivs = (p.derivacoes || []).map((d) => ({
    nome: d.nome,
    codigo: d.codigo,
    qtd: stockBySku.get(d.codigo) || 0,
  }));
  return {
    id: p.id,
    nome: (p.nome || "").trim(),
    ativo: p.ativo,
    total: derivs.reduce((s, d) => s + d.qtd, 0),
    derivs,
  };
});

const totalUn = prodStock.reduce((s, p) => s + p.total, 0);
const comEstoque = prodStock.filter((p) => p.total > 0);
const zerados = prodStock.filter((p) => p.total === 0);
const criticos = prodStock.filter((p) => p.total > 0 && p.total <= 3);

console.log("\n=== ESTOQUE ATUAL ===");
console.log(`Produtos cadastrados:   ${prodStock.length}`);
console.log(`Com estoque:            ${comEstoque.length}`);
console.log(`Zerados:                ${zerados.length}`);
console.log(`Criticos (1-3 un):      ${criticos.length}`);
console.log(`Unidades disponiveis:   ${totalUn}`);

console.log("\nTop 30 por estoque:");
for (const p of [...comEstoque].sort((a, b) => b.total - a.total).slice(0, 30)) {
  console.log(`  ${String(p.total).padStart(5)}  ${p.nome}`);
}

console.log("\nCriticos:");
for (const p of criticos.sort((a, b) => a.total - b.total)) {
  console.log(`  ${String(p.total).padStart(3)}  ${p.nome}`);
}

await fs.mkdir("data/magazord/snapshot", { recursive: true });
await fs.writeFile(
  "data/magazord/snapshot/estoque.json",
  JSON.stringify(
    {
      geradoEm: new Date().toISOString(),
      linhasEstoque: stock.length,
      produtos: prodStock.length,
      comEstoque: comEstoque.length,
      zerados: zerados.length,
      unidades: totalUn,
      lista: prodStock,
    },
    null,
    2,
  ),
  "utf8",
);
console.log("\nsalvo em data/magazord/snapshot/estoque.json");
