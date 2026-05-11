import fs from "node:fs";

const csvPath = "data/magazord/derived/order-items.csv";

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

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function classifyItem(row) {
  const text = normalize(
    `${row.produto_nome} ${row.produto_titulo} ${row.link_produto} ${row.categoria}`,
  );
  if (/calca/.test(text)) return "Calcas";
  if (/vestido|jardineira/.test(text)) return "Vestidos";
  if (/saia/.test(text)) return "Saias";
  if (/short/.test(text)) return "Shorts";
  if (/body/.test(text)) return "Bodies";
  if (/camisete|camisa/.test(text)) return "Camisetes";
  if (/blusa|t-shirt|tshirt|cropped|regata/.test(text)) return "Blusas e Tops";
  if (/casaco|fleece|soft|jaqueta|colete|moletom|poncho|blazer|ruana/.test(text)) {
    return "Inverno e Terceiras Pecas";
  }
  if (/cinto/.test(text)) return "Cintos";
  if (/bone|chapeu/.test(text)) return "Bones";
  if (/bolsa/.test(text)) return "Bolsas";
  if (/semi|joia|colar|brinco|pulseira|passador|lenco|oculos/.test(text)) {
    return "Acessorios";
  }
  if (/kids|mae|filha|infantil/.test(text)) return "Cabana Kids";
  return row.categoria || "Outros";
}

function aggregate(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    const current = map.get(key) || {
      orders: new Set(),
      qty: 0,
      revenue: 0,
      discount: 0,
      itemLines: 0,
    };
    current.orders.add(row.pedido_codigo);
    current.qty += Number(row.quantidade || 0);
    current.revenue += Number(row.valor_item || 0);
    current.discount += Number(row.valor_desconto || 0);
    current.itemLines += 1;
    map.set(key, current);
  }
  return [...map.entries()]
    .map(([key, value]) => ({
      key,
      orders: value.orders.size,
      qty: value.qty,
      revenue: value.revenue,
      discount: value.discount,
      itemLines: value.itemLines,
      aov: value.revenue / value.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function printSection(title, rows, limit = rows.length) {
  console.log(`\n${title}`);
  for (const row of rows.slice(0, limit)) {
    console.log(
      [
        row.key,
        `pedidos=${row.orders}`,
        `qtd=${row.qty}`,
        `receita=${money(row.revenue)}`,
        `ticket=${money(row.aov)}`,
      ].join("\t"),
    );
  }
}

const allItems = readCsv(csvPath);
const validItems = allItems.filter((row) => !["2", "14", "24"].includes(String(row.situacao)));
const totalRevenue = validItems.reduce((sum, row) => sum + Number(row.valor_item || 0), 0);
const orders = new Set(validItems.map((row) => row.pedido_codigo));

console.log(
  JSON.stringify(
    {
      validItemLines: validItems.length,
      validOrders: orders.size,
      itemRevenue: totalRevenue,
      itemRevenueFormatted: money(totalRevenue),
    },
    null,
    2,
  ),
);

printSection("COMERCIAL", aggregate(validItems, classifyItem));
printSection("CATEGORIA_BRUTA_ITEM", aggregate(validItems, (row) => row.categoria || "(vazio)"));
printSection("PRODUTOS_TOP_30", aggregate(validItems, (row) => row.produto_nome), 30);

const products = JSON.parse(fs.readFileSync("data/magazord/raw/products.json", "utf8"));
const stock = JSON.parse(fs.readFileSync("data/magazord/raw/stock.json", "utf8"));
const stockBySku = new Map();
for (const row of stock) {
  const current = stockBySku.get(row.produto) || 0;
  stockBySku.set(row.produto, current + Number(row.quantidadeDisponivelVenda || 0));
}

const activeCatalog = [];
for (const product of products) {
  for (const derivation of product.derivacoes || []) {
    const qty = stockBySku.get(derivation.codigo) || 0;
    activeCatalog.push({
      product: product.nome,
      sku: derivation.codigo,
      qty,
      text: `${product.nome} ${derivation.nome}`,
    });
  }
}

const catalogByClass = new Map();
for (const item of activeCatalog) {
  const key = classifyItem({
    produto_nome: item.product,
    produto_titulo: item.text,
    link_produto: item.sku,
    categoria: "",
  });
  const current = catalogByClass.get(key) || { skus: 0, stock: 0 };
  current.skus += 1;
  current.stock += item.qty;
  catalogByClass.set(key, current);
}

console.log("\nESTOQUE_CATALOGO_ATIVO");
for (const [key, value] of [...catalogByClass.entries()].sort((a, b) => b[1].stock - a[1].stock)) {
  console.log([key, `skus=${value.skus}`, `estoque=${value.stock}`].join("\t"));
}
