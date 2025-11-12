'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, BellOff, BellRing, CheckCircle, XCircle, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/useNotifications'
import { UpcomingNotification } from '@/app/api/notifications/upcoming/route'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NotificationButton() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe, permission } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [upcomingNotifications, setUpcomingNotifications] = useState<UpcomingNotification[]>([])
  const [notificationsToShowToday, setNotificationsToShowToday] = useState<number>(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  // Buscar notificações que devem ser exibidas HOJE (para o badge)
  const fetchNotificationsToday = useCallback(async () => {
    try {
      console.log('🔔 [NotificationButton] Buscando notificações para hoje...')
      const response = await fetch('/api/notifications/check')
      if (response.ok) {
        const data = await response.json()
        const count = data.notifications?.length || 0
        console.log('🔔 [NotificationButton] Notificações para hoje:', count)
        setNotificationsToShowToday(count)
      } else {
        console.error('🔔 [NotificationButton] Erro ao buscar notificações para hoje:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('🔔 [NotificationButton] Erro ao buscar notificações para hoje:', error)
    }
  }, [])

  // Buscar próximas notificações (para a lista no dropdown)
  const fetchUpcomingNotifications = useCallback(async () => {
    setLoadingNotifications(true)
    try {
      console.log('🔔 [NotificationButton] Buscando próximas notificações...')
      const response = await fetch('/api/notifications/upcoming')
      if (response.ok) {
        const data = await response.json()
        console.log('🔔 [NotificationButton] Próximas notificações recebidas:', data.notifications?.length || 0)
        if (data.notifications && data.notifications.length > 0) {
          console.log('🔔 [NotificationButton] Detalhes:', data.notifications)
        }
        setUpcomingNotifications(data.notifications || [])
      } else {
        console.error('🔔 [NotificationButton] Erro na resposta:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('🔔 [NotificationButton] Erro ao buscar próximas notificações:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  // Buscar notificações quando o dropdown abrir
  useEffect(() => {
    if (isOpen) {
      fetchUpcomingNotifications()
    }
  }, [isOpen, fetchUpcomingNotifications])

  // Buscar notificações para hoje periodicamente (para o badge)
  useEffect(() => {
    // Buscar imediatamente
    fetchNotificationsToday()

    // Atualizar a cada 2 minutos (mesmo intervalo do useRealtimeNotifications)
    const interval = setInterval(() => {
      fetchNotificationsToday()
    }, 2 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchNotificationsToday])

  // Buscar próximas notificações periodicamente (para a lista)
  useEffect(() => {
    // Buscar quando o dropdown estiver aberto
    if (isOpen) {
      fetchUpcomingNotifications()
    }

    // Atualizar a cada 5 minutos quando o dropdown estiver fechado
    const interval = setInterval(() => {
      if (!isOpen) {
        fetchUpcomingNotifications()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isOpen, fetchUpcomingNotifications])

  if (!isSupported) {
    return null
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
    setIsOpen(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Amanhã'
    if (diffDays === 2) return 'Depois de amanhã'
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-primary/10 transition-all duration-200 rounded-xl"
        >
          {isSubscribed ? (
            <BellRing className="h-5 w-5 text-primary" />
          ) : (
            <Bell className="h-5 w-5 text-gray-600 hover:text-primary transition-colors" />
          )}
          {isSubscribed && (
            <>
              {notificationsToShowToday > 0 ? (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold"
                >
                  {notificationsToShowToday > 9 ? '9+' : notificationsToShowToday}
                </Badge>
              ) : (
                <Badge
                  variant="default"
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full p-0 bg-green-500 border-2 border-white"
                />
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover backdrop-blur-md border border-border shadow-xl">
        <DropdownMenuLabel className="bg-linear-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notificações</span>
            {isSubscribed ? (
              <Badge variant="default" className="bg-green-500 text-white text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Inativo
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {permission === 'denied' ? (
          <>
            <div className="p-3 text-sm text-red-600 dark:text-red-400">
              <p className="font-medium mb-1">Permissão negada</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Habilite as notificações nas configurações do navegador para receber alertas sobre transações.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2">
                {isSubscribed 
                  ? 'Você receberá notificações sobre transações recorrentes e agendadas.'
                  : 'Ative as notificações para receber alertas sobre suas transações financeiras.'
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notificações serão enviadas 3 dias antes, 1 dia antes e no dia da transação.
              </p>
            </div>
            
            <>
              <DropdownMenuSeparator />
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Próximas Notificações
                  </span>
                  {upcomingNotifications.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {upcomingNotifications.length}
                    </Badge>
                  )}
                </div>
                
                {loadingNotifications ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
                    Carregando...
                  </div>
                ) : upcomingNotifications.length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
                    Nenhuma notificação agendada
                  </div>
                ) : (
                    <ScrollArea className="h-64 pr-2">
                      <div className="space-y-2">
                        {upcomingNotifications.map((notification) => (
                          <div
                            key={notification.transaction_id}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                {notification.type === 'income' ? (
                                  <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {notification.description}
                                  </p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {notification.type === 'income' ? '+' : '-'} {formatCurrency(notification.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 space-y-1">
                              {notification.notification_dates.map((notifDate, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                                >
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatDate(notifDate.date)} - {notifDate.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
            </>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleToggle}
              disabled={isLoading}
              className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
            >
              {isSubscribed ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Desativar Notificações
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Ativar Notificações
                </>
              )}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

