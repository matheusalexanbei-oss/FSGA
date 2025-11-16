import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface UpcomingNotification {
  transaction_id: string
  description: string
  type: 'income' | 'expense'
  amount: number
  scheduled_date: string
  payment_method?: string
  is_recurring?: boolean
}

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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    const threeDaysLater = new Date(today)
    threeDaysLater.setDate(today.getDate() + 3)
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(today.getDate() + 7)

    // Buscar preferências do usuário para filtrar os agendamentos que realmente gerarão notificação
    const { data: profile } = await supabase
      .from('users_profile')
      .select('notifications_enabled, notifications_financial_enabled, notifications_financial_7days, notifications_financial_3days, notifications_financial_day')
      .eq('id', user.id)
      .single()

    // Se notificações estiverem desabilitadas, não mostrar nada
    if (!profile?.notifications_enabled || !profile?.notifications_financial_enabled) {
      return NextResponse.json({ notifications: [] })
    }

    // Montar as datas alvo conforme preferências (somente as que de fato vão disparar notificação)
    const targetDates: string[] = []
    if (profile.notifications_financial_day) {
      targetDates.push(todayStr)
    }
    if (profile.notifications_financial_3days) {
      targetDates.push(threeDaysLater.toISOString().split('T')[0])
    }
    if (profile.notifications_financial_7days) {
      targetDates.push(sevenDaysLater.toISOString().split('T')[0])
    }

    console.log('🔔 [API Upcoming] Buscando agendamentos que vão notificar:', {
      userId: user.id,
      today: todayStr,
      targetDates
    })
    
    // Buscar somente transações pendentes que cairão nas datas de notificação (hoje, +3, +7)
    const { data: allTransactions, error: queryError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', user.id)
      .in('scheduled_date', targetDates)
      .or('is_paid.eq.false,is_paid.is.null')
      .order('scheduled_date', { ascending: true })

    if (queryError) {
      console.error('🔔 [API Upcoming] Erro ao buscar transações:', queryError)
      return NextResponse.json(
        { error: 'Erro ao buscar transações', details: queryError.message },
        { status: 500 }
      )
    }

    // Filtrar apenas transações não pagas (is_paid = false ou null)
    // Mesma lógica do /api/notifications/check
    const transactions = (allTransactions || []).filter(t => {
      const isNotPaid = t.is_paid === false || t.is_paid === null || t.is_paid === undefined
      if (!isNotPaid) {
        console.log('🔔 [API Upcoming] Transação filtrada (está paga):', {
          id: t.id,
          description: t.description,
          is_paid: t.is_paid,
          scheduled_date: t.scheduled_date
        })
      }
      return isNotPaid
    })

    console.log('🔔 [API Upcoming] Resultados:', {
      totalEncontradas: allTransactions?.length || 0,
      naoPagas: transactions.length,
      todasTransacoes: allTransactions?.map(t => ({
        id: t.id,
        description: t.description,
        scheduled_date: t.scheduled_date,
        is_paid: t.is_paid,
        tipoIsPaid: typeof t.is_paid
      }))
    })
    
    if (transactions && transactions.length > 0) {
      console.log('🔔 [API Upcoming] Transações agendadas (não pagas):', transactions.map(t => ({
        id: t.id,
        description: t.description,
        scheduled_date: t.scheduled_date,
        is_paid: t.is_paid,
        type: t.type
      })))
    } else {
      console.log('🔔 [API Upcoming] Nenhuma transação não paga encontrada')
      if (allTransactions && allTransactions.length > 0) {
        console.log('🔔 [API Upcoming] Mas há transações que foram filtradas:', allTransactions.map(t => ({
          id: t.id,
          is_paid: t.is_paid,
          tipoIsPaid: typeof t.is_paid
        })))
      }
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ notifications: [] })
    }

    // Processar transações - mostrar apenas as transações pendentes que vão notificar
    const upcomingNotifications: UpcomingNotification[] = transactions.map(transaction => ({
      transaction_id: transaction.id,
      description: transaction.description || (transaction.type === 'income' ? 'Receita' : 'Despesa'),
      type: transaction.type,
      amount: Number(transaction.amount),
      scheduled_date: transaction.scheduled_date,
      payment_method: transaction.payment_method || undefined,
      is_recurring: transaction.is_recurring || false
    }))

    console.log('🔔 [API Upcoming] Total de notificações para exibir:', upcomingNotifications.length)

    return NextResponse.json({ notifications: upcomingNotifications })
  } catch (error: unknown) {
    console.error('Erro ao buscar próximas notificações:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: 'Erro ao buscar próximas notificações', details: errorMessage },
      { status: 500 }
    )
  }
}
