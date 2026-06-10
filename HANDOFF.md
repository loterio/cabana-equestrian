# Handoff - Cabana Equestrian

Data do contexto: 2026-05-11

## Contexto do projeto

Este repositorio e um workspace contextual para apoiar decisoes estrategicas, CRO, organizacao de menu, home, CSS e integracoes do ecommerce Cabana Equestrian na plataforma Magazord.

Site publico:

- https://www.cabanaequestrian.com.br

Painel usado pelo cliente:

- cabanaequestrian.painel.magazord.com.br

O objetivo principal da conversa foi reorganizar o site para melhorar conversao, principalmente no mobile. A marca tem foco em moda feminina com identidade equestre, colecoes sazonais, lifestyle e produtos de alto apelo visual.

## Dados e acessos configurados

As credenciais reais ficam em `secrets/` e nao devem ser impressas, commitadas ou copiadas para respostas.

Arquivos relevantes:

- `secrets/cabana.env`: arquivo central com variaveis da Cabana.
- `secrets/magazord.env`: exemplo/separacao Magazord, quando usado.
- `secrets/ga4-oauth-client.json`: OAuth Desktop para GA4.
- `secrets/ga4-oauth-token.json`: token OAuth salvo apos consentimento.
- `.env.example`, `secrets/*.example`: modelos sem segredos.

GA4:

- Property ID correto: `386651040`.
- Conta GA vista no painel: `72442152`, mas este nao e o property id.
- Service account foi bloqueada por politica da organizacao Google. A solucao usada foi OAuth Desktop.

Magazord:

- API oficial documenta leitura de menu por `GET /v2/site/menu`.
- Nao foi encontrado endpoint oficial documentado para alterar itens de menu por API.
- Alteracoes de menu foram feitas manualmente no painel Magazord.

## Comandos principais

Sempre executar comandos usando o prefixo `rtk`, conforme instrucao global do ambiente.

Exportar pedidos, produtos, estoque e menus da Magazord:

```powershell
rtk npm run export:magazord -- --since=2026-01-01
```

Exportar GA4:

```powershell
rtk npm run export:ga4
```

Analisar dados para menu:

```powershell
rtk npm run analyze:menu
```

Ver menu publicado no site:

```powershell
rtk node scripts/inspect-public-menu.mjs
```

Recomendar produtos para home:

```powershell
rtk node scripts/recommend-home-products.mjs
```

Capturar CSS publico do site:

```powershell
rtk npm run capture:css
```

## Menu definido

Depois da analise de vendas Magazord, GA4, busca interna e comportamento mobile, a estrutura recomendada e aplicada no painel foi:

```text
Novidades
Calcas
Feminino
Colecoes
  Inverno 2026
  Verao 2025/2026
  Mais Vendidos
Sale
Acessorios
```

Racional:

- `Calcas` precisa estar no primeiro nivel: e o maior motor de receita e busca.
- `Novidades` substitui `Lancamentos`, mantendo a pagina de lancamentos.
- `Sale` substitui `Liquida Cabana`, mantendo a pagina Sale Cabana.
- `Colecoes` agrupa intencoes sazonais e editoriais.
- `Todos Produtos`, `Masculino` e itens operacionais foram desativados do menu principal.

Observacao operacional:

- Para criar item no primeiro nivel no Magazord, nao selecionar item pai.
- Para criar dropdown, criar o pai e depois mover/duplicar os filhos ativos abaixo dele.
- Para linkar categorias internas, preferir campo `Pagina` via lupa em vez de `Link` manual.
- Depois de alterar o painel, limpar cache/publicar. O site publico pode demorar a refletir.

Analises relacionadas:

- `analises/2026-05-11-estrutura-menu-recomendada.md`
- `analises/2026-05-11-impacto-menu-mobile-cro.md`
- `analises/2026-05-11-menu-final-ga4-magazord.md`

## Dados consolidados usados

Magazord coletado desde 2026-01-01:

- 239 pedidos.
- 239 detalhes de pedido.
- 369 itens.
- 48 categorias.
- 964 produtos.
- 1342 linhas de estoque.

GA4 coletado:

- Mobile domina a compra e a navegacao.
- Mobile: 23.951 sessoes, R$ 44.269,32, 137 purchases, 1.205 add_to_cart, 541 checkouts.
- Desktop: 10.092 sessoes, R$ 2.960,70, 9 purchases.

Principais linhas de receita Magazord:

- Calcas: 93 pedidos, 102 qtd, R$ 26.399,83.
- Vestidos: 43 pedidos, 50 qtd, R$ 12.465,73.
- Blusas e Tops: 55 pedidos, 78 qtd, R$ 11.985,59.
- Inverno/Terceiras Pecas: 35 pedidos, 39 qtd, R$ 9.391,38.
- Acessorios: 21 pedidos, 33 qtd, R$ 4.054,48.
- Camisetes: 12 pedidos, 15 qtd, R$ 3.764,48.

Produto mais forte:

- `Calca Feminina Boot Cut Corcel`
- Magazord: 62 pedidos, 63 qtd, R$ 16.743,97.
- GA4: 2.982 views, 214 add_to_cart, 48 purchases, R$ 13.809,60.

Buscas internas importantes:

- `cal`
- `vest`
- `soft`
- `camis`
- `body`
- `t-shirt`
- `blusa`
- `saia`
- `cinto`

## Home e produtos recomendados

Foi criada uma lista recomendada de 36 produtos para home, cruzando:

- receita Magazord;
- quantidade de pedidos;
- receita GA4;
- compras GA4;
- add to cart;
- visualizacoes;
- estoque ativo;
- diversidade por tipo de produto.

Arquivo:

- `analises/2026-05-11-produtos-home-recomendados.md`

Script reproduzivel:

- `scripts/recommend-home-products.mjs`

Diretriz para ordenacao:

- Nao colocar produtos iguais ou muito parecidos lado a lado.
- Alternar calcas, vestidos, tops, terceira peca e acessorios.
- Manter `Calca Feminina Boot Cut Corcel` como primeira posicao.
- Se a home nao for facil de trocar, evitar produtos com estoque muito curto.

## CSS e UI de produto

Foi solicitado organizar todo CSS aplicado no site em um lugar.

Artefatos criados:

- `css/cabanaequestrian.css`
- `scripts/capture-site-css.mjs`
- `data/site-css/inventory.json`
- `data/site-css/raw/`
- `css/cabana-site-consolidado.css`
- `analises/2026-05-11-inventario-css-site.md`

CSS customizado publicado hoje:

- `https://cabanaequestrian.cdn.magazord.com.br/resources/cabanaequestrian.css`
- Tamanho capturado: 349 bytes.

Importante:

- A fonte operacional para sincronizar com a aba HTML/Recursos > CSS da Magazord e `css/cabanaequestrian.css`.
- O `css/cabana-site-consolidado.css` e inventario/versionamento, nao necessariamente um bloco para colar inteiro no Magazord.
- Nao copiar CSS base da plataforma Magazord para Site Builder sem necessidade.
- Preferir snippets pequenos e testaveis.

Botao comprar:

- O verde atual vem de `.button-buy` e `.valores-logados-vitrine .btn-comprar-vitrine`.
- Recomendacao: trocar verde por grafite/preto no PDP e por botao branco com borda grafite nas vitrines.
- Objetivo: manter contraste/conversao sem fazer o botao dominar a grade visual.

Snippet proposto:

- `css/cabana-produto-card-cro.css`

Analise relacionada:

- `analises/2026-05-11-ajuste-css-produto-cro.md`

## Arquivos e scripts principais

Integracoes:

- `integracoes/magazord-api.md`
- `integracoes/ga4-api.md`

Scripts:

- `scripts/magazord-export.mjs`
- `scripts/ga4-export.mjs`
- `scripts/analyze-menu-data.mjs`
- `scripts/inspect-public-menu.mjs`
- `scripts/recommend-home-products.mjs`
- `scripts/capture-site-css.mjs`
- `scripts/lib/env.mjs`

Dados derivados:

- `data/magazord/derived/order-items.csv`
- `data/magazord/derived/summary.json`
- `data/ga4/derived/*.csv`
- `data/site-css/inventory.json`

## Proximos passos recomendados

1. Validar no site publico se o menu novo permanece estavel apos cache/CDN.
2. Aplicar `css/cabana-produto-card-cro.css` como teste no CSS customizado da Magazord.
3. Conferir visual em mobile e desktop antes de expandir ajustes.
4. Montar a home com 30 a 40 produtos, seguindo a lista recomendada e alternancia visual.
5. Depois de 7 a 14 dias, comparar:
   - CTR nos cards da home;
   - add_to_cart;
   - purchase;
   - receita por item;
   - busca interna;
   - entrada por landing page mobile.
6. Revisar imagens e pesos do hero/home para performance percebida.
7. Se possivel, conectar Search Console e/ou Clarity para completar a leitura de CRO.

## Cuidados

- Nunca expor segredos em resposta.
- Nunca editar `secrets/*` salvo quando explicitamente pedido.
- Nao aplicar alteracoes destrutivas no menu sem orientacao do cliente.
- Antes de sugerir mudanca estrutural, verificar dados Magazord/GA4 quando possivel.
- Separar observacao visual, dado confirmado e hipotese estrategica.
- Registrar novas decisoes em `analises/` com data.
