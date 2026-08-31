import { loadProjectEnv } from "./lib/env.mjs";
await loadProjectEnv();

const baseUrl = process.env.MAGAZORD_BASE_URL;
const auth = Buffer.from(
  `${process.env.MAGAZORD_TOKEN}:${process.env.MAGAZORD_PASSWORD || process.env.MAGAZORD_SENHA}`
).toString("base64");

async function main() {
  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/v2/site/pedido?limit=100&dataHora[gte]=2026-08-01`, {
    headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
  });
  const json = await res.json();
  const orders = json.data?.items || [];
  
  for (const o of orders) {
    const detailRes = await fetch(`${baseUrl.replace(/\/+$/, "")}/v2/site/pedido/${o.codigo}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
    });
    const detail = await detailRes.json();
    const d = detail.data || detail;
    console.log(`Pedido ${d.codigo} | ValorTotal: ${d.valorTotal} | ValorTotalFinal: ${d.valorTotalFinal} | Origem: ${d.origem} (${typeof d.origem}) | OrigemDesc: ${d.origemDescricao || d.origemNome || d.canal || 'N/A'} | Sit: ${d.pedidoSituacaoDescricao}`);
  }

  // Test endpoints for origens
  for (const ep of ["/v2/site/origem", "/v1/origem", "/v2/origem", "/v1/site/origem"]) {
    try {
      const testRes = await fetch(`${baseUrl.replace(/\/+$/, "")}${ep}`, {
        headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
      });
      console.log(`Endpoint ${ep}: status ${testRes.status}`);
      if (testRes.ok) {
        const text = await testRes.text();
        console.log(`Body ${ep}:`, text.slice(0, 500));
      }
    } catch (e) {}
  }
}

main().catch(console.error);
