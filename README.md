# Cabana Equestrian

Repositorio contextual para reunir analises, snippets CSS, referencias e decisoes estrategicas relacionadas ao ecommerce da Cabana Equestrian na plataforma Magazord.

Site: https://www.cabanaequestrian.com.br

## Objetivo

O foco inicial foi reorganizar a navegacao do site para melhorar CRO, performance percebida e clareza comercial da marca, com prioridade para a experiencia mobile. O projeto agora tambem centraliza analises de dados Magazord/GA4, recomendacoes de vitrine da home e snippets CSS aplicaveis no Magazord.

Este repositorio deve ajudar a decidir:

- quais itens merecem estar no menu principal;
- como agrupar categorias em dropdowns mais uteis;
- quais colecoes, campanhas e produtos devem receber destaque;
- quais ajustes de layout/snippet podem reduzir atrito na jornada;
- quais decisoes precisam ser validadas com dados de vendas, GA4, Search Console ou comportamento do usuario.

## Contexto Atual

A Cabana Equestrian e uma marca de moda com essencia equestre, foco forte em feminino, lifestyle, qualidade, autenticidade e colecoes sazonais. O site atual usa Magazord e possui menu de navegacao separado das categorias tecnicas de produto.

O primeiro ciclo de trabalho reorganizou o menu principal para uma arquitetura mais clara e orientada por intencao de compra:

- Novidades
- Calcas
- Feminino
- Colecoes
- Sale
- Acessorios

`Colecoes` agrupa entradas sazonais/editoriais como Inverno 2026, Verao 2025/2026 e Mais Vendidos.

Leia [HANDOFF.md](HANDOFF.md) antes de continuar uma nova frente. Ele registra o contexto completo, decisoes tomadas, dados usados, comandos e proximos passos.

## Frentes de Trabalho

- Arquitetura de menu e categorias de navegacao.
- Auditoria da home, hero e header.
- CRO em listagens, PDP e fluxo ate o carrinho.
- Performance de imagens, fontes, scripts e carrossel.
- Organizacao de snippets CSS/JS aplicaveis no Magazord.
- Registro de hipoteses, decisoes e resultados.

## Arquivos Principais

- [HANDOFF.md](HANDOFF.md): contexto de continuidade do projeto.
- [AGENTS.md](AGENTS.md): instrucoes operacionais para agentes/Codex neste repositorio.
- [analises/](analises/): auditorias, decisoes e recomendacoes com data.
- [css/](css/): snippets e consolidacao de CSS capturado do site.
- [integracoes/](integracoes/): notas de API Magazord e GA4.
- [scripts/](scripts/): exportacao, analise, recomendacao de produtos e captura de CSS.

## CSS Operacional

O arquivo que deve ficar sincronizado com a aba **HTML/Recursos > CSS** da Magazord e:

- [css/cabanaequestrian.css](css/cabanaequestrian.css)

O arquivo [css/cabana-site-consolidado.css](css/cabana-site-consolidado.css) e apenas uma captura/auditoria historica do CSS publico e dos estilos inline encontrados na home. Ele nao deve ser colado inteiro no painel.

## Comandos

Use sempre `rtk` neste ambiente.

```powershell
rtk npm run export:magazord -- --since=2026-01-01
rtk npm run export:ga4
rtk npm run analyze:menu
rtk node scripts/inspect-public-menu.mjs
rtk node scripts/recommend-home-products.mjs
rtk npm run capture:css
```

## Dados e Seguranca

Credenciais reais ficam em `secrets/` e devem permanecer fora do Git. Os exports brutos tambem sao ignorados. O repositorio versiona exemplos, scripts, analises, dados derivados e snippets necessarios para continuidade.

## Dados Uteis Para Proximas Analises

- Vendas por categoria/produto nos ultimos 90/180/365 dias.
- Receita, margem e estoque por linha.
- GA4: sessoes por dispositivo, landing pages, funil, buscas internas e eventos.
- Google Search Console: consultas, paginas com impressoes e CTR.
- Clarity/gravacoes/mapas de calor, se disponiveis.
- Lista de menus/categorias ativa no painel Magazord.
