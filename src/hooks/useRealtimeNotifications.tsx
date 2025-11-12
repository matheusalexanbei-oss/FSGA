'use client'

import { useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Notification {
  transaction_id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  scheduled_date: string
  days_until: number
  notification_type: string
  is_overdue?: boolean
}

/**
 * Hook para verificar e exibir notificações em tempo real
 * Verifica periodicamente se há notificações pendentes e exibe como toast
 */
export function useRealtimeNotifications() {
  const { user } = useHybridAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const processedNotificationsRef = useRef<Set<string>>(new Set())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const checkNotifications = useCallback(async () => {
    if (!user) {
      console.log('🔔 [Notifications] Usuário não autenticado, pulando verificação')
      return
    }

    console.log('🔔 [Notifications] Verificando notificações para usuário:', user.id)

    try {
      const response = await fetch('/api/notifications/check')
      if (!response.ok) {
        console.error('🔔 [Notifications] Erro na resposta da API:', response.status, response.statusText)
        return
      }

      const data = await response.json()
      const notifications: Notification[] = data.notifications || []
      
      console.log('🔔 [Notifications] Notificações encontradas:', notifications.length)
      if (notifications.length > 0) {
        console.log('🔔 [Notifications] Detalhes:', notifications)
      }

      for (const notification of notifications) {
        // Criar ID único para esta notificação
        const notificationId = `${notification.transaction_id}-${notification.notification_type}-${notification.scheduled_date}`
        
        // Verificar se já processamos esta notificação
        if (processedNotificationsRef.current.has(notificationId)) {
          continue
        }

        // Marcar como processada
        processedNotificationsRef.current.add(notificationId)

        // Determinar título e mensagem baseado em days_until
        // days_until = 0 significa que é HOJE
        // days_until = 1 significa que é AMANHÃ
        // days_until = 3 significa que é em 3 DIAS
        const transactionType = notification.type === 'income' ? 'Receita' : 'Despesa'
        const amount = formatCurrency(notification.amount)
        const scheduledDate = formatDate(notification.scheduled_date)
        
        let title = ''
        let description = ''
        const IconComponent = notification.type === 'income' ? TrendingUp : TrendingDown

        // Transações vencidas têm prioridade máxima
        if (notification.is_overdue || notification.days_until < 0) {
          const daysOverdue = Math.abs(notification.days_until)
          title = `🚨 ${transactionType} VENCIDA!`
          description = `${notification.description}: ${amount} - Vencida há ${daysOverdue} dia(s) - ${scheduledDate}`
        } else if (notification.days_until === 0) {
          // É hoje
          title = `💰 ${transactionType} hoje!`
          description = `${notification.description}: ${amount}`
        } else if (notification.days_until === 1) {
          // É amanhã
          title = `⏰ ${transactionType} amanhã`
          description = `${notification.description}: ${amount} - ${scheduledDate}`
        } else if (notification.days_until === 3) {
          // É em 3 dias
          title = `📅 ${transactionType} em 3 dias`
          description = `${notification.description}: ${amount} - ${scheduledDate}`
        } else {
          // Outras datas - não exibir
          console.log('🔔 [Notifications] Pulando notificação - days_until:', notification.days_until)
          continue
        }
        
        console.log('🔔 [Notifications] Exibindo notificação:', { title, description, days_until: notification.days_until, is_overdue: notification.is_overdue })

        // Exibir toast com destaque especial para vencidas
        if (notification.is_overdue || notification.days_until < 0) {
          toast.error(title, {
            description,
            duration: 15000, // Duração maior para vencidas
            icon: <IconComponent className="h-5 w-5" style={{ color: '#dc2626' }} />,
            action: {
              label: 'Ver Agora',
              onClick: () => {
                window.location.href = '/financial'
              }
            }
          })
        } else {
          toast.info(title, {
            description,
            duration: 8000,
            icon: <IconComponent className="h-5 w-5" style={{ color: notification.type === 'income' ? '#16a34a' : '#dc2626' }} />,
            action: {
              label: 'Ver',
              onClick: () => {
                window.location.href = '/financial'
              }
            }
          })
        }

        // Marcar como enviada no servidor
        try {
          await fetch('/api/notifications/mark-sent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              transaction_id: notification.transaction_id,
              notification_type: notification.notification_type,
              scheduled_date: notification.scheduled_date
            })
          })
        } catch (error) {
          console.error('Erro ao marcar notificação como enviada:', error)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      console.log('🔔 [Notifications] Hook ativado mas usuário não autenticado')
      return
    }

    console.log('🔔 [Notifications] Hook ativado para usuário:', user.id)

    // Verificar imediatamente após um pequeno delay para garantir que tudo está carregado
    const initialTimeout = setTimeout(() => {
      console.log('🔔 [Notifications] Verificação inicial...')
      checkNotifications()
    }, 1000)

    // Verificar a cada 2 minutos quando o usuário está na aplicação
    intervalRef.current = setInterval(() => {
      console.log('🔔 [Notifications] Verificação periódica...')
      checkNotifications()
    }, 2 * 60 * 1000) // 2 minutos

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [user, checkNotifications])

  // Verificar quando a página ganha foco (usuário volta para a aba)
  useEffect(() => {
    if (!user) return

    const handleFocus = () => {
      checkNotifications()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, checkNotifications])
}

