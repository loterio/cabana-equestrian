import fs from "node:fs";

const products = JSON.parse(fs.readFileSync("data/magazord/raw/products.json", "utf8"));
const stock = JSON.parse(fs.readFileSync("data/magazord/raw/stock.json", "utf8"));

const stockBySku = new Map();
for (const row of stock) {
  const current = stockBySku.get(row.produto) || 0;
  stockBySku.set(row.produto, current + Number(row.quantidadeDisponivelVenda || 0));
}

console.log("=== DETALHES DE ESTOQUE DE PRODUTOS LÍDERES ===");

const targets = [
  "Calça Feminina  Boot Cut Corcel",
  "Casaco Feminino Soft Laís",
  "Vestido Feminino Babado Alice",
  "Casaco Feminino Soft Lize",
  "Jaqueta Feminina Maxi Ônix",
  "Vestido Feminino Querência",
  "Vestido Feminino Emanuely",
  "Calça Feminina Boot Cut Bridão",
  "Chemise Feminina Bridão",
  "Calça Jeans Feminina Boot Cut Morgan ",
  "Regata Feminina Modeladora Zoe",
  "Camisete Feminina Sandra",
  "Calça Boot Cut Feminina Emanuely",
  "Blusa Feminina Melissa",
  "Blusa Feminina Grazi",
  "Calça Feminina Montaria Alice",
  "Bombacha Feminina Grazi",
  "Bombacha Feminina Xadrez Valentina"
];

for (const name of targets) {
  const prod = products.find(p => p.nome.trim() === name.trim());
  if (!prod) {
    console.log(`Produto não encontrado: ${name}`);
    continue;
  }
  
  let totalStock = 0;
  const derivationsStock = [];
  for (const derivation of prod.derivacoes || []) {
    const qty = stockBySku.get(derivation.codigo) || 0;
    totalStock += qty;
    derivationsStock.push(`${derivation.nome}: ${qty}`);
  }
  
  console.log(`\nProduto: ${prod.nome}`);
  console.log(`Estoque Total: ${totalStock}`);
  console.log(`Derivações: ${derivationsStock.join(" | ")}`);
}
