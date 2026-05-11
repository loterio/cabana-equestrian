# Estrutura de Menu Recomendada

Data: 2026-05-11

Base usada:

- API Magazord, pedidos desde 2026-01-01.
- 239 pedidos coletados.
- 219 pedidos validos, removendo cancelados.
- 341 linhas de itens validas.
- Receita de itens validos: R$ 72.825,04.
- 48 categorias tecnicas.
- 964 produtos.
- 1.342 linhas de estoque.

## Leitura dos Dados

### Receita por agrupamento comercial

| Agrupamento | Pedidos | Quantidade | Receita |
| --- | ---: | ---: | ---: |
| Calcas | 93 | 102 | R$ 26.399,83 |
| Vestidos | 43 | 50 | R$ 12.465,73 |
| Blusas e Tops | 55 | 78 | R$ 11.985,59 |
| Inverno e Terceiras Pecas | 35 | 39 | R$ 9.391,38 |
| Acessorios | 21 | 33 | R$ 4.054,48 |
| Camisetes | 12 | 15 | R$ 3.764,48 |
| Bodies | 8 | 10 | R$ 1.879,32 |
| Saias | 4 | 4 | R$ 988,39 |
| Cintos | 2 | 2 | R$ 370,31 |
| Cabana Kids | 2 | 2 | R$ 194,80 |

### Categoria bruta registrada no item

| Categoria bruta | Pedidos | Quantidade | Receita |
| --- | ---: | ---: | ---: |
| Lancamentos | 109 | 158 | R$ 32.942,68 |
| Calca | 77 | 80 | R$ 21.090,58 |
| Outlet | 26 | 33 | R$ 5.106,60 |
| Mais Vendidos | 16 | 16 | R$ 4.822,12 |
| Acessorios | 5 | 6 | R$ 1.625,51 |

Leitura: `Lancamentos` aparece como categoria bruta dominante, mas ela mistura tipos de produto. Para menu, deve ser vitrine/campanha, nao substituto de categorias estruturais.

### Produtos mais fortes

| Produto | Pedidos | Quantidade | Receita |
| --- | ---: | ---: | ---: |
| Calca Feminina Boot Cut Corcel | 62 | 63 | R$ 16.743,97 |
| Vestido Feminino Babado Alice | 9 | 9 | R$ 2.852,59 |
| Casaco Feminino Soft Lize | 8 | 8 | R$ 1.932,77 |
| Calca Feminina Boot Cut Bridao | 6 | 6 | R$ 1.683,05 |
| Vestido Feminino Querencia | 5 | 5 | R$ 1.651,57 |
| Jaqueta Feminina Maxi Onix | 5 | 5 | R$ 1.597,84 |

Leitura: `Calca Boot Cut Corcel` e um produto-ancora. A navegacao deve facilitar acesso a calcas e permitir que campanhas/hero puxem esse produto ou linha.

## Diagnostico do Menu Atual

O primeiro nivel atual esta desalinhado com o peso comercial:

- `Casaco Soft/Casaco Fleece` e especifico demais para primeiro nivel.
- `Liquida Cabana` e util, mas deveria ser `Sale` ou `Outlet` com linguagem mais padrao de compra.
- `Inverno 2026` e sazonal e pode ficar dentro de `Colecoes` ou `Novidades`.
- `Lancamentos` tem peso alto e deve continuar nobre.
- `Mais Vendidos` tem valor, mas nao precisa disputar primeiro nivel.
- `Feminino` segue importante, mas precisa organizar melhor os filhos.
- `Acessorios` tem receita menor que Calcas, Vestidos, Blusas e Inverno; pode ser primeiro nivel no desktop se houver espaco, mas no mobile deve ser secundario.
- `Todos Produtos` nao deve ocupar espaco nobre.
- Existe item sem nome no menu publicado; remover.
- Corrigir divergencia `Inverno 2026` x pagina/titulo `Inverno 2025`.

## Recomendacao Principal

Menu mobile-first com 5 entradas:

1. `Novidades`
2. `Calcas`
3. `Feminino`
4. `Colecoes`
5. `Sale`

### 1. Novidades

Link principal: `/lancamentos`

Filhos:

- Ver todos os lancamentos -> `/lancamentos`
- Mais vendidos -> `/mais-vendidos`
- Verao 2025/2026 -> `/verao`
- Inverno 2026 -> `/inverno`
- Acessorios novos -> se houver pagina/filtro confiavel

Racional: `Lancamentos` concentra R$ 32.942,68 como categoria bruta e provavelmente recebe grande parte das campanhas. Deve continuar nobre, mas mais limpo.

### 2. Calcas

Link principal: `/calca`

Filhos:

- Todas as calcas -> `/calca`
- Boot Cut -> se houver pagina/filtro
- Skinny -> se houver pagina/filtro
- Mais vendidas em calcas -> se houver pagina/filtro

Racional: Calcas sao o maior agrupamento real, com R$ 26.399,83 e 93 pedidos. Merecem primeiro nivel, especialmente no mobile.

### 3. Feminino

Link principal: `/femininocabana`

Filhos:

- Blusas e Tops -> `/blusascabana`
- Vestidos -> `/vestido`
- Camisetes -> `/camisete`
- Bodies -> `/bodycabana`
- Saias -> `/saia`
- Shorts -> `/shorts`
- Casacos, Jaquetas e Coletes -> usar a melhor categoria disponivel entre `/jaqueta`, `/colete`, `/moletom`, `/poncho`
- Ver tudo feminino -> `/femininocabana`

Racional: `Feminino` vira guarda-chuva de descoberta. `Calcas` sai como atalho nobre por performance.

### 4. Colecoes

Link principal: idealmente uma pagina agregadora de colecoes; se nao existir, usar `/lancamentos` temporariamente.

Filhos:

- Verao 2025/2026 -> `/verao`
- Inverno 2026 -> `/inverno`
- Cabana Kids / Mae e Filha -> `/maeefilha`
- Mais Vendidos -> `/mais-vendidos`
- Acessorios -> `/acessorios`

Racional: colecoes e campanhas sazonais mudam. Mantendo em um dropdown, o primeiro nivel fica estavel e o painel fica mais facil de manter.

### 5. Sale

Link principal: `/sale-cabana`

Filhos:

- Liquida Cabana -> `/sale-cabana`
- Outlet -> usar pagina de outlet se existir
- Ultimas pecas -> se houver filtro/pagina
- Ate X% off -> somente se houver regra real

Racional: `Outlet` gerou R$ 5.106,60 como categoria bruta. E relevante, mas nao deve competir com categorias de compra de linha cheia.

## Variante para Desktop

Se houver espaco no desktop, pode usar 6 entradas:

1. `Novidades`
2. `Calcas`
3. `Feminino`
4. `Colecoes`
5. `Acessorios`
6. `Sale`

No mobile, manter `Acessorios` dentro de `Colecoes` ou como filho de `Feminino`, porque a receita atual nao justifica disputar primeiro nivel contra Calcas.

## O Que Remover ou Rebaixar

- Remover item vazio.
- Rebaixar `Casaco Soft/Casaco Fleece` para dentro de `Feminino` ou `Colecoes`.
- Rebaixar `Mais Vendidos` para dentro de `Novidades` e/ou `Colecoes`.
- Remover `Todos Produtos` do primeiro nivel; manter como `Ver tudo feminino` e/ou dentro do menu expandido.
- Evitar nomes com ano no primeiro nivel. Anos entram em `Colecoes`.

## Ordem Recomendada no Painel

1. Novidades
2. Calcas
3. Feminino
4. Colecoes
5. Sale

Desktop opcional:

6. Acessorios

## Observacao Sobre Aplicacao via API

A API publica da Magazord permite consultar menus (`GET /v2/site/menu`), mas nao apresenta endpoint documentado para alterar itens do menu. A aplicacao deve ser feita pelo painel Magazord, com backup visual/manual da arvore atual antes da mudanca.

## Medicao Pos-Implantacao

Comparar 14 dias antes vs. 14 dias depois:

- Receita mobile do site.
- Taxa de conversao mobile.
- Receita por sessao mobile.
- Entradas em `/calca`, `/lancamentos`, `/femininocabana`, `/sale-cabana`.
- Add-to-cart vindo de listagens.
- Participacao das calcas na receita.

Se `Calcas` ganhar clique mas nao add-to-cart, o problema sai do menu e passa para listagem/filtro/foto/ordenacao.
