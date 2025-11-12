import { BotResponse, ParsedCommand } from '../types'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'

const supabase = createClient()

/**
 * Consulta receitas por período
 */
export async function checkRevenue(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  try {
    const today = new Date()
    let startDate: Date
    let endDate: Date = today
    let periodLabel = 'este mês'
    
    const commandLower = command.raw.toLowerCase()
    
    // Determinar período
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
    } else if (commandLower.includes('hoje')) {
      startDate = new Date(today)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(today)
      endDate.setHours(23, 59, 59, 999)
      periodLabel = 'hoje'
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      periodLabel = 'este mês'
    }
    
    const startDateStr = getLocalDateString(startDate)
    const endDateStr = getLocalDateString(endDate)
    
    // Buscar receitas
    const { data: incomeData, error } = await supabase
      .from('financial_transactions')
      .select('amount, category, description, date')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .or('is_paid.is.null,is_paid.eq.true')
      .order('date', { ascending: false })
    
    if (error) throw error
    
    const totalRevenue = incomeData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const transactionCount = incomeData?.length || 0
    
    // Agrupar por categoria
    const categoryRevenue = new Map<string, number>()
    incomeData?.forEach(t => {
      const cat = t.category || 'Outros'
      const current = categoryRevenue.get(cat) || 0
      categoryRevenue.set(cat, current + parseFloat(t.amount.toString()))
    })
    
    // Montar mensagem
    let message = `💰 Receitas ${periodLabel}:\n\n`
    message += `💵 Total: R$ ${totalRevenue.toFixed(2)}\n`
    message += `📊 Transações: ${transactionCount} ${transactionCount === 1 ? 'transação' : 'transações'}\n\n`
    
    if (categoryRevenue.size > 0) {
      message += `Por categoria:\n`
      const sortedCategories = Array.from(categoryRevenue.entries())
        .sort((a, b) => b[1] - a[1])
      
      sortedCategories.forEach(([cat, amount]) => {
        const percentage = (amount / totalRevenue) * 100
        message += `• ${cat}: R$ ${amount.toFixed(2)} (${percentage.toFixed(1)}%)\n`
      })
    }
    
    // Calcular média diária
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1
    const avgDaily = totalRevenue / daysDiff
    message += `\n📅 Média diária: R$ ${avgDaily.toFixed(2)}`
    
    return {
      message,
      type: 'success',
      data: {
        period: periodLabel,
        totalRevenue,
        transactionCount,
        categoryRevenue: Object.fromEntries(categoryRevenue),
        startDate: startDateStr,
        endDate: endDateStr
      }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao consultar receitas: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

/**
 * Consulta despesas por período
 */
export async function checkExpenses(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  try {
    const today = new Date()
    let startDate: Date
    let endDate: Date = today
    let periodLabel = 'este mês'
    
    const commandLower = command.raw.toLowerCase()
    
    // Determinar período (mesmo código de checkRevenue)
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
    } else if (commandLower.includes('hoje')) {
      startDate = new Date(today)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(today)
      endDate.setHours(23, 59, 59, 999)
      periodLabel = 'hoje'
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      periodLabel = 'este mês'
    }
    
    const startDateStr = getLocalDateString(startDate)
    const endDateStr = getLocalDateString(endDate)
    
    // Buscar despesas
    const { data: expenseData, error } = await supabase
      .from('financial_transactions')
      .select('amount, category, description, date')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .or('is_paid.is.null,is_paid.eq.true')
      .order('date', { ascending: false })
    
    if (error) throw error
    
    const totalExpenses = expenseData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const transactionCount = expenseData?.length || 0
    
    // Agrupar por categoria
    const categoryExpenses = new Map<string, number>()
    expenseData?.forEach(t => {
      const cat = t.category || 'Outros'
      const current = categoryExpenses.get(cat) || 0
      categoryExpenses.set(cat, current + parseFloat(t.amount.toString()))
    })
    
    // Montar mensagem
    let message = `💸 Despesas ${periodLabel}:\n\n`
    message += `💵 Total: R$ ${totalExpenses.toFixed(2)}\n`
    message += `📊 Transações: ${transactionCount} ${transactionCount === 1 ? 'transação' : 'transações'}\n\n`
    
    if (categoryExpenses.size > 0) {
      message += `Por categoria:\n`
      const sortedCategories = Array.from(categoryExpenses.entries())
        .sort((a, b) => b[1] - a[1])
      
      sortedCategories.forEach(([cat, amount]) => {
        const percentage = (amount / totalExpenses) * 100
        message += `• ${cat}: R$ ${amount.toFixed(2)} (${percentage.toFixed(1)}%)\n`
      })
    }
    
    // Calcular média diária
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1
    const avgDaily = totalExpenses / daysDiff
    message += `\n📅 Média diária: R$ ${avgDaily.toFixed(2)}`
    
    return {
      message,
      type: 'success',
      data: {
        period: periodLabel,
        totalExpenses,
        transactionCount,
        categoryExpenses: Object.fromEntries(categoryExpenses),
        startDate: startDateStr,
        endDate: endDateStr
      }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao consultar despesas: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

/**
 * Gera insights financeiros avançados
 */
export async function generateAdvancedInsights(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  try {
    const today = new Date()
    
    // Buscar dados dos últimos 90 dias para análise mais completa
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - 90)
    const startDate = getLocalDateString(ninetyDaysAgo)
    const endDate = getLocalDateString(today)
    
    // Buscar receitas
    const { data: incomeData } = await supabase
      .from('financial_transactions')
      .select('amount, category, date, description')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('date', startDate)
      .lte('date', endDate)
      .or('is_paid.is.null,is_paid.eq.true')
      .order('date', { ascending: false })
    
    // Buscar despesas
    const { data: expenseData } = await supabase
      .from('financial_transactions')
      .select('amount, category, date, description')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)
      .or('is_paid.is.null,is_paid.eq.true')
      .order('date', { ascending: false })
    
    const totalIncome = incomeData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const totalExpense = expenseData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const netProfit = totalIncome - totalExpense
    
    // Calcular tendências (últimos 30 dias vs 30 dias anteriores)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const sixtyDaysAgo = new Date(today)
    sixtyDaysAgo.setDate(today.getDate() - 60)
    
    const recent30DaysStart = getLocalDateString(thirtyDaysAgo)
    const recent30DaysEnd = getLocalDateString(today)
    const previous30DaysStart = getLocalDateString(sixtyDaysAgo)
    const previous30DaysEnd = getLocalDateString(thirtyDaysAgo)
    
    // Receitas dos últimos 30 dias
    const { data: recentIncome } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('date', recent30DaysStart)
      .lte('date', recent30DaysEnd)
      .or('is_paid.is.null,is_paid.eq.true')
    
    // Receitas dos 30 dias anteriores
    const { data: previousIncome } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'income')
      .gte('date', previous30DaysStart)
      .lte('date', previous30DaysEnd)
      .or('is_paid.is.null,is_paid.eq.true')
    
    const recentIncomeTotal = recentIncome?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    const previousIncomeTotal = previousIncome?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
    
    const incomeTrend = previousIncomeTotal > 0 
      ? ((recentIncomeTotal - previousIncomeTotal) / previousIncomeTotal) * 100 
      : 0
    
    // Análise por categoria de receitas
    const categoryIncomes = new Map<string, number>()
    incomeData?.forEach(t => {
      const cat = t.category || 'Outros'
      const current = categoryIncomes.get(cat) || 0
      categoryIncomes.set(cat, current + parseFloat(t.amount.toString()))
    })
    
    // Análise por categoria de despesas
    const categoryExpenses = new Map<string, number>()
    expenseData?.forEach(t => {
      const cat = t.category || 'Outros'
      const current = categoryExpenses.get(cat) || 0
      categoryExpenses.set(cat, current + parseFloat(t.amount.toString()))
    })
    
    // Montar mensagem de insights
    let message = '📊 Insights Financeiros (últimos 90 dias):\n\n'
    
    message += `💰 Receita Total: R$ ${totalIncome.toFixed(2)}\n`
    message += `💸 Despesa Total: R$ ${totalExpense.toFixed(2)}\n`
    message += `📈 ${netProfit >= 0 ? 'Lucro' : 'Prejuízo'}: R$ ${Math.abs(netProfit).toFixed(2)}\n\n`
    
    // Tendência de receitas
    if (incomeTrend > 0) {
      message += `📈 Tendência de Receitas: +${incomeTrend.toFixed(1)}% (últimos 30 dias vs anteriores)\n`
    } else if (incomeTrend < 0) {
      message += `📉 Tendência de Receitas: ${incomeTrend.toFixed(1)}% (últimos 30 dias vs anteriores)\n`
    } else {
      message += `➡️ Tendência de Receitas: Estável\n`
    }
    message += '\n'
    
    // Top 3 categorias de receitas
    const topIncomeCategories = Array.from(categoryIncomes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    if (topIncomeCategories.length > 0) {
      message += `🏆 Top Categorias de Receitas:\n`
      topIncomeCategories.forEach(([cat, amount], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
        const percentage = (amount / totalIncome) * 100
        message += `${medal} ${cat}: R$ ${amount.toFixed(2)} (${percentage.toFixed(1)}%)\n`
      })
      message += '\n'
    }
    
    // Top 3 categorias de despesas
    const topExpenseCategories = Array.from(categoryExpenses.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    if (topExpenseCategories.length > 0) {
      message += `⚠️ Top Categorias de Despesas:\n`
      topExpenseCategories.forEach(([cat, amount], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
        const percentage = (amount / totalExpense) * 100
        message += `${medal} ${cat}: R$ ${amount.toFixed(2)} (${percentage.toFixed(1)}%)\n`
      })
      message += '\n'
    }
    
    // Sugestões inteligentes
    message += `💡 Recomendações:\n`
    if (netProfit < 0) {
      message += `• Você está com prejuízo. Considere reduzir despesas ou aumentar receitas.\n`
    } else if (totalExpense > totalIncome * 0.8) {
      message += `• Suas despesas estão altas (${((totalExpense / totalIncome) * 100).toFixed(1)}% da receita).\n`
    } else if (incomeTrend < -10) {
      message += `• Suas receitas caíram ${Math.abs(incomeTrend).toFixed(1)}% nos últimos 30 dias. Analise o que pode estar causando isso.\n`
    } else if (incomeTrend > 10) {
      message += `• Excelente! Suas receitas aumentaram ${incomeTrend.toFixed(1)}% nos últimos 30 dias. Continue assim!\n`
    } else {
      message += `• Situação financeira estável. Continue monitorando suas finanças.\n`
    }
    
    return {
      message,
      type: 'info',
      data: {
        totalIncome,
        totalExpense,
        netProfit,
        incomeTrend,
        topIncomeCategories,
        topExpenseCategories,
        period: 'últimos 90 dias'
      }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao gerar insights: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

