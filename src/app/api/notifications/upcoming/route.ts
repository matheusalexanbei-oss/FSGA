import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface UpcomingNotification {
  transaction_id: string
  description: string
  type: 'income' | 'expense'
  amount: number
  scheduled_date: string
  notification_dates: {
    date: string
    days_before: number
    label: string
  }[]
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
    
    // Buscar transações com scheduled_date nos próximos 7 dias
    const sevenDaysFromNow = new Date(today)
    sevenDaysFromNow.setDate(today.getDate() + 7)
    
    const todayStr = today.toISOString().split('T')[0]
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0]
    
    console.log('🔔 [API Upcoming] Buscando notificações:', {
      userId: user.id,
      today: todayStr,
      sevenDaysFromNow: sevenDaysStr
    })
    
    // Buscar TODAS as transações com scheduled_date nos próximos 7 dias
    const { data: allTransactions, error: queryError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', user.id)
      .not('scheduled_date', 'is', null)
      .gte('scheduled_date', todayStr)
      .lte('scheduled_date', sevenDaysStr)
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

    // Processar transações e calcular datas de notificação
    const upcomingNotifications: UpcomingNotification[] = []

    for (const transaction of transactions) {
      if (!transaction.scheduled_date) continue

      const scheduledDate = new Date(transaction.scheduled_date)
      scheduledDate.setHours(0, 0, 0, 0)
      
      // Calcular datas de notificação (3 dias antes, 1 dia antes, no dia)
      const notificationDates: { date: string; days_before: number; label: string }[] = []
      
      // 3 dias antes
      const threeDaysBefore = new Date(scheduledDate)
      threeDaysBefore.setDate(scheduledDate.getDate() - 3)
      if (threeDaysBefore >= today) {
        notificationDates.push({
          date: threeDaysBefore.toISOString().split('T')[0],
          days_before: 3,
          label: '3 dias antes'
        })
      }
      
      // 1 dia antes
      const oneDayBefore = new Date(scheduledDate)
      oneDayBefore.setDate(scheduledDate.getDate() - 1)
      if (oneDayBefore >= today) {
        notificationDates.push({
          date: oneDayBefore.toISOString().split('T')[0],
          days_before: 1,
          label: '1 dia antes'
        })
      }
      
      // No dia
      if (scheduledDate >= today) {
        notificationDates.push({
          date: scheduledDate.toISOString().split('T')[0],
          days_before: 0,
          label: 'No dia'
        })
      }

      // Filtrar apenas notificações futuras
      const futureNotifications = notificationDates.filter(notif => {
        const notifDate = new Date(notif.date)
        notifDate.setHours(0, 0, 0, 0)
        return notifDate >= today
      })

      if (futureNotifications.length > 0) {
        upcomingNotifications.push({
          transaction_id: transaction.id,
          description: transaction.description || (transaction.type === 'income' ? 'Receita' : 'Despesa'),
          type: transaction.type,
          amount: Number(transaction.amount),
          scheduled_date: transaction.scheduled_date,
          notification_dates: futureNotifications
        })
      }
    }

    // Ordenar por data da próxima notificação
    upcomingNotifications.sort((a, b) => {
      const nextNotifA = a.notification_dates[0]?.date || ''
      const nextNotifB = b.notification_dates[0]?.date || ''
      return nextNotifA.localeCompare(nextNotifB)
    })

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
