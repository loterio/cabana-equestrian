# Ajuste CSS e produto card CRO

## CSS aplicado hoje

Foi criada uma captura reproduzivel do CSS publico:

- Inventario: `analises/2026-05-11-inventario-css-site.md`
- CSS consolidado: `css/cabana-site-consolidado.css`
- Raw da captura: `data/site-css/raw/`

O CSS customizado publicado da Cabana esta em:

- `https://cabanaequestrian.cdn.magazord.com.br/resources/cabanaequestrian.css`

Hoje ele tem poucos ajustes: variaveis de cor, selo Ebit/mobile e ajuste de icone Pix. O restante vem majoritariamente da plataforma Magazord e de blocos inline da home.

## Botao comprar

O verde atual vem principalmente de:

- `.button-buy` no CSS principal da Magazord.
- `.valores-logados-vitrine .btn-comprar-vitrine` no CSS de landing/vitrine.

Recomendacao:

- Produto detalhe/PDP: botao cheio em preto/grafite, mantendo alto contraste.
- Vitrine/home: botao branco com borda grafite, ficando menos agressivo que o verde.
- Hover: preencher em grafite.
- Evitar dourado cheio no botao principal, porque pode perder contraste dependendo da tela e fica mais decorativo que funcional.

Snippet proposto:

- `css/cabana-produto-card-cro.css`

## Hierarquia dos cards

Ordem visual recomendada em cards de home:

1. Foto do produto limpa e com area consistente.
2. Nome do produto em ate 2 linhas.
3. Preco principal mais forte.
4. Parcelamento/Pix em texto menor.
5. Botao de compra discreto.

O objetivo e deixar o produto vender pela foto, nome e preco, sem o botao verde dominar a grade inteira.
