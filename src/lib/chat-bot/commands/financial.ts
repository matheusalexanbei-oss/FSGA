import { BotResponse, ParsedCommand, ConfirmationData } from '../types'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'
import { formatDateString } from '../date-patterns'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Função para gerar UUID no browser
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback para browsers mais antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Cria uma transação financeira
 */
async function createTransaction(data: {
  user_id: string
  type: 'income' | 'expense'
  amount: number
  date: string
  description: string | null
  category: string | null
  is_paid?: boolean
  scheduled_date?: string | null
  is_installment?: boolean
  installment_count?: number
  installment_number?: number
  installment_interval?: string
  installment_group_id?: string | null
}): Promise<any> {
  const { data: transaction, error } = await supabase
    .from('financial_transactions')
    .insert({
      user_id: data.user_id,
      type: data.type,
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      is_paid: data.is_paid ?? true,
      scheduled_date: data.scheduled_date || null,
      is_installment: data.is_installment || false,
      installment_count: data.installment_count || null,
      installment_number: data.installment_number || null,
      installment_interval: data.installment_interval || null,
      installment_group_id: data.installment_group_id || null,
    })
    .select()
    .single()
  
  if (error) throw error
  return transaction
}

/**
 * Handler para registro de despesa
 */
export async function handleRegisterExpense(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  const { 
    amount, 
    date, 
    description, 
    category,
    isInstallment,
    installmentCount,
    installmentInterval
  } = command.entities
  
  if (!amount) {
    // Tentar extrair descrição para contexto
    let expenseDescription = description
    if (!expenseDescription) {
      // Remover palavras-chave e números de parcelamento para extrair a descrição
      let cleanCommand = command.raw
        .replace(/gastei|gastar|gasto|paguei|pagar|comprei|compra/i, '')
        .replace(/parcelado|parcelar|parcelamento/gi, '')
        .replace(/em\s+\d+\s*(?:x|vezes|parcelas?)/gi, '')
        .replace(/\d+\s*(?:x|vezes|parcelas?)/gi, '')
        .replace(/\bde\s+\d+/gi, '')
        .replace(/\bpor\s+\d+/gi, '')
        .trim()
      
      if (cleanCommand.length > 0) {
        expenseDescription = cleanCommand.split(/\s+/).filter(p => p.length > 0).join(' ')
      }
    }
    
    // Se tem parcelamento detectado, mencionar na pergunta
    let questionMessage = ''
    if (isInstallment && installmentCount) {
      questionMessage = `Entendi que você quer registrar uma despesa${expenseDescription ? `: "${expenseDescription}"` : ''} parcelada em ${installmentCount}x.\n\n`
      questionMessage += `❓ Qual foi o valor total da despesa?\n\n`
      questionMessage += `💡 Exemplos:\n• 3799 reais\n• R$ 3799\n• 50,00`
    } else if (expenseDescription && expenseDescription.length > 0) {
      questionMessage = `Entendi que você quer registrar uma despesa: "${expenseDescription}"\n\n`
      questionMessage += `❓ Qual foi o valor? Por favor, informe o valor da despesa.\n\n`
      questionMessage += `💡 Exemplos:\n• 3799 reais\n• R$ 3799\n• 50,00`
    } else {
      questionMessage = `❓ Não consegui identificar o valor da despesa. Qual foi o valor?\n\n`
      questionMessage += `💡 Exemplos:\n• 50 reais\n• R$ 100\n• 200,50`
    }
    
    return {
      message: questionMessage,
      type: 'question',
      requiresInput: true,
      suggestions: ['3799 reais', 'R$ 3799', '50 reais']
    }
  }
  
  // Extrair descrição do comando original se não foi detectada
  let expenseDescription = description
  if (!expenseDescription) {
    // Remover palavras-chave, valores monetários e informações de parcelamento
    let cleanCommand = command.raw
      .replace(/gastei|gastar|gasto|paguei|pagar|comprei|compra/i, '')
      .replace(MONEY_PATTERN, '')
      .replace(/parcelado|parcelar|parcelamento/gi, '')
      .replace(/em\s+\d+\s*(?:x|vezes|parcelas?)/gi, '')
      .replace(/\d+\s*(?:x|vezes|parcelas?)/gi, '')
      .replace(/\bde\s+\d+/gi, '')
      .replace(/\bpor\s+\d+/gi, '')
      .replace(/\b(?:um|uma|o|a|os|as)\s+/gi, '')
      .trim()
    
    if (cleanCommand.length > 0) {
      // Limpar espaços múltiplos e pegar palavras significativas
      expenseDescription = cleanCommand.split(/\s+/).filter(p => p.length > 0).join(' ')
    }
  }
  
  expenseDescription = expenseDescription || 'Despesa registrada'
  
  // Se há pagamento agendado, usar a data do pagamento; senão usar a data informada ou hoje
  const { paymentScheduled, paymentDate } = command.entities
  let expenseDate = date || getLocalDateString()
  
  // Se há pagamento agendado, usar a data do pagamento como data da transação
  if (paymentScheduled && paymentDate) {
    expenseDate = paymentDate
  }
  
  let confirmationMessage = `Confirmar despesa?\n\n`
  confirmationMessage += `💰 Valor: R$ ${amount.toFixed(2)}\n`
  confirmationMessage += `📝 Descrição: ${expenseDescription}\n`
  confirmationMessage += `📅 Data: ${formatDateString(expenseDate)}`
  
  if (category) {
    confirmationMessage += `\n📂 Categoria: ${category}`
  }
  
  // Se há pagamento agendado, mostrar informação
  if (paymentScheduled && paymentDate) {
    confirmationMessage += `\n📅 Pagamento agendado para: ${formatDateString(paymentDate)}`
  }
  
  // Se for parcelamento, mostrar informações
  if (isInstallment && installmentCount && installmentCount > 1) {
    const installmentAmount = amount / installmentCount
    const intervalText = installmentInterval === 'weekly' ? 'semanal' : 
                        installmentInterval === 'quarterly' ? 'trimestral' : 'mensal'
    confirmationMessage += `\n📦 Parcelamento: ${installmentCount}x de R$ ${installmentAmount.toFixed(2)} (${intervalText})`
    confirmationMessage += `\n⚠️ Nota: A primeira parcela será cobrada no próximo mês`
  }
  
  return {
    message: confirmationMessage,
    type: 'confirmation',
    requiresConfirmation: true,
    confirmationData: {
      action: 'register_expense',
      amount,
      date: expenseDate,
      description: expenseDescription,
      category: category || null,
      isInstallment,
      installmentCount,
      installmentInterval,
      paymentScheduled: paymentScheduled || false,
      paymentDate: paymentDate || null
    }
  }
}

/**
 * Executa registro de despesa (após confirmação)
 */
export async function executeRegisterExpense(
  data: ConfirmationData,
  userId: string
): Promise<BotResponse> {
  try {
    const today = getLocalDateString()
    
    // Se for parcelamento, criar múltiplas transações
    if (data.isInstallment && data.installmentCount && data.installmentCount > 1) {
      const groupId = generateUUID()
      const installmentAmount = data.amount / data.installmentCount
      const baseDate = new Date()
      
      // Para despesas, primeira parcela no próximo mês
      const nextMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1)
      
      const intervalMonths = data.installmentInterval === 'weekly' ? 0 :
                            data.installmentInterval === 'monthly' ? 1 : 3
      
      const createdTransactions = []
      
      for (let i = 1; i <= data.installmentCount; i++) {
        const installmentDate = new Date(nextMonth)
        
        if (intervalMonths > 0) {
          installmentDate.setMonth(nextMonth.getMonth() + (intervalMonths * (i - 1)))
        } else {
          installmentDate.setDate(nextMonth.getDate() + (7 * (i - 1)))
        }
        
        const installmentDateString = getLocalDateString(installmentDate)
        const description = `${data.description} (${i}/${data.installmentCount})`
        
        const installmentTransaction = await createTransaction({
          user_id: userId,
          type: 'expense',
          amount: installmentAmount,
          date: installmentDateString,
          description: description,
          category: data.category,
          is_paid: false, // Todas as parcelas são agendadas
          scheduled_date: installmentDateString,
          is_installment: true,
          installment_count: data.installmentCount,
          installment_number: i,
          installment_interval: data.installmentInterval || 'monthly',
          installment_group_id: groupId
        })
        
        createdTransactions.push(installmentTransaction)
      }
      
      const intervalText = data.installmentInterval === 'weekly' ? 'semanal' :
                          data.installmentInterval === 'quarterly' ? 'trimestral' : 'mensal'
      
      return {
        message: `✅ Despesa parcelada registrada com sucesso!\n\n📝 ${data.description}\n💵 Total: R$ ${data.amount.toFixed(2)}\n📦 ${data.installmentCount}x de R$ ${installmentAmount.toFixed(2)} (${intervalText})\n\n⚠️ Primeira parcela será cobrada no próximo mês`,
        type: 'success',
        data: { transactions: createdTransactions }
      }
    }
    
    // Despesa simples (sem parcelamento)
    // Se há pagamento agendado, usar paymentDate como data e marcar como não pago
    const isScheduled = data.paymentScheduled && data.paymentDate
    const transactionDate = isScheduled ? data.paymentDate : data.date
    const isPaid = !isScheduled // Se está agendado, não está pago ainda
    
    const transaction = await createTransaction({
      user_id: userId,
      type: 'expense',
      amount: data.amount,
      date: transactionDate,
      description: data.description,
      category: data.category,
      is_paid: isPaid,
      scheduled_date: isScheduled ? data.paymentDate : null
    })
    
    return {
      message: `✅ Despesa registrada com sucesso!\n\n💰 R$ ${data.amount.toFixed(2)}\n📝 ${data.description}`,
      type: 'success',
      data: { transaction }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao registrar despesa: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

/**
 * Handler para registro de receita (sem produto)
 */
export async function handleRegisterIncome(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  const { amount, date, description, category } = command.entities
  
  if (!amount) {
    return {
      message: "Não consegui identificar o valor da receita. Pode informar?\n\nExemplo: \"recebi 500 reais de serviço\"",
      type: 'error',
      suggestions: ['500 reais', 'R$ 500']
    }
  }
  
  let incomeDescription = description
  if (!incomeDescription) {
    const parts = command.raw
      .replace(/recebi|receber|receita|ganhei|ganhar/i, '')
      .replace(MONEY_PATTERN, '')
      .trim()
      .split(/\s+/)
    
    if (parts.length > 0 && parts[0].length > 0) {
      incomeDescription = parts.join(' ')
    }
  }
  
  incomeDescription = incomeDescription || 'Receita registrada'
  const incomeDate = date || getLocalDateString()
  
  let confirmationMessage = `Confirmar receita?\n\n`
  confirmationMessage += `💰 Valor: R$ ${amount.toFixed(2)}\n`
  confirmationMessage += `📝 Descrição: ${incomeDescription}\n`
  confirmationMessage += `📅 Data: ${formatDateString(incomeDate)}`
  
  if (category) {
    confirmationMessage += `\n📂 Categoria: ${category}`
  }
  
  return {
    message: confirmationMessage,
    type: 'confirmation',
    requiresConfirmation: true,
    confirmationData: {
      action: 'register_income',
      amount,
      date: incomeDate,
      description: incomeDescription,
      category: category || null
    }
  }
}

/**
 * Executa registro de receita (após confirmação)
 */
export async function executeRegisterIncome(
  data: ConfirmationData,
  userId: string
): Promise<BotResponse> {
  try {
    const transaction = await createTransaction({
      user_id: userId,
      type: 'income',
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      is_paid: true
    })
    
    return {
      message: `✅ Receita registrada com sucesso!\n\n💰 R$ ${data.amount.toFixed(2)}\n📝 ${data.description}`,
      type: 'success',
      data: { transaction }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao registrar receita: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

// Padrão para valores monetários (usado para remover do texto)
const MONEY_PATTERN = /(\d+[,.]?\d*)\s*(reais?|r\$|rs|real|R\$)/i

