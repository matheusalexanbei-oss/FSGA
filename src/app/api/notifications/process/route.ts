import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Configurar web-push com VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:notifications@fullstackgestor.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)
}

// Função para enviar notificação push
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; data?: any }
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'financial-notification',
        requireInteraction: false,
        data: payload.data || {},
        vibrate: [200, 100, 200]
      })
    )
    return true
  } catch (error: unknown) {
    console.error('Erro ao enviar notificação push:', error)
    // Se a subscription expirou, remover do banco
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode?: number }).statusCode
      if (statusCode === 410 || statusCode === 404) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        await (supabase.from('push_subscriptions' as any) as any)
          .delete()
          .eq('endpoint', subscription.endpoint)
      }
    }
    return false
  }
}

// Função para verificar e enviar notificações
async function checkAndSendNotifications() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const sevenDaysFromNow = new Date(today)
  sevenDaysFromNow.setDate(today.getDate() + 7)
  
  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(today.getDate() + 3)

  // Buscar transações com scheduled_date nas datas relevantes (hoje, 3 dias, 7 dias)
  const targetDates = [
    today.toISOString().split('T')[0],
    threeDaysFromNow.toISOString().split('T')[0],
    sevenDaysFromNow.toISOString().split('T')[0]
  ]

  const { data: transactions, error } = await supabase
    .from('financial_transactions')
    .select('*')
    .in('scheduled_date', targetDates)
    .eq('is_paid', false)
    .or('is_recurring.eq.true,scheduled_date.not.is.null')

  if (error) {
    console.error('Erro ao buscar transações:', error)
    return { success: false, error: error.message }
  }

  if (!transactions || transactions.length === 0) {
    return { success: true, sent: 0 }
  }

  let sentCount = 0

  for (const transaction of transactions) {
    const scheduledDate = transaction.scheduled_date ? new Date(transaction.scheduled_date) : null
    if (!scheduledDate) continue

    scheduledDate.setHours(0, 0, 0, 0)

    // Determinar tipo de notificação
    let notificationType: string | null = null
    let daysUntil = 0

    if (scheduledDate.getTime() === sevenDaysFromNow.getTime()) {
      notificationType = transaction.is_recurring || transaction.notes?.includes('Recorrente') 
        ? 'recurring_7days' 
        : 'scheduled_7days'
      daysUntil = 7
    } else if (scheduledDate.getTime() === threeDaysFromNow.getTime()) {
      notificationType = transaction.is_recurring || transaction.notes?.includes('Recorrente') 
        ? 'recurring_3days' 
        : 'scheduled_3days'
      daysUntil = 3
    } else if (scheduledDate.getTime() === today.getTime()) {
      notificationType = transaction.is_recurring || transaction.notes?.includes('Recorrente')
        ? 'recurring_day'
        : 'scheduled_day'
      daysUntil = 0
    }

    if (!notificationType) continue

    // Verificar se já foi enviada esta notificação
    const { data: existingLog } = await (supabase.from('notification_logs' as any) as any)
      .select('id')
      .eq('user_id', transaction.user_id)
      .eq('transaction_id', transaction.id)
      .eq('notification_type', notificationType)
      .eq('scheduled_date', scheduledDate.toISOString().split('T')[0])
      .maybeSingle()

    if (existingLog) {
      continue // Já foi enviada
    }

    // Buscar subscriptions do usuário
    const { data: subscriptions } = await (supabase.from('push_subscriptions' as any) as any)
      .select('*')
      .eq('user_id', transaction.user_id)

    if (!subscriptions || subscriptions.length === 0) {
      continue // Usuário não tem subscriptions
    }

    // Preparar mensagem
    const transactionType = transaction.type === 'income' ? 'Receita' : 'Despesa'
    const amount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(transaction.amount)

    let title = ''
    let body = ''

    if (daysUntil === 0) {
      title = `💰 ${transactionType} hoje!`
      body = `${transaction.description || transactionType}: ${amount}`
    } else if (daysUntil === 3) {
      title = `📅 ${transactionType} em 3 dias`
      body = `${transaction.description || transactionType}: ${amount} - ${scheduledDate.toLocaleDateString('pt-BR')}`
    } else if (daysUntil === 7) {
      title = `📆 ${transactionType} em 7 dias`
      body = `${transaction.description || transactionType}: ${amount} - ${scheduledDate.toLocaleDateString('pt-BR')}`
    } else {
      // Fallback (não deveria acontecer)
      title = `⏰ ${transactionType} agendada`
      body = `${transaction.description || transactionType}: ${amount} - ${scheduledDate.toLocaleDateString('pt-BR')}`
    }

    // Enviar para todas as subscriptions do usuário
    for (const subscription of subscriptions) {
      const sent = await sendPushNotification(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth
        },
        {
          title,
          body,
          data: {
            url: '/financial',
            transactionId: transaction.id,
            type: transaction.type
          }
        }
      )

      if (sent) {
        sentCount++
      }
    }

    // Registrar no log
    await (supabase.from('notification_logs' as any) as any)
      .insert({
        user_id: transaction.user_id,
        transaction_id: transaction.id,
        notification_type: notificationType,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        sent_at: new Date().toISOString()
      })

    // Atualizar last_notification_sent
    await supabase
      .from('financial_transactions')
      .update({ last_notification_sent: today.toISOString().split('T')[0] })
      .eq('id', transaction.id)
  }

  return { success: true, sent: sentCount }
}

// Endpoint para processar notificações (chamado por cron job ou manualmente)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (opcional - pode ser chamado por cron job)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || ''

    if (authHeader !== `Bearer ${cronSecret}` && cronSecret) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const result = await checkAndSendNotifications()

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Erro ao processar notificações:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: 'Erro ao processar notificações', details: errorMessage },
      { status: 500 }
    )
  }
}

// Endpoint GET para testar (apenas em desenvolvimento)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Método não permitido' }, { status: 405 })
  }

  try {
    const result = await checkAndSendNotifications()
    return NextResponse.json(result)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: 'Erro ao processar notificações', details: errorMessage },
      { status: 500 }
    )
  }
}

