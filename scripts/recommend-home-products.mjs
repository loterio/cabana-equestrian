import fs from "node:fs";

const orderItemsPath = "data/magazord/derived/order-items.csv";
const ga4ItemsPath = "data/ga4/derived/items.csv";
const productsPath = "data/magazord/raw/products.json";
const stockPath = "data/magazord/raw/stock.json";

function parseCsvLine(line) {
  const out = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      out.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  out.push(cell);
  return out;
}

function readCsv(file) {
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(values.map((value, index) => [headers[index], value]));
  });
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function classifyProduct(text) {
  const normalized = normalize(text);
  if (/calca/.test(normalized)) return "Calças";
  if (/vestido|jardineira/.test(normalized)) return "Vestidos";
  if (/camisete|camisa/.test(normalized)) return "Camisetes";
  if (/blusa|t-shirt|tshirt|cropped|regata|top/.test(normalized)) return "Blusas e Tops";
  if (/casaco|fleece|soft|jaqueta|colete|moletom|poncho|blazer|ruana/.test(normalized)) {
    return "Terceiras peças";
  }
  if (/body/.test(normalized)) return "Bodies";
  if (/saia/.test(normalized)) return "Saias";
  if (/short/.test(normalized)) return "Shorts";
  if (/cinto/.test(normalized)) return "Cintos";
  if (/bolsa/.test(normalized)) return "Bolsas";
  if (/bone|chapeu/.test(normalized)) return "Bonés";
  if (/colar|brinco|pulseira|passador|lenco|oculos|semi/.test(normalized)) return "Acessórios";
  if (/kids|mae|filha|infantil/.test(normalized)) return "Cabana Kids";
  return "Outros";
}

function productFamily(text) {
  const normalized = normalize(text)
    .replace(/\bfeminin[ao]\b/g, "")
    .replace(/\bcabana\b/g, "")
    .replace(/\b[0-9]{3,}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.split(" ").slice(0, 4).join(" ");
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function number(value) {
  return Number(value || 0);
}

const orderItems = readCsv(orderItemsPath);
const ga4Items = readCsv(ga4ItemsPath);
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
const stock = JSON.parse(fs.readFileSync(stockPath, "utf8"));

const productsByCode = new Map(products.map((product) => [String(product.codigo), product]));
const stockBySku = new Map();
for (const row of stock) {
  if (!row.ativo) continue;
  stockBySku.set(
    String(row.produto),
    (stockBySku.get(String(row.produto)) || 0) + number(row.quantidadeDisponivelVenda),
  );
}

const stockByProductCode = new Map();
for (const product of products) {
  let total = 0;
  for (const derivation of product.derivacoes || []) {
    if (!derivation.ativo) continue;
    total += stockBySku.get(String(derivation.codigo)) || 0;
  }
  stockByProductCode.set(String(product.codigo), total);
}

const ga4ByItemId = new Map();
for (const item of ga4Items) {
  ga4ByItemId.set(String(item.itemId), {
    views: number(item.itemsViewed),
    adds: number(item.itemsAddedToCart),
    purchases: number(item.itemsPurchased),
    revenue: number(item.itemRevenue),
  });
}

const validItems = orderItems.filter((row) => !["2", "14", "24"].includes(String(row.situacao)));
const byProduct = new Map();
for (const row of validItems) {
  const key = String(row.codigo_pai || row.produto_id || row.produto_nome);
  const product = productsByCode.get(key);
  const current = byProduct.get(key) || {
    code: key,
    name: product?.nome || row.produto_nome,
    link: row.link_produto,
    category: classifyProduct(`${product?.nome || row.produto_nome} ${row.categoria}`),
    family: productFamily(product?.nome || row.produto_nome),
    orders: new Set(),
    qty: 0,
    revenue: 0,
    discount: 0,
    productActive: product?.ativo !== false,
  };
  current.orders.add(row.pedido_codigo);
  current.qty += number(row.quantidade);
  current.revenue += number(row.valor_item);
  current.discount += number(row.valor_desconto);
  byProduct.set(key, current);
}

const max = {
  revenue: 1,
  orders: 1,
  ga4Revenue: 1,
  purchases: 1,
  adds: 1,
  views: 1,
};

const rows = [...byProduct.values()].map((row) => {
  const ga4 = ga4ByItemId.get(row.code) || {};
  const stockQty = stockByProductCode.get(row.code) || 0;
  return {
    ...row,
    ordersCount: row.orders.size,
    ga4Views: ga4.views || 0,
    ga4Adds: ga4.adds || 0,
    ga4Purchases: ga4.purchases || 0,
    ga4Revenue: ga4.revenue || 0,
    stockQty,
  };
});

for (const row of rows) {
  max.revenue = Math.max(max.revenue, row.revenue);
  max.orders = Math.max(max.orders, row.ordersCount);
  max.ga4Revenue = Math.max(max.ga4Revenue, row.ga4Revenue);
  max.purchases = Math.max(max.purchases, row.ga4Purchases);
  max.adds = Math.max(max.adds, row.ga4Adds);
  max.views = Math.max(max.views, row.ga4Views);
}

const scored = rows
  .filter((row) => row.productActive && row.stockQty > 0)
  .map((row) => {
    const stockFactor = row.stockQty >= 8 ? 1 : row.stockQty >= 4 ? 0.85 : 0.6;
    const score =
      (row.revenue / max.revenue) * 45 +
      (row.ordersCount / max.orders) * 25 +
      (row.ga4Revenue / max.ga4Revenue) * 15 +
      (row.ga4Purchases / max.purchases) * 8 +
      (row.ga4Adds / max.adds) * 5 +
      (row.ga4Views / max.views) * 2;
    return {
      ...row,
      score: score * stockFactor,
    };
  })
  .sort((a, b) => b.score - a.score || b.revenue - a.revenue);

const chosen = [];
const categoryCount = new Map();
const familyCount = new Map();

for (const item of scored) {
  if (chosen.length >= 42) break;
  const catCount = categoryCount.get(item.category) || 0;
  const famCount = familyCount.get(item.family) || 0;
  if (famCount >= 1) continue;
  if (catCount >= 8 && !["Calças", "Vestidos", "Blusas e Tops", "Terceiras peças"].includes(item.category)) {
    continue;
  }
  categoryCount.set(item.category, catCount + 1);
  familyCount.set(item.family, famCount + 1);
  chosen.push(item);
}

function pickNext(pool, lastCategory, usedCodes) {
  return pool.find((item) => item.category !== lastCategory && !usedCodes.has(item.code)) || pool.find((item) => !usedCodes.has(item.code));
}

const targetPattern = [
  "Calças",
  "Vestidos",
  "Blusas e Tops",
  "Terceiras peças",
  "Acessórios",
  "Camisetes",
  "Calças",
  "Saias",
  "Blusas e Tops",
  "Vestidos",
  "Acessórios",
  "Terceiras peças",
  "Calças",
  "Bodies",
  "Shorts",
  "Blusas e Tops",
  "Vestidos",
  "Acessórios",
];

const usedCodes = new Set();
const ordered = [];
for (let i = 0; ordered.length < Math.min(36, chosen.length); i += 1) {
  const preferred = targetPattern[i % targetPattern.length];
  const pool = chosen.filter((item) => item.category === preferred);
  const fallbackPool = chosen;
  const last = ordered[ordered.length - 1];
  const next = pickNext(pool, last?.category, usedCodes) || pickNext(fallbackPool, last?.category, usedCodes);
  if (!next) break;
  usedCodes.add(next.code);
  ordered.push(next);
}

fs.mkdirSync("analises", { recursive: true });
const markdown = [
  "# Produtos recomendados para a home",
  "",
  "Base: pedidos válidos Magazord desde 2026-01-01, dados GA4 e estoque ativo.",
  "",
  "| Ordem | Produto | Seção | Receita Magazord | Pedidos | Qtd. | Receita GA4 | Compras GA4 | Add carrinho GA4 | Estoque | Link |",
  "| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
  ...ordered.map((item, index) =>
    [
      index + 1,
      item.name,
      item.category,
      money(item.revenue),
      item.ordersCount,
      item.qty,
      money(item.ga4Revenue),
      item.ga4Purchases,
      item.ga4Adds,
      item.stockQty,
      item.link ? `/${item.link}` : "",
    ].join(" | "),
  ),
  "",
  "## Candidatos extras",
  "",
  ...scored
    .filter((item) => !usedCodes.has(item.code))
    .slice(0, 20)
    .map((item, index) => `${index + 1}. ${item.name} (${item.category}) - ${money(item.revenue)} Magazord, estoque ${item.stockQty}`),
  "",
].join("\n");

fs.writeFileSync("analises/2026-05-11-produtos-home-recomendados.md", markdown);

for (const item of ordered) {
  console.log(
    [
      ordered.indexOf(item) + 1,
      item.name,
      item.category,
      `Magazord=${money(item.revenue)}`,
      `pedidos=${item.ordersCount}`,
      `GA4=${money(item.ga4Revenue)}`,
      `estoque=${item.stockQty}`,
      item.link ? `/${item.link}` : "",
    ].join("\t"),
  );
}
