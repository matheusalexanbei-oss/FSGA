'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useHybridAuth } from '@/hooks/useHybridAuth'

export function useNotifications() {
  const { user } = useHybridAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  const checkSubscription = useCallback(async () => {
    if (!isSupported || !user) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        // Verificar se está salvo no banco
        const supabase = createClient()
        const { data, error } = await (supabase.from('push_subscriptions' as any) as any)
          .select('id')
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)
          .maybeSingle()

        // Ignorar erro 406 (Not Acceptable) - pode ser cache do Supabase
        if (error && error.code !== 'PGRST116' && error.message !== 'JSON object requested, multiple (or no) rows returned') {
          console.warn('Aviso ao verificar subscription:', error.message)
        }

        setIsSubscribed(!!data)
      } else {
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Erro ao verificar subscription:', error)
      setIsSubscribed(false)
    }
  }, [isSupported, user])

  useEffect(() => {
    // Verificar suporte
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    // Verificar se já está inscrito quando o usuário estiver disponível
    if (isSupported && user) {
      checkSubscription()
    }
  }, [isSupported, user, checkSubscription])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notificações push não são suportadas neste navegador')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission === 'granted') {
        return true
      } else if (permission === 'denied') {
        toast.error('Permissão de notificações negada. Por favor, habilite nas configurações do navegador.')
        return false
      } else {
        toast.info('Permissão de notificações não concedida')
        return false
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      toast.error('Erro ao solicitar permissão de notificações')
      return false
    }
  }

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || !user) {
      toast.error('Usuário não autenticado ou navegador não suporta notificações')
      return false
    }

    // Validar VAPID key antes de tentar fazer subscribe
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    
    // DEBUG: Log para diagnóstico
    console.log('🔍 DEBUG VAPID Key:', {
      exists: !!vapidPublicKey,
      isString: typeof vapidPublicKey === 'string',
      length: vapidPublicKey?.length || 0,
      firstChars: vapidPublicKey?.substring(0, 30) || 'N/A',
      allVapidKeys: Object.keys(process.env).filter(k => k.includes('VAPID')),
      nodeEnv: process.env.NODE_ENV
    })
    
    if (!vapidPublicKey || vapidPublicKey.trim() === '') {
      console.error('❌ VAPID Key não encontrada ou vazia')
      console.error('📋 Variáveis NEXT_PUBLIC disponíveis:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')))
      toast.error('Chave VAPID não configurada', {
        description: 'Configure NEXT_PUBLIC_VAPID_PUBLIC_KEY no arquivo .env.local. Consulte NOTIFICACOES_SETUP.md para instruções.',
        duration: 6000
      })
      setIsLoading(false)
      return false
    }

    setIsLoading(true)

    try {
      // Solicitar permissão se necessário
      if (permission !== 'granted') {
        const granted = await requestPermission()
        if (!granted) {
          setIsLoading(false)
          return false
        }
      }

      // Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      await registration.update()

      // Converter VAPID key com tratamento de erro
      let applicationServerKey: Uint8Array
      try {
        applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
      } catch (keyError: unknown) {
        const errorMessage = keyError instanceof Error ? keyError.message : 'Erro desconhecido'
        console.error('Erro ao converter VAPID key:', errorMessage)
        toast.error('Chave VAPID inválida. Verifique a configuração.')
        setIsLoading(false)
        return false
      }

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      })

      // Salvar subscription no banco
      const supabase = createClient()
      
      // Primeiro, tentar inserir
      const { error: insertError } = await (supabase.from('push_subscriptions' as any) as any)
        .insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        })

      // Se der erro de conflito, fazer update
      if (insertError && insertError.code === '23505') {
        const { error: updateError } = await (supabase.from('push_subscriptions' as any) as any)
          .update({
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)

        if (updateError) {
          console.error('Erro ao atualizar subscription:', updateError)
          toast.error('Erro ao salvar configuração de notificações')
          setIsLoading(false)
          return false
        }
      } else if (insertError) {
        console.error('Erro ao salvar subscription:', insertError)
        toast.error('Erro ao salvar configuração de notificações')
        setIsLoading(false)
        return false
      }

      setIsSubscribed(true)
      toast.success('Notificações ativadas com sucesso!')
      setIsLoading(false)
      return true

    } catch (error: unknown) {
      console.error('Erro ao inscrever:', error)
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Permissão de notificações negada')
        } else if (error.name === 'InvalidAccessError') {
          toast.error('Chave VAPID inválida. Verifique a configuração de NEXT_PUBLIC_VAPID_PUBLIC_KEY')
        } else {
          toast.error('Erro ao ativar notificações: ' + error.message)
        }
      } else {
        toast.error('Erro ao ativar notificações: Erro desconhecido')
      }
      
      setIsLoading(false)
      return false
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported || !user) {
      return false
    }

    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Remover do banco
        const supabase = createClient()
        const { error } = await (supabase.from('push_subscriptions' as any) as any)
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)

        if (error) {
          console.error('Erro ao remover subscription:', error)
        }
      }

      setIsSubscribed(false)
      toast.success('Notificações desativadas')
      setIsLoading(false)
      return true

    } catch (error) {
      console.error('Erro ao desinscrever:', error)
      toast.error('Erro ao desativar notificações')
      setIsLoading(false)
      return false
    }
  }

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission
  }
}

// Função auxiliar para converter VAPID key (base64url para Uint8Array)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (!base64String || base64String.trim() === '') {
    throw new Error('VAPID key está vazia')
  }

  // Remover espaços e quebras de linha
  const cleaned = base64String.trim().replace(/\s/g, '')
  
  // Validar formato básico (deve conter apenas caracteres base64url válidos)
  if (!/^[A-Za-z0-9_-]+$/.test(cleaned)) {
    throw new Error('VAPID key contém caracteres inválidos. Use apenas letras, números, hífens e underscores.')
  }

  // Adicionar padding se necessário
  const padding = '='.repeat((4 - cleaned.length % 4) % 4)
  
  // Converter base64url para base64 padrão
  const base64 = (cleaned + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  try {
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('Erro ao decodificar VAPID key:', {
      keyLength: cleaned.length,
      firstChars: cleaned.substring(0, 20),
      error: errorMsg
    })
    throw new Error(`VAPID key inválida: ${errorMsg}. Verifique se a chave está completa e no formato correto.`)
  }
}

// Função auxiliar para converter ArrayBuffer para Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// Componente de botão para ativar/desativar notificações
export function NotificationToggle() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = useNotifications()

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          Desativar Notificações
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Ativar Notificações
        </>
      )}
    </Button>
  )
}

