# Cabana Equestrian - Instrucoes do Projeto

@C:\Users\MAISQ\.codex\RTK.md

## Contexto

Este repositorio e um espaco contextual para organizar analises, snippets CSS, referencias, auditorias e decisoes estrategicas relacionadas ao ecommerce Cabana Equestrian na plataforma Magazord.

Site publico: https://www.cabanaequestrian.com.br

Leia `HANDOFF.md` antes de continuar qualquer frente estrategica. Ele resume o contexto da conversa, dados coletados, decisoes tomadas, scripts disponiveis, estrutura de menu aplicada e proximos passos.

## Direcionamento Atual

O foco principal do projeto e melhorar organizacao do site, CRO, performance percebida e clareza comercial da marca. As decisoes devem considerar primeiro a experiencia mobile, porque o menu e a navegacao precisam funcionar com poucas opcoes principais e expansoes bem organizadas.

Estado atual do menu recomendado/aplicado no painel Magazord:

- Novidades
- Calcas
- Feminino
- Colecoes
- Sale
- Acessorios

`Colecoes` deve agrupar itens editoriais/sazonais como Inverno 2026, Verao 2025/2026 e Mais Vendidos.

## Principios de Analise

- Separar categorias comerciais de categorias tecnicas de cadastro.
- Priorizar intencao de compra no menu, nao apenas a arvore interna de produtos.
- Tratar o menu principal como um instrumento de conversao: rapido, escaneavel e orientado por demanda.
- Validar hipoteses com dados quando disponiveis: vendas por categoria/produto, receita, margem, estoque, buscas internas, GA4, Google Search Console e mapas de calor/gravacoes.
- Manter recomendacoes praticas para a realidade da plataforma Magazord, incluindo limites do painel, tema, snippets e customizacoes CSS/JS.
- Registrar decisoes com data, contexto, evidencias usadas e impacto esperado.

## Dados, Segredos e Integracoes

- Nunca imprimir, resumir ou expor valores de `secrets/*`.
- `secrets/cabana.env` e o arquivo central de ambiente da Cabana.
- GA4 usa OAuth Desktop salvo em `secrets/ga4-oauth-client.json` e `secrets/ga4-oauth-token.json`.
- O GA4 Property ID correto e `386651040`.
- A API Magazord foi usada para leitura/exportacao. Nao assumir que existe endpoint oficial para alterar menu; ate aqui a alteracao do menu foi feita pelo painel.
- Sempre que possivel, validar recomendacoes com dados em `data/magazord/derived/` e `data/ga4/derived/`.

## Comandos Operacionais

Use sempre o prefixo `rtk` nos comandos deste ambiente.

- Exportar Magazord: `rtk npm run export:magazord -- --since=2026-01-01`
- Exportar GA4: `rtk npm run export:ga4`
- Analisar menu: `rtk npm run analyze:menu`
- Inspecionar menu publicado: `rtk node scripts/inspect-public-menu.mjs`
- Recomendar produtos home: `rtk node scripts/recommend-home-products.mjs`
- Capturar CSS publico: `rtk npm run capture:css`

## Frentes Prioritarias

- Arquitetura de menu e categorias de navegacao.
- Home e hero acima da dobra.
- Listagens/categorias: filtros, ordenacao, banners e descoberta de produtos.
- PDP: descricao, tabela de medidas, prova social, variacoes, frete e WhatsApp.
- Performance: LCP, peso de imagens, scripts de terceiros, fontes, carrossel e estabilidade visual.
- Marca: posicionamento, tom de voz, colecoes e campanhas.

## CSS e Snippets Magazord

- O arquivo `css/cabana-site-consolidado.css` e inventario/versionamento do CSS publico capturado, nao necessariamente um bloco para colar inteiro no Magazord.
- Prefira snippets pequenos e reversiveis em `css/`.
- Para ajustes de botao/card de produto, usar como base `css/cabana-produto-card-cro.css`.
- Evite copiar CSS base da plataforma Magazord para o Site Builder sem necessidade.
- Depois de aplicar CSS no painel, limpar cache/publicar e validar no site publico.

## Produtos e Home

- A lista recomendada para vitrine da home esta em `analises/2026-05-11-produtos-home-recomendados.md`.
- O script reproduzivel e `scripts/recommend-home-products.mjs`.
- Priorizar alternancia visual: nao colocar produtos iguais, muito parecidos, mesma modelagem ou mesma cor lado a lado.
- `Calca Feminina Boot Cut Corcel` e o produto carro-chefe pelos dados coletados.

## Padrao para Arquivos

- Use Markdown para analises e decisoes.
- Use nomes claros, com data quando forem auditorias ou planos.
- Snippets aplicaveis no Magazord devem explicar onde entram: CSS customizado, JS, banner, menu, pagina, categoria ou produto.
- Evite conclusoes definitivas sem indicar se vieram de dados, observacao visual, HTML publico ou hipotese estrategica.
- Novas decisoes estrategicas devem ser registradas em `analises/AAAA-MM-DD-tema.md` ou no `HANDOFF.md` quando forem essenciais para continuidade.
