import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Endpoint para verificar notificações que devem ser exibidas AGORA
 * Usado para notificações em tempo real quando o usuário está na aplicação
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar preferências de notificações do usuário
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('notifications_enabled, notifications_financial_enabled, notifications_financial_3days, notifications_financial_1day, notifications_financial_day, notifications_financial_overdue')
      .eq('id', user.id)
      .single()

    // Se não houver perfil ou preferências desabilitadas, retornar vazio
    if (profileError || !profile) {
      console.log('🔔 [API] Perfil não encontrado ou erro ao buscar preferências:', profileError?.message)
      return NextResponse.json({ notifications: [] })
    }

    // Verificar se notificações estão habilitadas
    if (!profile.notifications_enabled || !profile.notifications_financial_enabled) {
      console.log('🔔 [API] Notificações desabilitadas pelo usuário')
      return NextResponse.json({ notifications: [] })
    }

    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    
    const todayStr = today.toISOString().split('T')[0]
    
    // Calcular datas futuras que precisam de notificação HOJE
    // Se hoje é 07/11, precisamos notificar sobre transações agendadas para:
    // - 10/11 (3 dias depois = notificação 3 dias antes)
    // - 08/11 (1 dia depois = notificação 1 dia antes)
    // - 07/11 (hoje = notificação no dia)
    const threeDaysLater = new Date(today)
    threeDaysLater.setDate(today.getDate() + 3)
    const oneDayLater = new Date(today)
    oneDayLater.setDate(today.getDate() + 1)
    
    const targetDates = [
      todayStr, // No dia
      oneDayLater.toISOString().split('T')[0], // 1 dia depois (notificação 1 dia antes)
      threeDaysLater.toISOString().split('T')[0] // 3 dias depois (notificação 3 dias antes)
    ]

    console.log('🔔 [API] Verificando notificações para:', {
      userId: user.id,
      today: todayStr,
      targetDates,
      oneDayLater: oneDayLater.toISOString().split('T')[0],
      threeDaysLater: threeDaysLater.toISOString().split('T')[0]
    })

    // Buscar transações não pagas com scheduled_date nas datas que precisam de notificação hoje
    const { data: upcomingTransactions, error: upcomingError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', user.id)
      .in('scheduled_date', targetDates)
      .or('is_paid.eq.false,is_paid.is.null')
      .not('scheduled_date', 'is', null)
      .order('scheduled_date', { ascending: true })

    // Buscar transações VENCIDAS (scheduled_date < hoje) que ainda não foram pagas
    const { data: overdueTransactions, error: overdueError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', user.id)
      .lt('scheduled_date', todayStr)
      .or('is_paid.eq.false,is_paid.is.null')
      .not('scheduled_date', 'is', null)
      .order('scheduled_date', { ascending: true })

    const error = upcomingError || overdueError
    const transactions = [...(upcomingTransactions || []), ...(overdueTransactions || [])]

    console.log('🔔 [API] Transações encontradas:', {
      upcoming: upcomingTransactions?.length || 0,
      overdue: overdueTransactions?.length || 0,
      total: transactions.length
    })
    if (transactions && transactions.length > 0) {
      console.log('🔔 [API] Detalhes das transações:', transactions.map(t => ({
        id: t.id,
        description: t.description,
        scheduled_date: t.scheduled_date,
        is_paid: t.is_paid,
        type: t.type
      })))
    }

    if (error) {
      console.error('Erro ao buscar transações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar transações', details: error.message },
        { status: 500 }
      )
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ notifications: [] })
    }

    // Processar transações e determinar quais notificações devem ser exibidas
    const notificationsToShow: Array<{
      transaction_id: string
      type: 'income' | 'expense'
      description: string
      amount: number
      scheduled_date: string
      days_until: number
      notification_type: string
      is_overdue?: boolean
    }> = []

    for (const transaction of transactions) {
      if (!transaction.scheduled_date) continue

      const scheduledDate = new Date(transaction.scheduled_date)
      scheduledDate.setHours(0, 0, 0, 0)
      
      // Calcular dias até a data agendada
      // Se hoje é 07/11 e scheduled_date é 08/11, daysUntil deve ser 1 (amanhã)
      const timeDiff = scheduledDate.getTime() - today.getTime()
      const daysUntil = Math.round(timeDiff / (1000 * 60 * 60 * 24))
      
      console.log('🔔 [API] Processando transação:', {
        id: transaction.id,
        description: transaction.description,
        scheduled_date: transaction.scheduled_date,
        scheduledDateISO: scheduledDate.toISOString().split('T')[0],
        todayISO: today.toISOString().split('T')[0],
        timeDiff,
        daysUntil,
        is_paid: transaction.is_paid
      })
      
      // Verificar se já foi enviada esta notificação hoje
      let notificationType: string | null = null
      let isOverdue = false
      
      // Transações vencidas (scheduled_date < hoje)
      if (daysUntil < 0) {
        if (!profile.notifications_financial_overdue) {
          console.log('🔔 [API] Pulando transação vencida - notificações de vencidas desabilitadas')
          continue
        }
        isOverdue = true
        notificationType = transaction.is_recurring ? 'recurring_overdue' : 'scheduled_overdue'
      } else if (daysUntil === 3) {
        if (!profile.notifications_financial_3days) {
          console.log('🔔 [API] Pulando transação - notificações de 3 dias desabilitadas')
          continue
        }
        notificationType = transaction.is_recurring ? 'recurring_3days' : 'scheduled_3days'
      } else if (daysUntil === 1) {
        if (!profile.notifications_financial_1day) {
          console.log('🔔 [API] Pulando transação - notificações de 1 dia desabilitadas')
          continue
        }
        notificationType = transaction.is_recurring ? 'recurring_1day' : 'scheduled_1day'
      } else if (daysUntil === 0) {
        if (!profile.notifications_financial_day) {
          console.log('🔔 [API] Pulando transação - notificações do dia desabilitadas')
          continue
        }
        notificationType = transaction.is_recurring ? 'recurring_day' : 'scheduled_day'
      }

      if (!notificationType) {
        console.log('🔔 [API] Pulando transação - não precisa de notificação hoje (daysUntil:', daysUntil, ')')
        continue
      }

      // Verificar se já foi enviada hoje
      const { data: existingLog } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('transaction_id', transaction.id)
        .eq('notification_type', notificationType)
        .eq('scheduled_date', scheduledDate.toISOString().split('T')[0])
        .gte('sent_at', today.toISOString())
        .maybeSingle()

      // Se não foi enviada hoje, adicionar à lista
      if (!existingLog) {
        console.log('🔔 [API] Adicionando notificação:', {
          transaction_id: transaction.id,
          notification_type: notificationType,
          days_until: daysUntil
        })
        notificationsToShow.push({
          transaction_id: transaction.id,
          type: transaction.type,
          description: transaction.description || (transaction.type === 'income' ? 'Receita' : 'Despesa'),
          amount: Number(transaction.amount),
          scheduled_date: transaction.scheduled_date,
          days_until: daysUntil,
          notification_type: notificationType,
          is_overdue: isOverdue
        })
      } else {
        console.log('🔔 [API] Notificação já foi enviada hoje, pulando')
      }
    }

    console.log('🔔 [API] Total de notificações para exibir:', notificationsToShow.length)
    
    return NextResponse.json({ notifications: notificationsToShow })
  } catch (error: unknown) {
    console.error('Erro ao verificar notificações:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: 'Erro ao verificar notificações', details: errorMessage },
      { status: 500 }
    )
  }
}

