# Integracao GA4 Data API

Objetivo: complementar a leitura da API Magazord com comportamento de navegacao, canais, dispositivos, paginas de entrada, eventos do funil e receita atribuida no GA4.

## Dados Necessarios

Para eu consultar automaticamente:

- `GA4_PROPERTY_ID`: ID numerico da propriedade GA4.
- Arquivo JSON OAuth Desktop salvo em `secrets/ga4-oauth-client.json`.
- Usuario usado no login OAuth com acesso a propriedade GA4.

Nao colar o JSON no chat. Salvar localmente em:

```text
secrets/ga4-oauth-client.json
```

E criar `secrets/ga4.env` ou usar o arquivo unificado `secrets/cabana.env`:

```env
GA4_PROPERTY_ID=123456789
GA4_OAUTH_CLIENT_JSON=secrets/ga4-oauth-client.json
GA4_OAUTH_TOKEN_JSON=secrets/ga4-oauth-token.json
GA4_START_DATE=2026-01-01
GA4_END_DATE=today
```

## Como Executar

```powershell
rtk node scripts/ga4-export.mjs --start=2026-01-01 --end=today
```

Na primeira execucao, o script abre o navegador para consentimento OAuth e salva o token local em `secrets/ga4-oauth-token.json`.

Arquivos gerados:

- `data/ga4/raw/*.json`
- `data/ga4/derived/*.csv`
- `data/ga4/derived/summary.json`

## Relatorios Coletados

- Visao geral por dispositivo.
- Canal/source-medium por dispositivo.
- Landing pages mobile.
- Paginas mais vistas.
- Categorias de itens GA4.
- Produtos GA4.
- Eventos do funil.
- Buscas internas, se o GA4 estiver capturando `searchTerm`.

## Para Decidir Menu

Os dados mais importantes sao:

- Mobile sessions por landing page.
- Receita e compras por landing page.
- `itemsViewed`, `itemsAddedToCart`, `itemsPurchased` e `itemRevenue` por categoria/produto.
- Eventos de busca interna para termos como calca, vestido, blusa, casaco, acessorio.
- Diferença entre categoria que vende na Magazord e categoria que recebe trafego no GA4.
