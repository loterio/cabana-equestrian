# Integracao Magazord API

Documentacao oficial: https://docs.api.magazord.com.br/

Spec OpenAPI: https://docs.api.magazord.com.br/schemas/openapi.yaml

## Autenticacao

A API usa Basic Auth.

- Username: token recebido da Magazord.
- Password: senha recebida da Magazord.
- Header: `Authorization: Basic base64(token:senha)`.

Base URL esperada para a Cabana:

```text
https://cabanaequestrian.painel.magazord.com.br/api/
```

Caso a Magazord informe outra URL, usar a URL informada pelo suporte.

## Credenciais Necessarias

Pedir ao suporte da Magazord:

- Token da API.
- Senha/secret da API.
- URL base da loja/painel para API.
- Confirmacao se existe whitelist de IP ou liberacao por origem.

Nao colar credenciais no chat e nao salvar em arquivos versionados. Usar variaveis de ambiente ou um arquivo local dentro de `secrets/`.

## Endpoints Prioritarios Para CRO

| Uso | Metodo | Endpoint |
| --- | --- | --- |
| Lista de pedidos | GET | `/v2/site/pedido` |
| Pedido detalhado com itens | GET | `/v2/site/pedido/{codigoPedido}` |
| Categorias tecnicas | GET | `/v2/site/categoria` |
| Produtos | GET | `/v2/site/produto` |
| Produto completo | POST | `/v3/produtos/query` |
| Estoque | GET | `/v1/listEstoque` |
| Menu do site | GET | `/v2/site/menu` |
| Produtos frontend | GET | `/v2/site/frontend/produto/{loja}` |

O endpoint de pedido detalhado retorna `arrayPedidoRastreio[].pedidoItem[]`, com produto, derivacao, quantidade, valor, categoria, link do produto e dados de item. Esse e o dado que faltava no CSV exportado pelo painel para decidir categorias/menu por receita.

## Como Executar o Coletor

Opção recomendada: preencher `secrets/magazord.env`.

```env
MAGAZORD_BASE_URL=https://cabanaequestrian.painel.magazord.com.br/api/
MAGAZORD_TOKEN=...
MAGAZORD_PASSWORD=...
```

Depois executar:

```powershell
rtk node scripts/magazord-export.mjs --since=2026-01-01
```

Arquivos gerados:

- `data/magazord/raw/orders-list.json`
- `data/magazord/raw/orders-detail.json`
- `data/magazord/raw/categories.json`
- `data/magazord/raw/products.json`
- `data/magazord/raw/stock.json`
- `data/magazord/raw/site-menu.json`
- `data/magazord/derived/order-items.csv`
- `data/magazord/derived/summary.json`

## Cuidados

- O endpoint de listagem de pedidos nao traz itens completos; para itens, buscar cada pedido por codigo.
- O limite maximo comum e `100`, entao a coleta precisa paginar.
- Pedidos cancelados devem ser filtrados na analise, nao necessariamente na coleta.
- Tracking de origem deve ser tratado com cautela, porque o CSV atual mostrou muitos campos vazios e UTMs fragmentadas.
