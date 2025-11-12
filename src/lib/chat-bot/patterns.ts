// Padrões de reconhecimento de intenções

export const INTENT_PATTERNS: Record<string, RegExp[]> = {
  sell_product: [
    /vendi|vender|venda|vendido|vendemos|vendeu/i,
    /vendi\s+(um|uma|o|a|os|as)?/i,
    /vendido\s+(um|uma|o|a)/i,
    /realizei\s+uma\s+venda/i,
    /foi\s+vendido/i,
    /consegui\s+vender/i,
    /fiz\s+uma\s+venda/i,
    // Variações com pagamento futuro
    /vendi\s+(um|uma|o|a|os|as)?\s+(produto|item).*?(?:será\s+pago|sera\s+pago|ser\s+pago|receberei|receberá|recebera|receber|vou\s+receber|vai\s+receber|pra\s+receber|para\s+receber|a\s+receber)/i,
    /vendi\s+(um|uma|o|a|os|as)?\s+(produto|item).*?(?:mês\s+que\s+vem|mes\s+que\s+vem|próximo\s+mês|proximo\s+mes|semana\s+que\s+vem|próxima\s+semana|proxima\s+semana)/i,
  ],
  buy_product: [
    /comprei|comprar|compra|comprado|compramos|comprou/i,
    /adquiri|adquirir|adquirido/i,
    /fiz\s+uma\s+compra/i,
    /realizei\s+uma\s+compra/i,
    /foi\s+comprado/i,
    // Variações com pagamento futuro
    /comprei\s+(um|uma|o|a|os|as)?\s+(produto|item).*?(?:será\s+pago|sera\s+pago|ser\s+pago|vou\s+pagar|vai\s+pagar|pra\s+pagar|para\s+pagar|a\s+pagar)/i,
    /comprei\s+(um|uma|o|a|os|as)?\s+(produto|item).*?(?:mês\s+que\s+vem|mes\s+que\s+vem|próximo\s+mês|proximo\s+mes|semana\s+que\s+vem|próxima\s+semana|proxima\s+semana)/i,
  ],
  register_expense: [
    /gastei|gastar|gasto|despesa|despesas/i,
    /paguei|pagar|pagamento|pagou/i,
    /despesa\s+(de|com)/i,
    /paguei\s+(uma\s+)?conta/i,
    /paguei\s+(uma\s+)?despesa/i,
    /tive\s+(uma\s+)?despesa/i,
    /fiz\s+(um\s+)?pagamento/i,
    /realizei\s+(um\s+)?pagamento/i,
    /compra\s+de\s+/i,
    // Compras que não são produtos para estoque (têm valor monetário e não mencionam produto cadastrado)
    /comprei\s+(?:um|uma|o|a|os|as)?\s+(?:notebook|celular|computador|equipamento|máquina|maquina|ferramenta|serviço|material|item|produto)?.*?(?:de|por|valor|preço|preco)\s+\d+/i,
    /comprei\s+(?:um|uma|o|a|os|as)?\s+[^0-9]+(?:de|por|valor|preço|preco)\s+\d+/i,
  ],
  register_income: [
    /recebi|receber|receita|renda/i,
    /ganhei|ganhar|ganho/i,
    /entrada\s+(de|com)/i,
    /recebi\s+(uma\s+)?receita/i,
    /tive\s+(uma\s+)?receita/i,
    /fiz\s+(uma\s+)?receita/i,
    /realizei\s+(uma\s+)?receita/i,
  ],
  check_stock: [
    /(tem|tenho|há|existe)\s+(estoque|quantos|quantidade)/i,
    /estoque\s+(do|da|de)/i,
    /(quantos|quantas)\s+(tem|tenho|existe|há)/i,
    /falta\s+(estoque|produto)/i,
    /(quantos|quantas)\s+(.+?)\s+(tem|tenho|existe|há|eu tenho)/i, // "quantas argolas gota eu tenho"
    /(tenho|tem|há)\s+(quantos|quantas)\s+(.+?)/i, // "tenho quantas argolas"
    /(quantos|quantas)\s+(.+?)\s+(eu\s+)?(tenho|tem)/i, // "quantas argolas gota tenho"
  ],
  calculate_profit: [
    /(qual|quanto)\s+(é|foi|será)\s+(o|meu)?\s*(lucro|prejuízo|prejuizo)/i,
    /(lucro|prejuízo|prejuizo)\s+(líquido|liquido|bruto)/i,
    /(lucro|prejuízo|prejuizo)\s+(deste|desse|do|da|este|esse)\s*(mês|mes|semana|ano)/i,
    /(qual|quanto)\s+(meu|o)\s+(lucro|prejuízo|prejuizo)/i,
    /(mostra|mostre|exiba|exibir)\s+(lucro|prejuízo|prejuizo)/i,
    /(qual|quanto)\s+(é|foi)\s+(meu|o)\s+(lucro|prejuízo|prejuizo)\s+(líquido|liquido)\s+(deste|desse|este|esse)\s*(mês|mes)/i, // "qual meu lucro líquido esse mês"
  ],
  generate_insights: [
    /insights|insight|análise|analise|análises|analises/i,
    /(mostra|mostre|exiba)\s+(insights|insight|análise|analise)/i,
    /(quais|qual)\s+(são|é)\s+(os|as)\s+(insights|insight|análises|analises)/i,
    /(resumo|resumir)\s+(financeiro|financeira)/i,
    /(análise|analise)\s+(financeira|financeiro)/i,
    /(situação|situaçao)\s+(financeira|financeiro)/i,
  ],
  analyze_products: [
    /(produtos|produto)\s+(mais|top)\s+(vendidos|vendido)/i,
    /(mais|top)\s+(vendidos|vendido)/i,
    /(quais|qual)\s+(são|é)\s+(os|as|o|a)\s+(produtos|produto)\s+(mais|top)/i,
    /(ranking|rank)\s+(de|dos|das)\s+(produtos|produto)/i,
    /(melhores|melhor)\s+(produtos|produto)/i,
  ],
  check_revenue: [
    /(qual|quanto)\s+(é|foi|será|são|foram)\s+(minhas|minha|as|os|a|o)?\s*(receitas|receita)/i,
    /(receitas|receita)\s+(deste|desse|do|da|este|esse)\s*(mês|mes|semana|ano)/i,
    /(mostra|mostre|exiba|exibir)\s+(receitas|receita)/i,
    /(quanto|qual)\s+(ganhei|recebi|entrou)\s+(este|esse|deste|desse)\s*(mês|mes|semana|ano)/i,
    /(total\s+)?(de\s+)?(receitas|receita)/i,
  ],
  check_expenses: [
    /(qual|quanto)\s+(é|foi|será|são|foram)\s+(minhas|minha|as|os|a|o)?\s*(despesas|despesa|gastos|gasto)/i,
    /(despesas|despesa|gastos|gasto)\s+(deste|desse|do|da|este|esse)\s*(mês|mes|semana|ano)/i,
    /(mostra|mostre|exiba|exibir)\s+(despesas|despesa|gastos|gasto)/i,
    /(quanto|qual)\s+(gastei|paguei)\s+(este|esse|deste|desse)\s*(mês|mes|semana|ano)/i,
    /(total\s+)?(de\s+)?(despesas|despesa|gastos|gasto)/i,
  ],
  restock_product: [
    /reposição|resposição|repor|repositar/i,  // Adicionado "resposição" para erro de digitação
    /(adicionar|adiciona|adicionado)\s+(ao|no)\s+estoque/i,
    /(aumentar|aumenta|aumente)\s+estoque/i,
    /(colocar|coloca|colocou)\s+(no|ao|na)\s+estoque/i,
    /estoque\s+\+\s*\d+/i,
    /reponha|repor\s+(estoque|produto)/i,
  ],
  list_products: [
    /lista|listar|mostrar|ver\s+(produtos|todos)/i,
    /(quais|quais são)\s+os\s+produtos/i,
    /produtos\s+(disponíveis|cadastrados)/i,
  ],
  search_product: [
    /(procura|buscar|busca|encontra|tem)\s+(produto|produtos)/i,
    /(existe|tem)\s+(produto|algum)/i,
    /procurar\s+(por|o|a)/i,
  ],
  help: [
    /ajuda|help|comandos|o\s+que\s+posso/i,
    /como\s+(usar|funciona)/i,
    /(mostra|mostre)\s+comandos/i,
  ],
  create_task: [
    /(tarefa|lembrar|lembre|lembre-me|agendar|agenda|compromisso)/i,
    /(reunião|reuniao|reunião|reuniao)\s+(?:amanhã|amanha|hoje|depois|sexta|segunda|terça|quarta|quinta|sábado|domingo)/i,
    /(comprar|fazer|ligar|enviar|entregar|visitar|ir|ir\s+ao|ir\s+à)\s+.+?(?:amanhã|amanha|hoje|depois|sexta|segunda|terça|quarta|quinta|sábado|domingo|às|as|h)/i,
    /(serviço|servico)\s+(?:do|da|de)\s+.+?(?:sexta|segunda|terça|quarta|quinta|sábado|domingo)/i,
  ],
}

// Padrões para extração de entidades
// Aceita valores com vírgula (80,39) ou ponto (80.39) como separador decimal
export const MONEY_PATTERN = /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:[.,]\d{2})?)\s*(reais?|r\$|rs|real|R\$)/i
export const QUANTITY_PATTERN = /(\d+)\s*(unidades?|un|pcs?|peças?)/i
export const PRODUCT_NAME_PATTERNS = [
  /(?:vendi|comprei|produto|o|a|um|uma)\s+(.+?)(?:\s+(?:por|de|com|para)|$)/i,
  /(?:vendi|comprei)\s+(.+?)(?:\s+por|\s+de|\s+com|\s+para|$)/i,
  /produto\s+(.+?)(?:$|\s+(?:por|de|com|para))/i,
]

