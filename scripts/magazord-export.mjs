import fs from "node:fs/promises";
import path from "node:path";
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

const baseUrl = process.env.MAGAZORD_BASE_URL;
const token = process.env.MAGAZORD_TOKEN;
const password = process.env.MAGAZORD_PASSWORD || process.env.MAGAZORD_SENHA;
const since = args.get("since") || process.env.MAGAZORD_SINCE_DATE || "2026-01-01";
const requestDelayMs = Number(process.env.MAGAZORD_REQUEST_DELAY_MS || 750);
const maxRetries = Number(process.env.MAGAZORD_MAX_RETRIES || 6);
const outRoot = args.get("out") || "data/magazord";
const rawDir = path.join(outRoot, "raw");
const derivedDir = path.join(outRoot, "derived");

if (!baseUrl || !token || !password) {
  console.error(
    [
      "Missing API configuration.",
      "Set MAGAZORD_BASE_URL, MAGAZORD_TOKEN and MAGAZORD_PASSWORD.",
      "Example:",
      "$env:MAGAZORD_BASE_URL = '...'",
      "$env:MAGAZORD_TOKEN = '...'",
      "$env:MAGAZORD_PASSWORD = '...'",
    ].join("\n"),
  );
  process.exit(1);
}

const auth = Buffer.from(`${token}:${password}`).toString("base64");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(endpoint, params = {}) {
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function apiRequest(endpoint, params = {}, options = {}) {
  const url = buildUrl(endpoint, params);
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    if (response.ok) {
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === maxRetries) {
      throw new Error(`${response.status} ${response.statusText} ${url}\n${text.slice(0, 1000)}`);
    }

    const retryAfter = Number(response.headers.get("retry-after") || 0) * 1000;
    const backoff = retryAfter || requestDelayMs * 2 ** attempt;
    console.log(`retry ${attempt + 1}/${maxRetries} ${response.status} ${endpoint} wait=${backoff}ms`);
    await sleep(backoff);
  }
}

function getItems(payload) {
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function hasMore(payload, page, count) {
  const data = payload?.data || payload;
  if (typeof data?.has_more === "boolean") return data.has_more;
  if (typeof data?.hasMore === "boolean") return data.hasMore;
  if (Number.isFinite(data?.total_pages)) return page < data.total_pages;
  if (Number.isFinite(data?.totalPages)) return page < data.totalPages;
  return count > 0;
}

async function paginate(endpoint, params = {}, limit = 100) {
  const all = [];
  for (let page = 1; ; page += 1) {
    const payload = await apiRequest(endpoint, { limit, page, ...params });
    const items = getItems(payload);
    all.push(...items);
    console.log(`${endpoint} page=${page} items=${items.length} total=${all.length}`);
    if (!hasMore(payload, page, items.length) || items.length === 0) break;
    await sleep(requestDelayMs);
  }
  return all;
}

async function paginateOffset(endpoint, params = {}, limit = 100) {
  const all = [];
  for (let offset = 0; ; offset += limit) {
    const payload = await apiRequest(endpoint, { limit, offset, ...params });
    const items = getItems(payload);
    all.push(...items);
    console.log(`${endpoint} offset=${offset} items=${items.length} total=${all.length}`);
    if (items.length < limit) break;
    await sleep(requestDelayMs);
  }
  return all;
}

function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function flattenOrderItems(orderDetails) {
  const rows = [];
  for (const wrapper of orderDetails) {
    const order = wrapper?.data || wrapper;
    const tracks = Array.isArray(order?.arrayPedidoRastreio) ? order.arrayPedidoRastreio : [];
    for (const track of tracks) {
      const items = Array.isArray(track?.pedidoItem) ? track.pedidoItem : [];
      for (const item of items) {
        rows.push({
          pedido_codigo: order.codigo,
          pedido_id: order.id,
          data_hora: order.dataHora,
          origem: order.origem,
          situacao: order.pedidoSituacao,
          situacao_descricao: order.pedidoSituacaoDescricao,
          valor_total_pedido: order.valorTotalFinal ?? order.valorTotal,
          rastreio_id: track.id,
          produto_id: item.produtoId,
          produto_nome: item.produtoNome,
          produto_titulo: item.produtoTitulo,
          codigo_pai: item.codigoPai,
          derivacao_id: item.produtoDerivacaoId,
          derivacao_codigo: item.produtoDerivacaoCodigo,
          derivacao_nome: item.produtoDerivacaoNome,
          categoria_id: item.categoria_id,
          categoria: item.categoria,
          quantidade: item.quantidade,
          valor_unitario: item.valorUnitario,
          valor_desconto: item.valorDesconto,
          valor_item: item.valorItem,
          valor_frete: item.valorFrete,
          link_produto: item.linkProduto,
        });
      }
    }
  }
  return rows;
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeCsv(file, rows) {
  if (!rows.length) {
    await fs.writeFile(file, "", "utf8");
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ];
  await fs.writeFile(file, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  await fs.mkdir(rawDir, { recursive: true });
  await fs.mkdir(derivedDir, { recursive: true });

  const orders = await paginate("/v2/site/pedido", {
    "dataHora[gte]": since,
    orderDirection: "asc",
  });
  await writeJson(path.join(rawDir, "orders-list.json"), orders);

  const orderDetails = [];
  for (const [index, order] of orders.entries()) {
    if (!order.codigo) continue;
    const detail = await apiRequest(`/v2/site/pedido/${encodeURIComponent(order.codigo)}`, {
      listaContatos: 0,
    });
    orderDetails.push(detail);
    console.log(`order-detail ${index + 1}/${orders.length} ${order.codigo}`);
    await sleep(requestDelayMs);
  }
  await writeJson(path.join(rawDir, "orders-detail.json"), orderDetails);

  const categories = await paginate("/v2/site/categoria");
  await writeJson(path.join(rawDir, "categories.json"), categories);

  const products = await paginate("/v2/site/produto", { tipoProduto: "1" });
  await writeJson(path.join(rawDir, "products.json"), products);

  const stock = await paginateOffset("/v1/listEstoque", { ativo: true });
  await writeJson(path.join(rawDir, "stock.json"), stock);

  const siteMenu = await paginate("/v2/site/menu");
  await writeJson(path.join(rawDir, "site-menu.json"), siteMenu);

  const itemRows = flattenOrderItems(orderDetails);
  await writeCsv(path.join(derivedDir, "order-items.csv"), itemRows);

  const summary = {
    since,
    exportedAt: new Date().toISOString(),
    orders: orders.length,
    orderDetails: orderDetails.length,
    orderItems: itemRows.length,
    categories: categories.length,
    products: products.length,
    stockRows: stock.length,
    siteMenu: siteMenu.length,
  };
  await writeJson(path.join(derivedDir, "summary.json"), summary);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
