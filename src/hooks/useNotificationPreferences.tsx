'use client'

import { useState, useEffect, useCallback } from 'react'
import { useHybridAuth } from './useHybridAuth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface NotificationPreferences {
  notifications_enabled: boolean
  notifications_financial_enabled: boolean
  notifications_financial_7days: boolean
  notifications_financial_3days: boolean
  notifications_financial_day: boolean
  notifications_financial_overdue: boolean
}

export function useNotificationPreferences() {
  const { user } = useHybridAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  // Carregar preferências do perfil do usuário
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // Buscar perfil do usuário do Supabase
      const { data: profile, error } = await supabase
        .from('users_profile')
        .select('notifications_enabled, notifications_financial_enabled, notifications_financial_7days, notifications_financial_3days, notifications_financial_day, notifications_financial_overdue')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        console.error('Erro ao buscar perfil:', error)
        // Usar valores padrão se não houver perfil
        const defaultPrefs: NotificationPreferences = {
          notifications_enabled: true,
          notifications_financial_enabled: true,
          notifications_financial_7days: true,
          notifications_financial_3days: true,
          notifications_financial_day: true,
          notifications_financial_overdue: true,
        }
        setPreferences(defaultPrefs)
        setIsLoading(false)
        return
      }

      // Usar preferências do perfil
      const prefs: NotificationPreferences = {
        notifications_enabled: profile.notifications_enabled ?? true,
        notifications_financial_enabled: profile.notifications_financial_enabled ?? true,
        notifications_financial_7days: profile.notifications_financial_7days ?? true,
        notifications_financial_3days: profile.notifications_financial_3days ?? true,
        notifications_financial_day: profile.notifications_financial_day ?? true,
        notifications_financial_overdue: profile.notifications_financial_overdue ?? true,
      }

      setPreferences(prefs)
    } catch (error) {
      console.error('Erro ao carregar preferências de notificações:', error)
      toast.error('Erro ao carregar preferências de notificações')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // Salvar preferências
  const savePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return false
    }

    try {
      setIsSaving(true)

      const { error } = await supabase
        .from('users_profile')
        .update(newPreferences)
        .eq('id', user.id)

      if (error) {
        console.error('Erro ao salvar preferências:', error)
        toast.error('Erro ao salvar preferências')
        return false
      }

      // Atualizar estado local
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null)
      toast.success('Preferências salvas com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      toast.error('Erro ao salvar preferências')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [user, supabase])

  // Atualizar preferência individual
  const updatePreference = useCallback(async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (!preferences) return false

    const newPreferences = { [key]: value }
    
    // Se desabilitar notificações financeiras, desabilitar todas as sub-opções
    if (key === 'notifications_financial_enabled' && !value) {
      Object.assign(newPreferences, {
        notifications_financial_7days: false,
        notifications_financial_3days: false,
        notifications_financial_day: false,
        notifications_financial_overdue: false,
      })
    }

    // Se desabilitar todas as notificações, desabilitar notificações financeiras também
    if (key === 'notifications_enabled' && !value) {
      Object.assign(newPreferences, {
        notifications_financial_enabled: false,
        notifications_financial_7days: false,
        notifications_financial_3days: false,
        notifications_financial_day: false,
        notifications_financial_overdue: false,
      })
    }

    return await savePreferences(newPreferences)
  }, [preferences, savePreferences])

  // Carregar preferências quando o componente montar ou quando o perfil mudar
  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  return {
    preferences,
    isLoading,
    isSaving,
    updatePreference,
    savePreferences,
    reload: loadPreferences,
  }
}

