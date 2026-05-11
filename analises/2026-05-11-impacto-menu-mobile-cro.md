# Impacto Esperado - Reorganizacao do Menu

Data: 2026-05-11

## Base usada ate agora

Fonte de pedidos: `Exportar Consulta de Pedidos-2026-05-11 08_29_27.csv`

- Periodo: 2026-01-01 a 2026-05-10
- Pedidos validos: 219
- Receita valida: R$ 73.120,57
- Ticket medio: R$ 333,88
- Receita rastreada como mobile: R$ 42.154,82
- Receita rastreada como site: R$ 45.115,52
- Receita de pedidos manuais: R$ 27.925,15

## Problema atual

O menu atual mistura diferentes tipos de decisao no mesmo nivel:

- produto especifico: `Casaco Soft/Casaco Fleece`;
- campanha/promocao: `Liquida Cabana`;
- colecoes sazonais: `Inverno 2026`, `Verao 2025/2026`;
- navegacao estrutural: `Feminino`, `Acessorios`, `Todos Produtos`;
- item vazio no menu publicado;
- divergencia operacional: item `Inverno 2026` associado a titulo/pagina `Inverno 2025` no painel.

Para mobile, isso cria excesso de escolhas e dificulta a descoberta por intencao.

## Proposta de Primeiro Nivel

1. `Novidades`
2. `Feminino`
3. `Colecoes`
4. `Acessorios`
5. `Sale`

Itens como `Todos Produtos`, `Mais Vendidos`, `Inverno`, `Verao` e produtos especificos devem entrar como filhos/atalhos dentro de dropdowns, nao como todos competindo no topo.

## Impacto Esperado

Como ainda falta GA4 e itens dos pedidos por categoria, esta e uma estimativa conservadora, nao uma medicao fechada.

Hipotese principal: reduzir escolha inicial no menu mobile aumenta a taxa de clique para categorias relevantes e reduz busca/desistencia na home.

Faixas esperadas para 30 dias apos implantacao:

| Metrica | Impacto esperado |
| --- | ---: |
| CTR do menu mobile para categorias/colecoes | +10% a +25% |
| Visualizacoes de categoria vindas do menu | +8% a +20% |
| Add-to-cart vindo de listagens | +3% a +8% |
| Receita do site mobile | +2% a +6% |
| Receita total, incluindo manual | +1% a +4% |

Aplicando a faixa sobre a receita valida observada:

- Receita do site no periodo analisado: R$ 45.115,52
- Potencial incremental conservador no site: R$ 902 a R$ 2.707 no periodo equivalente
- Receita mobile rastreada: R$ 42.154,82
- Potencial incremental mobile conservador: R$ 843 a R$ 2.529 no periodo equivalente

Leitura: o ganho direto tende a ser moderado, mas a mudanca tem alta relacao custo/beneficio porque reduz atrito em uma area muito exposta e quase sem risco se os links forem mantidos.

## Riscos

- Se algum item atual tiver alta receita propria, sua remocao do primeiro nivel pode reduzir acesso. Isso precisa ser checado com GA4 ou API de itens/pedidos.
- Se o dropdown mobile do tema Magazord for pouco claro, agrupar demais pode esconder caminhos importantes.
- Mudanca em periodo de campanha forte pode confundir comparacao antes/depois.

## Como Medir

Janela minima: 14 dias antes vs. 14 dias depois, idealmente 30 vs. 30.

Eventos/dimensoes:

- GA4: `session_start`, `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`.
- Dimensoes: dispositivo, landing page, source/medium, page path, item category.
- Magazord: pedidos, itens, categorias, origem, dispositivo, ticket, forma de pagamento.
- Search Console: paginas de categoria e consultas relacionadas.

Indicadores principais:

- Receita do site mobile.
- Taxa de conversao mobile.
- Receita por sessao mobile.
- Add-to-cart por visualizacao de categoria.
- Participacao de categorias/colecoes no total de pedidos.
- Cliques/entradas nas paginas ligadas aos novos itens do menu.

## Aplicacao Direta

Pela documentacao publica da API Magazord, `Menu do Site` possui endpoint de consulta (`GET /v2/site/menu`), mas nao foi identificado endpoint documentado para criar/alterar itens de menu.

Conclusao operacional:

- Consigo auditar e comparar o menu via API.
- Nao devo aplicar alteracao direta por API sem endpoint documentado ou confirmacao do suporte.
- A aplicacao segura deve ser pelo painel Magazord, com backup manual/export atual antes da mudanca.

## Proximo Passo

Executar a API Magazord com credenciais seguras em `secrets/magazord.env` para obter itens de pedidos e receita por categoria. So depois disso fechar a ordem final dos dropdowns.
