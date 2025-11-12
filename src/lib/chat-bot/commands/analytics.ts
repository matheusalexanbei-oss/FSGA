import { BotResponse, ParsedCommand } from '../types'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'

const supabase = createClient()

/**
 * Calcula lucro líquido por período
 */
export async function calculateNetProfit(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  const { date, category } = command.entities
  
  try {
    
    // Determinar período
    const today = new Date()
    let startDate: Date
    let endDate: Date = today
    let periodLabel = 'hoje'
    
    // Extrair período do comando
    const commandLower = command.raw.toLowerCase()
    
    if (commandLower.includes('este mês') || commandLower.includes('esse mês') || commandLower.includes('mes atual')) {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      periodLabel = 'este mês'
    } else if (commandLower.includes('mês passado') || commandLower.includes('mes anterior')) {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      endDate = new Date(today.getFullYear(), today.getMonth(), 0)
      periodLabel = 'mês passado'
    } else if (commandLower.includes('esta semana') || commandLower.includes('nessa semana')) {
      const dayOfWeek = today.getDay()
      startDate = new Date(today)
      startDate.setDate(today.getDate() - dayOfWeek)
      startDate.setHours(0, 0, 0, 0)
      periodLabel = 'esta semana'
    } else if (commandLower.includes('semana passada')) {
      const dayOfWeek = today.getDay()
      startDate = new Date(today)
      startDate.setDate(today.getDate() - dayOfWeek - 7)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(today)
      endDate.setDate(today.getDate() - dayOfWeek)
      endDate.setHours(23, 59, 59, 999)
      periodLabel = 'semana passada'
    } else if (commandLower.includes('este ano') || commandLower.includes('ano atual')) {
      startDate = new Date(today.getFullYear(), 0, 1)
      periodLabel = 'este ano'
    } else if (commandLower.includes('ano passado')) {
      startDate = new Date(today.getFullYear() - 1, 0, 1)
      endDate = new Date(today.getFullYear() - 1, 11, 31)
      periodLabel = 'ano passado'
    } else if (commandLower.includes('hoje')) {
      startDate = new Date(today)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(today)
      endDate.setHours(23, 59, 59, 999)
      periodLabel = 'hoje'
    } else {
      // Default: este mês
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      periodLabel = 'este mês'
    }
    
    const startDateStr = getLocalDateString(startDate)
    const endDateStr = getLocalDateString(endDate)
    
    // Buscar receitas
    let incomeQuery = supabase
      .from('financial_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
    
    // Aplicar filtro de is_paid se necessário
    incomeQuery = incomeQuery.or('is_paid.is.null,is_paid.eq.true')
    
    const { data: incomeData, error: incomeError } = await incomeQuery
    
    if (incomeError) throw incomeError
    
    // Buscar despesas
    let expenseQuery = supabase
      .from('financial_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
    
    expenseQuery = expenseQuery.or('is_paid.is.null,is_paid.eq.true')
    
    const { data: expenseData, error: expenseError } = await expenseQuery
    
    if (expenseError) throw expenseError
    
    // Calcular totais
    const totalIncome = incomeData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const totalExpense = expenseData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const netProfit = totalIncome - totalExpense
    
    // Formatar mensagem
    const profitEmoji = netProfit >= 0 ? '✅' : '⚠️'
    const profitText = netProfit >= 0 ? 'Lucro' : 'Prejuízo'
    
    let message = `${profitEmoji} ${profitText} Líquido ${periodLabel}:\n\n`
    message += `💰 Receitas: R$ ${totalIncome.toFixed(2)}\n`
    message += `💸 Despesas: R$ ${totalExpense.toFixed(2)}\n`
    message += `${profitEmoji} ${profitText}: R$ ${Math.abs(netProfit).toFixed(2)}`
    
    // Adicionar percentual se houver receitas
    if (totalIncome > 0) {
      const profitMargin = (netProfit / totalIncome) * 100
      message += `\n📊 Margem: ${profitMargin.toFixed(1)}%`
    }
    
    return {
      message,
      type: 'success',
      data: {
        period: periodLabel,
        totalIncome,
        totalExpense,
        netProfit,
        startDate: startDateStr,
        endDate: endDateStr
      }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao calcular lucro: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

/**
 * Gera insights financeiros
 */
export async function generateFinancialInsights(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  try {
    const today = new Date()
    
    // Buscar transações dos últimos 30 dias
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const startDate = getLocalDateString(thirtyDaysAgo)
    const endDate = getLocalDateString(today)
    
    // Buscar receitas
    const { data: incomeData } = await supabase
      .from('financial_transactions')
      .select('amount, category, date')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('date', startDate)
      .lte('date', endDate)
      .or('is_paid.is.null,is_paid.eq.true')
    
    // Buscar despesas
    const { data: expenseData } = await supabase
      .from('financial_transactions')
      .select('amount, category, date')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)
      .or('is_paid.is.null,is_paid.eq.true')
    
    const totalIncome = incomeData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const totalExpense = expenseData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const netProfit = totalIncome - totalExpense
    
    // Calcular média diária
    const days = 30
    const avgDailyIncome = totalIncome / days
    const avgDailyExpense = totalExpense / days
    
    // Encontrar categoria com mais despesas
    const categoryExpenses = new Map<string, number>()
    expenseData?.forEach(t => {
      const cat = t.category || 'Outros'
      const current = categoryExpenses.get(cat) || 0
      categoryExpenses.set(cat, current + parseFloat(t.amount.toString()))
    })
    
    const topExpenseCategory = Array.from(categoryExpenses.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    // Encontrar categoria com mais receitas
    const categoryIncomes = new Map<string, number>()
    incomeData?.forEach(t => {
      const cat = t.category || 'Outros'
      const current = categoryIncomes.get(cat) || 0
      categoryIncomes.set(cat, current + parseFloat(t.amount.toString()))
    })
    
    const topIncomeCategory = Array.from(categoryIncomes.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    // Montar mensagem de insights
    let message = '📊 Insights Financeiros (últimos 30 dias):\n\n'
    
    message += `💰 Receita Total: R$ ${totalIncome.toFixed(2)}\n`
    message += `💸 Despesa Total: R$ ${totalExpense.toFixed(2)}\n`
    message += `📈 ${netProfit >= 0 ? 'Lucro' : 'Prejuízo'}: R$ ${Math.abs(netProfit).toFixed(2)}\n\n`
    
    message += `📅 Média Diária:\n`
    message += `  • Receita: R$ ${avgDailyIncome.toFixed(2)}\n`
    message += `  • Despesa: R$ ${avgDailyExpense.toFixed(2)}\n\n`
    
    if (topIncomeCategory) {
      message += `🏆 Maior Receita: ${topIncomeCategory[0]} (R$ ${topIncomeCategory[1].toFixed(2)})\n`
    }
    
    if (topExpenseCategory) {
      message += `⚠️ Maior Despesa: ${topExpenseCategory[0]} (R$ ${topExpenseCategory[1].toFixed(2)})\n`
    }
    
    // Sugestões baseadas nos dados
    if (netProfit < 0) {
      message += `\n💡 Sugestão: Você está com prejuízo. Considere reduzir despesas ou aumentar receitas.`
    } else if (totalExpense > totalIncome * 0.8) {
      message += `\n💡 Sugestão: Suas despesas estão altas (${((totalExpense / totalIncome) * 100).toFixed(1)}% da receita).`
    } else {
      message += `\n💡 Situação financeira saudável! Continue assim.`
    }
    
    return {
      message,
      type: 'info',
      data: {
        totalIncome,
        totalExpense,
        netProfit,
        avgDailyIncome,
        avgDailyExpense,
        topIncomeCategory,
        topExpenseCategory
      }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao gerar insights: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

/**
 * Analisa produtos mais vendidos
 */
export async function analyzeTopProducts(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  try {
    const today = new Date()
    
    // Determinar período
    const commandLower = command.raw.toLowerCase()
    let startDate: Date
    let periodLabel = 'este mês'
    
    if (commandLower.includes('este mês') || commandLower.includes('esse mês')) {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      periodLabel = 'este mês'
    } else if (commandLower.includes('mês passado')) {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endDate = new Date(today.getFullYear(), today.getMonth(), 0)
      periodLabel = 'mês passado'
    } else if (commandLower.includes('esta semana')) {
      const dayOfWeek = today.getDay()
      startDate = new Date(today)
      startDate.setDate(today.getDate() - dayOfWeek)
      periodLabel = 'esta semana'
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      periodLabel = 'este mês'
    }
    
    const startDateStr = getLocalDateString(startDate)
    const endDateStr = getLocalDateString(today)
    
    // Buscar transações de venda
    const { data: transactions, error } = await supabase
      .from('financial_transactions')
      .select('amount, description, product_id')
      .eq('user_id', userId)
      .eq('type', 'income')
      .eq('category', 'Vendas')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .or('is_paid.is.null,is_paid.eq.true')
    
    if (error) throw error
    
    // Agrupar por produto
    const productSales = new Map<string, { count: number; total: number; name: string }>()
    
    transactions?.forEach(t => {
      // Extrair nome do produto da descrição (remover "Venda - " e informações de parcela)
      let productName = t.description || 'Produto desconhecido'
      productName = productName.replace(/^Venda - /i, '')
      productName = productName.replace(/\s*\(\d+\/\d+\)\s*$/i, '')
      productName = productName.replace(/\s*\(produto vendido por maquininha\)/i, '')
      productName = productName.trim()
      
      const current = productSales.get(productName) || { count: 0, total: 0, name: productName }
      current.count += 1
      current.total += parseFloat(t.amount.toString())
      productSales.set(productName, current)
    })
    
    // Ordenar por quantidade vendida
    const sortedProducts = Array.from(productSales.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10
    
    if (sortedProducts.length === 0) {
      return {
        message: `📦 Nenhuma venda encontrada ${periodLabel}.`,
        type: 'info'
      }
    }
    
    let message = `📊 Top Produtos Mais Vendidos ${periodLabel}:\n\n`
    
    sortedProducts.forEach((product, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      message += `${medal} ${product.name}\n`
      message += `   📦 ${product.count} venda(s) - R$ ${product.total.toFixed(2)}\n\n`
    })
    
    return {
      message,
      type: 'info',
      data: {
        products: sortedProducts,
        period: periodLabel
      }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao analisar produtos: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

