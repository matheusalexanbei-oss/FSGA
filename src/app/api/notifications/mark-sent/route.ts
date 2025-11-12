import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Endpoint para marcar notificação como enviada
 * Usado quando uma notificação é exibida em tempo real
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { transaction_id, notification_type, scheduled_date } = body

    if (!transaction_id || !notification_type || !scheduled_date) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: transaction_id, notification_type, scheduled_date' },
        { status: 400 }
      )
    }

    console.log('🔔 [API mark-sent] Tentando marcar notificação:', {
      user_id: user.id,
      transaction_id,
      notification_type,
      scheduled_date
    })

    // Inserir ou atualizar log de notificação
    // A constraint UNIQUE é em (user_id, transaction_id, notification_type, scheduled_date)
    // Tentar inserir primeiro, se der erro de conflito, fazer update
    const { error: insertError } = await supabase
      .from('notification_logs')
      .insert({
        user_id: user.id,
        transaction_id,
        notification_type,
        scheduled_date,
        sent_at: new Date().toISOString()
      })

    let error = insertError
    
    // Se der erro de conflito (23505 = unique violation), fazer update
    if (insertError && (insertError.code === '23505' || insertError.message?.includes('duplicate'))) {
      console.log('🔔 [API mark-sent] Conflito detectado, fazendo update...')
      const { error: updateError } = await supabase
        .from('notification_logs')
        .update({
          sent_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('transaction_id', transaction_id)
        .eq('notification_type', notification_type)
        .eq('scheduled_date', scheduled_date)
      
      error = updateError
      if (!error) {
        console.log('🔔 [API mark-sent] Update realizado com sucesso')
      }
    }

    if (error) {
      console.error('🔔 [API mark-sent] Erro ao marcar notificação como enviada:', error)
      console.error('🔔 [API mark-sent] Dados tentados:', {
        user_id: user.id,
        transaction_id,
        notification_type,
        scheduled_date,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint
      })
      // Não retornar erro 500, apenas logar - a notificação já foi exibida
      // Retornar sucesso para não bloquear o fluxo
      return NextResponse.json({ success: true, warning: 'Erro ao salvar log, mas notificação foi exibida' })
    }

    console.log('🔔 [API mark-sent] Notificação marcada como enviada com sucesso')
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Erro ao marcar notificação:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: 'Erro ao marcar notificação', details: errorMessage },
      { status: 500 }
    )
  }
}

