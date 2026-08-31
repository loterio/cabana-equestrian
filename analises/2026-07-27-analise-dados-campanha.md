# Análise de Vendas e Planejamento de Campanhas - Cabana Equestrian
**Data:** 27 de Julho de 2026  
**Objetivo:** Diagnosticar o cenário atual de tráfego/vendas e reestruturar as campanhas de tráfego pago (Meta Ads) para atingir a meta de R$ 20k/mês com orçamento de R$ 4k/mês.

---

## 1. Diagnóstico Geral do Tráfego Pago (Meta Ads)
Extraímos a performance histórica da conta de anúncios (`act_124829037612011`) de 2024 até o momento atual:

| Ano | Gasto | Faturamento (Pixel) | ROAS Geral | Compras | CTR Médio | CPC Médio |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2024** | R$ 28.337,48 | R$ 81.761,51 | **2,89x** | 266 | 1,81% | R$ 0,36 |
| **2025** | R$ 24.296,14 | R$ 79.114,14 | **3,26x** | 243 | 3,01% | R$ 0,30 |
| **2026** | R$ 17.830,97 | R$ 51.152,08 | **2,87x** | 156 | 3,39% | R$ 0,25 |

### Diagnóstico de Julho/2026 (Cenário de Queda):
*   **Investimento:** R$ 2.928,47  
*   **Retorno via Pixel:** R$ 4.123,92  
*   **ROAS de Julho:** **1,41x**  
*   **Compras:** 14  
*   **Contexto:** O custo por clique está excelente (CPC R$ 0,27, CTR 3,56%), mas a taxa de conversão final no site despencou. O dinheiro está gerando visitas, mas as visitas não estão convertendo em compras na mesma taxa que no resto do ano.

---

## 2. Diagnóstico de Vendas no Site (Magazord)
Análise dos dados reais de vendas capturados desde 01/01/2026 no ERP Magazord (Total de 337 pedidos válidos e **R$ 111.684,37** em receita de itens):

### Vendas por Categoria Comercial vs. Estoque Disponível:

| Categoria Comercial | Pedidos | Qtd. Vendida | Receita no Site | Ticket Médio | Estoque Ativo (Unidades) | Status de Estoque |
| :--- | :---: | :---: | :--- | :---: | :---: | :--- |
| **Calças** | 128 | 147 | R$ 37.447,41 | R$ 292,56 | 475 | **Gargalo de Grade** |
| **Inverno e 3ªs Peças** | 74 | 79 | R$ 19.615,10 | R$ 265,07 | 505 | **Fim de Estação** |
| **Blusas e Tops** | 71 | 104 | R$ 16.162,75 | R$ 227,64 | 1.473 | **Superávit de Estoque** |
| **Vestidos** | 54 | 63 | R$ 15.860,67 | R$ 293,72 | 283 | Saudável |
| **Camisetes** | 26 | 31 | R$ 7.838,67 | R$ 301,49 | 597 | Saudável |

### Principais Produtos Campeões de Venda (Top 5):
1.  **Calça Feminina Boot Cut Corcel:** R$ 21.793,13 (80 pedidos)  
    *   *Representa 20% das vendas totais do site.*
2.  **Casaco Feminino Soft Laís:** R$ 4.517,61 (18 pedidos)  
3.  **Vestido Feminino Babado Alice:** R$ 2.852,59 (9 pedidos)  
4.  **Casaco Feminino Soft Lize:** R$ 2.383,75 (10 pedidos)  
5.  **Jaqueta Feminina Maxi Ônix:** R$ 2.296,59 (7 pedidos)  

---

## 3. Por que o ROAS despencou em Julho? (Causas Raiz)
1.  **Saturação do Inverno:** O inverno está no fim e as campanhas ainda focam em casacos pesados de soft (Laís, Lize, Maxi Ônix). A atratividade dessa categoria cai drasticamente no final de julho.
2.  **Estoque Concentrado vs. Demanda Oposta:**
    *   A **Calça Corcel** é o maior motor de vendas, mas o estoque dela está reduzido ou pulverizado nos tamanhos intermediários, impedindo que a escala do tráfego converta.
    *   **Blusas e Tops** possuem o maior estoque disponível da loja (1.473 itens), mas trazem apenas 14% do faturamento. O tráfego pago não tem direcionado força para as blusas e peças de meia-estação.

---

## 4. Reestruturação Proposta de Campanhas (Orçamento: R$ 4.000/mês)
Divisão sugerida com foco em bater a meta de R$ 20.000 em vendas (exige ROAS de **5,0x** sobre o orçamento de R$ 4.000).

*   **Campanha 1: Giro e Meia-Estação (CBO) - R$ 70/dia (R$ 2.100/mês)**
    *   **Conjunto 1 (Calças com Grade):** Focar na promoção de calças alternativas à Corcel que possuem estoque robusto:
        *   *Calça Jeans Boot Cut Morgan* (68 unidades em estoque).
        *   *Bombacha Feminina Grazi* (39 unidades em estoque).
    *   **Conjunto 2 (Estoque Acumulado):** Promover looks e kits combinando Blusas/Tops com Camisetes (foco nas campeãs *Regata Zoe*, *Blusa Melissa* e *Blusa Grazi*). É a seção com 1.473 peças paradas no estoque.
*   **Campanha 2: Limpa Estoque / Liquidação de Inverno (ABO) - R$ 40/dia (R$ 1.200/mês)**
    *   **Criativos:** Banners e vídeos com foco em desconto progressivo nos casacos (*Soft Laís*, *Soft Lize*, *Alongado Ayla*).
    *   **Meta:** Liberar caixa e espaço físico para as próximas coleções de primavera/verão.
*   **Campanha 3: Remarketing Dinâmico e Retenção (ABO) - R$ 20/dia (R$ 700/mês)**
    *   **Público:** Visualizou conteúdo (14 dias), Adicionou ao Carrinho (30 dias) e Iniciou Finalização de Compra (30 dias), excluindo compradores dos últimos 30 dias.
    *   **Criativos:** Anúncio de catálogo dinâmico (DABA) mostrando exatamente os produtos visitados, com cupom de primeira compra `BEMVINDA10` ou frete grátis acima de determinado valor.
