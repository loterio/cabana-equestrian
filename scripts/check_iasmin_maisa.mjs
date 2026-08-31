import fs from "node:fs";

const products = JSON.parse(fs.readFileSync("data/magazord/raw/products.json", "utf8"));
const stock = JSON.parse(fs.readFileSync("data/magazord/raw/stock.json", "utf8"));

const stockBySku = new Map();
for (const row of stock) {
  const current = stockBySku.get(row.produto) || 0;
  stockBySku.set(row.produto, current + Number(row.quantidadeDisponivelVenda || 0));
}

console.log("=== VERIFICAÇÃO DE CALÇA IASMIN E CAMISETE MAÍSA ===");

const foundIasmin = products.filter(p => p.nome.toLowerCase().includes("iasmin"));
const foundMaisa = products.filter(p => p.nome.toLowerCase().includes("maisa") || p.nome.toLowerCase().includes("maísa"));

console.log(`\nEncontrados com 'Iasmin': ${foundIasmin.length}`);
for (const prod of foundIasmin) {
  let totalStock = 0;
  const derivationsStock = [];
  for (const derivation of prod.derivacoes || []) {
    const qty = stockBySku.get(derivation.codigo) || 0;
    totalStock += qty;
    derivationsStock.push(`${derivation.nome}: ${qty}`);
  }
  console.log(`- Produto: ${prod.nome}`);
  console.log(`  Estoque Total: ${totalStock}`);
  console.log(`  Grade: ${derivationsStock.join(" | ")}`);
}

console.log(`\nEncontrados com 'Maísa/Maisa': ${foundMaisa.length}`);
for (const prod of foundMaisa) {
  let totalStock = 0;
  const derivationsStock = [];
  for (const derivation of prod.derivacoes || []) {
    const qty = stockBySku.get(derivation.codigo) || 0;
    totalStock += qty;
    derivationsStock.push(`${derivation.nome}: ${qty}`);
  }
  console.log(`- Produto: ${prod.nome}`);
  console.log(`  Estoque Total: ${totalStock}`);
  console.log(`  Grade: ${derivationsStock.join(" | ")}`);
}
