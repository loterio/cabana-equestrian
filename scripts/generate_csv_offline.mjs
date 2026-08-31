import fs from "node:fs/promises";
import path from "node:path";

const rawDir = "data/magazord/raw";
const derivedDir = "data/magazord/derived";

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
  console.log("Lendo orders-detail.json offline...");
  const content = await fs.readFile(path.join(rawDir, "orders-detail.json"), "utf8");
  const orderDetails = JSON.parse(content);
  
  console.log(`Pedidos carregados: ${orderDetails.length}`);
  const itemRows = flattenOrderItems(orderDetails);
  console.log(`Itens extraídos: ${itemRows.length}`);
  
  console.log("Escrevendo order-items.csv...");
  await writeCsv(path.join(derivedDir, "order-items.csv"), itemRows);
  console.log("CSV gerado com sucesso offline!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
