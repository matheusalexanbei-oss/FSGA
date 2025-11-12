// Função para atualizar transações recorrentes quando são criadas
// Esta função deve ser chamada quando uma transação recorrente é criada

import { createClient } from '@/lib/supabase/client'

export async function updateRecurringTransaction(
  transactionId: string,
  userId: string
) {
  const supabase = createClient()
  
  // Buscar a transação
  const { data: transaction, error } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('user_id', userId)
    .single()

  if (error || !transaction) {
    console.error('Erro ao buscar transação:', error)
    return
  }

  // Verificar se é recorrente
  const isRecurring = transaction.notes?.includes('Recorrente') || transaction.is_recurring
  
  if (!isRecurring) {
    return // Não é recorrente, não precisa atualizar
  }

  // Extrair informações da recorrente
  const notes = transaction.notes || ''
  const intervalMatch = notes.match(/Recorrente - (weekly|monthly|quarterly)/)
  const interval = intervalMatch ? intervalMatch[1] : transaction.recurring_interval || 'monthly'
  
  const endDateMatch = notes.match(/EndDate: (\d{4}-\d{2}-\d{2})/)
  const endDate = endDateMatch ? endDateMatch[1] : transaction.recurring_end_date

  // Atualizar campos da transação
  const updateData: any = {
    is_recurring: true,
    recurring_interval: interval
  }

  if (endDate) {
    updateData.recurring_end_date = endDate
  }

  await supabase
    .from('financial_transactions')
    .update(updateData)
    .eq('id', transactionId)

  console.log('✅ Transação recorrente atualizada:', transactionId)
}



