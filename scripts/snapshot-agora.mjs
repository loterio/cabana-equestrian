// Snapshot rápido: vendas do mês corrente + estoque atual (Magazord / Cabana)
import fs from "node:fs/promises";
import path from "node:path";
import { loadProjectEnv } from "./lib/env.mjs";

await loadProjectEnv();

const baseUrl = process.env.MAGAZORD_BASE_URL;
const auth = Buffer.from(
  `${process.env.MAGAZORD_TOKEN}:${process.env.MAGAZORD_PASSWORD || process.env.MAGAZORD_SENHA}`,
).toString("base64");
const delay = Number(process.env.MAGAZORD_REQUEST_DELAY_MS || 750);

const args = new Map(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.join("=") || "1"];
  }),
);

const since = args.get("since") || new Date().toISOString().slice(0, 8) + "01";
const outDir = "data/magazord/snapshot";

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
  throw new Error(`falhou apos retries: ${endpoint}`);
}

const items = (p) => p?.data?.items ?? p?.items ?? (Array.isArray(p?.data) ? p.data : []);

async function paginate(endpoint, params = {}, limit = 100) {
  const all = [];
  for (let page = 1; page <= 60; page += 1) {
    const payload = await api(endpoint, { limit, page, ...params });
    const batch = items(payload);
    all.push(...batch);
    if (batch.length < limit) break;
    await sleep(delay);
  }
  return all;
}

async function paginateOffset(endpoint, params = {}, limit = 500) {
  const all = [];
  for (let offset = 0; offset < 100000; offset += limit) {
    const payload = await api(endpoint, { limit, offset, ...params });
    const batch = items(payload);
    all.push(...batch);
    if (batch.length < limit) break;
    await sleep(delay);
  }
  return all;
}

const brl = (n) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ---------- VENDAS ----------
console.log(`\n>>> Buscando pedidos desde ${since}...`);
const orders = await paginate("/v2/site/pedido", {
  "dataHora[gte]": since,
  orderDirection: "asc",
});
console.log(`pedidos: ${orders.length}`);

const bySituacao = new Map();
let totalGeral = 0;
for (const o of orders) {
  const key = `${o.pedidoSituacao} - ${o.pedidoSituacaoDescricao}`;
  const cur = bySituacao.get(key) || { qtd: 0, valor: 0 };
  cur.qtd += 1;
  cur.valor += Number(o.valorTotal || 0);
  bySituacao.set(key, cur);
  totalGeral += Number(o.valorTotal || 0);
}

// cancelados/situacoes que nao contam como venda efetiva
const isCancelado = (d = "") => /cancel|devolv|estorn/i.test(d);
let validQtd = 0;
let validValor = 0;
for (const o of orders) {
  if (isCancelado(o.pedidoSituacaoDescricao)) continue;
  validQtd += 1;
  validValor += Number(o.valorTotal || 0);
}

console.log("\n=== VENDAS DO PERIODO ===");
console.log(`Total de pedidos:      ${orders.length}  ${brl(totalGeral)}`);
console.log(`Excluindo cancelados:  ${validQtd}  ${brl(validValor)}`);
console.log(`Ticket medio:          ${validQtd ? brl(validValor / validQtd) : "-"}`);
console.log("\nPor situacao:");
for (const [k, v] of [...bySituacao.entries()].sort((a, b) => b[1].valor - a[1].valor)) {
  console.log(`  ${k.padEnd(38)} ${String(v.qtd).padStart(4)}  ${brl(v.valor)}`);
}

// por dia
const byDay = new Map();
for (const o of orders) {
  if (isCancelado(o.pedidoSituacaoDescricao)) continue;
  const d = String(o.dataHora || "").slice(0, 10);
  const cur = byDay.get(d) || { qtd: 0, valor: 0 };
  cur.qtd += 1;
  cur.valor += Number(o.valorTotal || 0);
  byDay.set(d, cur);
}
console.log("\nPor dia (validos):");
for (const [d, v] of [...byDay.entries()].sort()) {
  console.log(`  ${d}  ${String(v.qtd).padStart(3)} ped  ${brl(v.valor)}`);
}

// ---------- ESTOQUE ----------
console.log("\n>>> Buscando produtos...");
const products = await paginate("/v2/site/produto", { tipoProduto: "1" });
console.log(`produtos: ${products.length}`);

console.log(">>> Buscando estoque...");
const stock = await paginateOffset("/v1/listEstoque", { ativo: true });
console.log(`linhas de estoque: ${stock.length}`);

const stockBySku = new Map();
for (const row of stock) {
  const sku = row.produto ?? row.codigo ?? row.produtoDerivacaoCodigo;
  const qty = Number(row.quantidadeDisponivelVenda ?? row.quantidade ?? 0);
  stockBySku.set(sku, (stockBySku.get(sku) || 0) + qty);
}

const prodStock = [];
for (const p of products) {
  let total = 0;
  const derivs = [];
  for (const d of p.derivacoes || []) {
    const q = stockBySku.get(d.codigo) || 0;
    total += q;
    derivs.push({ nome: d.nome, codigo: d.codigo, qtd: q });
  }
  prodStock.push({ id: p.id, nome: (p.nome || "").trim(), ativo: p.ativo, total, derivs });
}

const totalUnidades = prodStock.reduce((s, p) => s + p.total, 0);
const zerados = prodStock.filter((p) => p.total === 0);
const criticos = prodStock.filter((p) => p.total > 0 && p.total <= 3);

console.log("\n=== ESTOQUE ===");
console.log(`Produtos (pai):        ${prodStock.length}`);
console.log(`Unidades disponiveis:  ${totalUnidades}`);
console.log(`Produtos zerados:      ${zerados.length}`);
console.log(`Produtos criticos(<=3):${criticos.length}`);

console.log("\nTop 20 maior estoque:");
for (const p of [...prodStock].sort((a, b) => b.total - a.total).slice(0, 20)) {
  console.log(`  ${String(p.total).padStart(5)}  ${p.nome}`);
}

console.log("\nCriticos (1-3 un):");
for (const p of criticos.slice(0, 40)) {
  console.log(`  ${String(p.total).padStart(3)}  ${p.nome}`);
}

// ---------- CRUZAMENTO: vendidos no periodo x estoque ----------
console.log("\n>>> Detalhando itens dos pedidos do periodo...");
const soldByProduct = new Map();
let detailErr = 0;
for (const [i, o] of orders.entries()) {
  if (!o.codigo || isCancelado(o.pedidoSituacaoDescricao)) continue;
  try {
    const detail = await api(`/v2/site/pedido/${encodeURIComponent(o.codigo)}`, {
      listaContatos: 0,
    });
    const order = detail?.data || detail;
    for (const track of order?.arrayPedidoRastreio || []) {
      for (const it of track?.pedidoItem || []) {
        const key = (it.produtoNome || it.produtoTitulo || "?").trim();
        const cur = soldByProduct.get(key) || { qtd: 0, valor: 0 };
        cur.qtd += Number(it.quantidade || 0);
        cur.valor += Number(it.valorItem || 0);
        soldByProduct.set(key, cur);
      }
    }
  } catch {
    detailErr += 1;
  }
  if ((i + 1) % 10 === 0) console.log(`  ...${i + 1}/${orders.length}`);
  await sleep(delay);
}
if (detailErr) console.log(`(${detailErr} pedidos sem detalhe)`);

const stockByName = new Map(prodStock.map((p) => [p.nome, p.total]));
console.log("\n=== MAIS VENDIDOS NO PERIODO (x estoque atual) ===");
const ranked = [...soldByProduct.entries()].sort((a, b) => b[1].qtd - a[1].qtd);
for (const [nome, v] of ranked.slice(0, 30)) {
  const est = stockByName.has(nome) ? stockByName.get(nome) : "?";
  console.log(`  ${String(v.qtd).padStart(3)}un ${brl(v.valor).padStart(12)}  est:${String(est).padStart(4)}  ${nome}`);
}

// ---------- SALVAR ----------
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(
  path.join(outDir, "snapshot.json"),
  JSON.stringify(
    {
      geradoEm: new Date().toISOString(),
      since,
      vendas: {
        pedidos: orders.length,
        validos: validQtd,
        faturamentoValido: validValor,
        ticketMedio: validQtd ? validValor / validQtd : 0,
        porSituacao: Object.fromEntries(bySituacao),
        porDia: Object.fromEntries(byDay),
      },
      estoque: {
        produtos: prodStock.length,
        unidades: totalUnidades,
        zerados: zerados.length,
        criticos: criticos.length,
      },
      maisVendidos: ranked.slice(0, 50).map(([nome, v]) => ({
        nome,
        qtd: v.qtd,
        valor: v.valor,
        estoqueAtual: stockByName.get(nome) ?? null,
      })),
      produtos: prodStock,
    },
    null,
    2,
  ),
  "utf8",
);
console.log(`\nsalvo em ${outDir}/snapshot.json`);
