# Menu Final Recomendado - GA4 + Magazord

Data: 2026-05-11

## Fontes

- Magazord API: pedidos, itens, categorias, produtos e estoque desde 2026-01-01.
- GA4 Data API: comportamento, trafego, funil, produtos, categorias e buscas internas desde 2026-01-01.
- Site publicado: menu/header atual e links publicos.

## Leitura Executiva

A estrutura ideal do menu deve ser mobile-first e orientada por intencao. Os dados mostram que:

- Mobile domina o site: 23.951 sessoes e R$ 44.269,32 no GA4.
- Desktop teve 10.092 sessoes, mas apenas R$ 2.960,70 em receita no GA4.
- `Calca` e a maior intencao comercial e de busca:
  - Magazord: R$ 26.399,83, 93 pedidos, 102 unidades.
  - GA4 busca interna: termos de calca somam 1.270 eventos.
  - Produto lider: `Calca Feminina Boot Cut Corcel`, R$ 16.743,97 na Magazord e R$ 13.809,60 no GA4.
- `Lancamentos` e forte como vitrine/campanha:
  - GA4: R$ 22.969,30, 102 itens comprados.
  - Magazord categoria bruta: R$ 32.942,68.
- `Vestidos`, `Blusas e Tops` e `Inverno/Terceiras Pecas` sao os proximos agrupamentos comerciais fortes.
- `Acessorios` tem valor, mas nao justifica primeiro nivel mobile contra Calcas, Novidades e Feminino.

## Primeiro Nivel Recomendado

### Mobile

1. `Novidades`
2. `Calcas`
3. `Feminino`
4. `Colecoes`
5. `Sale`

### Desktop

Se houver espaco horizontal sem poluir o header:

1. `Novidades`
2. `Calcas`
3. `Feminino`
4. `Colecoes`
5. `Acessorios`
6. `Sale`

Se desktop e mobile compartilharem exatamente o mesmo menu, usar a versao mobile com 5 itens.

## Estrutura por Secao

### 1. Novidades

Link principal: `/lancamentos`

Itens:

| Label | Link | Papel |
| --- | --- | --- |
| Ver todos os lancamentos | `/lancamentos` | Vitrine principal de novidade |
| Mais vendidos | `/mais-vendidos` | Prova social e atalho para indecisos |
| Verao 2025/2026 | `/verao` | Campanha sazonal atual |
| Inverno 2026 | `/inverno` | Campanha sazonal, mas corrigir titulo/pagina |
| Calca Boot Cut Corcel | `/calca-feminina-boot-cut-corcel` | Produto ancora, opcional como destaque visual do dropdown |

Racional: `Lancamentos` vende e recebe muito comportamento de produto, mas deve ser apresentado como entrada editorial/comercial, nao como categoria confusa.

### 2. Calcas

Link principal: `/calca`

Itens:

| Label | Link | Papel |
| --- | --- | --- |
| Todas as calcas | `/calca` | Categoria principal |
| Boot Cut | criar pagina/filtro se possivel | Principal subintencao |
| Skinny | criar pagina/filtro se possivel | Subintencao relevante |
| Bombachas | criar pagina/filtro se possivel | Termo aparece em landing pages/produtos |
| Calca Boot Cut Corcel | `/calca-feminina-boot-cut-corcel` | Produto ancora |

Racional: Calcas sao o maior agrupamento por receita e a maior busca interna. Merecem primeiro nivel, nao apenas filho de Feminino.

### 3. Feminino

Link principal: `/femininocabana`

Itens:

| Label | Link | Papel |
| --- | --- | --- |
| Ver tudo feminino | `/femininocabana` | Guarda-chuva |
| Blusas e Tops | `/blusascabana` | Forte em estoque e receita |
| Vestidos | `/vestido` | Segundo maior agrupamento de receita |
| Camisetes | `/camisete` | Ticket alto e busca por camisa/camisete |
| Bodies | `/bodycabana` | Busca interna relevante |
| Casacos e Jaquetas | `/jaqueta` ou `/casaco-soft-casaco-fleece` | Inverno/terceiras pecas |
| Saias | `/saia` | Secundario |
| Shorts | `/shorts` | Secundario |

Racional: Feminino deve ser o mapa completo do catalogo. Calcas sai do guarda-chuva porque performa acima do restante.

### 4. Colecoes

Link principal: se existir pagina agregadora, usar ela. Caso contrario, usar `/lancamentos` temporariamente.

Itens:

| Label | Link | Papel |
| --- | --- | --- |
| Verao 2025/2026 | `/verao` | Sazonal |
| Inverno 2026 | `/inverno` | Sazonal, corrigir page title |
| Cabana Kids / Mae e Filha | `/maeefilha` | Linha especifica |
| Mais Vendidos | `/mais-vendidos` | Prova social |
| Acessorios | `/acessorios` | Secundario no mobile |

Racional: itens com ano/campanha mudam. Agrupar em Colecoes deixa o primeiro nivel mais estavel.

### 5. Sale

Link principal: `/sale-cabana`

Itens:

| Label | Link | Papel |
| --- | --- | --- |
| Liquida Cabana | `/sale-cabana` | Promocao principal |
| Outlet | usar pagina de outlet se existir | Categoria bruta relevante |
| Ultimas pecas | criar pagina/filtro se possivel | Urgencia |
| Ate 60% OFF | somente se a regra estiver ativa | Oferta explicita |

Racional: `sale-cabana` tem boa eficiencia como landing page mobile: 127 sessoes e R$ 1.274,59 em receita, acima de varias categorias com mais trafego.

### 6. Acessorios, opcional no desktop

Link principal: `/acessorios`

Itens:

| Label | Link | Papel |
| --- | --- | --- |
| Ver todos acessorios | `/acessorios` | Guarda-chuva |
| Cintos | `/cinto` | Termo de busca e categoria |
| Semi-joias | `/semi-joias` | Receita em colar/pulseira |
| Bolsas | `/bolsas` | Secundario |
| Bones | `/bone` | Secundario |
| Oculos | criar/corrigir link se necessario | Item atual sem link no menu |

Racional: bom para desktop se couber, mas no mobile deve ficar dentro de `Colecoes` ou abaixo do primeiro grupo.

## O Que Alterar no Menu Atual

Remover/rebaixar do primeiro nivel:

- `Casaco Soft/Casaco Fleece`: mover para `Feminino > Casacos e Jaquetas` ou `Colecoes > Inverno`.
- `Inverno 2026`: mover para `Colecoes`.
- `Mais Vendidos`: mover para `Novidades` e/ou `Colecoes`.
- `Todos Produtos`: remover do primeiro nivel. Usar `Ver tudo feminino` dentro de Feminino.
- Item sem nome: excluir.

Manter ou criar:

- `Novidades` apontando para `/lancamentos`.
- `Calcas` apontando para `/calca`.
- `Feminino` apontando para `/femininocabana`.
- `Colecoes` como agrupador.
- `Sale` apontando para `/sale-cabana`.

Corrigir:

- `Inverno 2026` hoje aparece com pagina/titulo `Inverno 2025` em dados publicos. Atualizar titulo/label para consistencia.
- `Oculos` aparece sem link no menu de Acessorios. Corrigir link ou ocultar ate haver pagina.

## Evidencias Numericas

### GA4 por dispositivo

| Dispositivo | Sessoes | Receita | Compras | Add to carts | Checkouts |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobile | 23.951 | R$ 44.269,32 | 137 | 1.205 | 541 |
| Desktop | 10.092 | R$ 2.960,70 | 9 | 95 | 76 |
| Tablet | 31 | R$ 0,00 | 0 | 0 | 0 |

### Magazord por agrupamento comercial

| Agrupamento | Pedidos | Qtd | Receita |
| --- | ---: | ---: | ---: |
| Calcas | 93 | 102 | R$ 26.399,83 |
| Vestidos | 43 | 50 | R$ 12.465,73 |
| Blusas e Tops | 55 | 78 | R$ 11.985,59 |
| Inverno e Terceiras Pecas | 35 | 39 | R$ 9.391,38 |
| Acessorios | 21 | 33 | R$ 4.054,48 |
| Camisetes | 12 | 15 | R$ 3.764,48 |

### Busca interna GA4

| Intencao | Eventos | Usuarios |
| --- | ---: | ---: |
| Calca | 1.270 | 602 |
| Vestido | 641 | 292 |
| Camisa/Camisete | 356 | 187 |
| Soft | 316 | 182 |
| Blusa | 228 | 90 |
| Body | 214 | 68 |
| T-shirt | 155 | 31 |
| Saia | 85 | 57 |
| Cinto | 69 | 53 |

## Aplicacao

A API oficial Magazord documenta apenas `GET /v2/site/menu` para menus. Nao ha endpoint documentado para criar/editar itens de menu.

Por isso:

- posso auditar e validar via API;
- nao vou aplicar alteracoes por endpoint nao documentado em producao;
- a aplicacao deve ser feita no painel Magazord, em `Itens do Menu`, usando a estrutura acima.

## Teste Menor Antes de Aplicar Tudo

Teste recomendado de menor risco:

1. Criar `Calcas` no primeiro nivel apontando para `/calca`.
2. Remover `Todos Produtos` do primeiro nivel.
3. Manter o restante por 7 dias.

Medir:

- sessoes e cliques em `/calca`;
- receita mobile;
- add-to-cart vindo de listagem;
- buscas por `calca`.

Se melhorar ou ficar neutro, aplicar a reorganizacao completa.
