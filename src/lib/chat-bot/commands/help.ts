import { BotResponse } from '../types'

/**
 * Handler para comando de ajuda
 */
export function handleHelp(): BotResponse {
  const helpMessage = `📚 **Comandos Disponíveis**\n\n` +
    `**💰 Vendas e Receitas:**\n` +
    `• "vendi o colar de pérolas"\n` +
    `• "vendi um produto por 140 reais que será pago mês que vem"\n` +
    `• "vendi produto em 3x de 50 reais"\n` +
    `• "venda de 200 reais todo mês"\n` +
    `• "recebi 500 reais de serviço"\n\n` +
    `**💸 Despesas:**\n` +
    `• "gastei 50 reais no supermercado"\n` +
    `• "paguei 200 reais de conta de luz hoje"\n\n` +
    `**📦 Estoque e Produtos:**\n` +
    `• "quantas argolas gota eu tenho"\n` +
    `• "tem estoque do colar?"\n` +
    `• "quantos produtos tem no estoque?"\n` +
    `• "reposição de 10 kit 5 pares de brincos"\n` +
    `• "repor 20 unidades de colar"\n` +
    `• "lista produtos"\n` +
    `• "procura produto colar"\n\n` +
    `**📊 Consultas Financeiras:**\n` +
    `• "qual meu lucro líquido esse mês"\n` +
    `• "lucro mês passado"\n` +
    `• "qual minhas receitas este mês"\n` +
    `• "quanto gastei esta semana"\n` +
    `• "mostra minhas despesas"\n\n` +
    `**📈 Insights e Análises:**\n` +
    `• "gera insights"\n` +
    `• "insights avançados"\n` +
    `• "análise financeira"\n` +
    `• "resumo financeiro"\n` +
    `• "situação financeira"\n` +
    `• "produtos mais vendidos"\n` +
    `• "top produtos"\n` +
    `• "produtos mais vendidos este mês"\n\n` +
    `**❓ Outros:**\n` +
    `• "ajuda" - Mostra esta mensagem\n\n` +
    `💡 **Dica:** Você pode mencionar valores, datas e quantidades naturalmente!\n` +
    `Exemplo: "vendi 3 unidades do colar por 400 reais que será pago dia 15"`

  return {
    message: helpMessage,
    type: 'info',
    data: { helpShown: true }
  }
}

