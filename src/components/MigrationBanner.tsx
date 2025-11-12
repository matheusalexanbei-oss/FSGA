'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Database, Cloud, Loader2 } from 'lucide-react'
import { useHybridAuth } from '@/hooks/useHybridAuth'

interface MigrationStatus {
  isVisible: boolean
  hasLocalData: boolean
  hasSupabaseData: boolean
  isMigrating: boolean
  migrationComplete: boolean
}

export function MigrationBanner() {
  const { user, isAuthenticated, useSupabase } = useHybridAuth()
  const [status, setStatus] = useState<MigrationStatus>({
    isVisible: false,
    hasLocalData: false,
    hasSupabaseData: false,
    isMigrating: false,
    migrationComplete: false
  })
  const [isChecking, setIsChecking] = useState(false)

  // Função para verificar status dos dados - declarada com useCallback ANTES do useEffect
  const checkDataStatus = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      setIsChecking(true)
      
      // Verificar se há dados no localStorage
      const localProducts = localStorage.getItem('products')
      const localCategories = localStorage.getItem('categories')
      const hasLocalData = !!(localProducts || localCategories)

      // Se estiver usando Supabase, verificar dados remotos
      let hasSupabaseData = false
      if (useSupabase) {
        // Aqui você faria a verificação real no Supabase
        // Por enquanto, vamos apenas simular
        hasSupabaseData = false // Implementar verificação real
      }

      // Mostrar banner apenas se houver dados locais E o usuário estiver usando Supabase E não houver dados remotos
      // E apenas se não foi mostrado recentemente (evita spam)
      const dismissed = localStorage.getItem('migrationBannerDismissed')
      
      // NÃO MOSTRAR O BANNER - Desabilitado temporariamente
      const shouldShowBanner = false
      
      // Lógica original comentada para referência futura:
      // const lastShown = localStorage.getItem('migrationBannerLastShown')
      // const now = Date.now()
      // const oneDay = 24 * 60 * 60 * 1000 // 24 horas em millisegundos
      // const shouldShowBanner = hasLocalData && useSupabase && !hasSupabaseData && 
      //   (!lastShown || (now - parseInt(lastShown)) > oneDay)

      setStatus({
        isVisible: shouldShowBanner,
        hasLocalData,
        hasSupabaseData,
        isMigrating: false,
        migrationComplete: false
      })
    } catch (error) {
      console.error('Erro ao verificar status dos dados:', error)
    } finally {
      setIsChecking(false)
    }
  }, [isAuthenticated, user, useSupabase])

  // Primeiro useEffect - verifica status dos dados
  useEffect(() => {
    if (isAuthenticated && user) {
      checkDataStatus()
    }
  }, [isAuthenticated, user, checkDataStatus])

  // Segundo useEffect - verifica conectividade
  useEffect(() => {
    // Verificar conectividade com Supabase periodicamente
    const interval = setInterval(() => {
      if (useSupabase && isAuthenticated) {
        checkDataStatus()
      }
    }, 60000) // A cada 1 minuto

    return () => clearInterval(interval)
  }, [useSupabase, isAuthenticated, checkDataStatus])

  const handleMigration = async () => {
    setStatus(prev => ({ ...prev, isMigrating: true }))

    try {
      // Obter dados do localStorage
      const localProducts = localStorage.getItem('products')
      const localCategories = localStorage.getItem('categories')

      if (!localProducts && !localCategories) {
        throw new Error('Nenhum dado local encontrado')
      }

      // Aqui você implementaria a migração real para o Supabase
      // Por exemplo:
      // const supabase = createClient()
      // if (localProducts) {
      //   const products = JSON.parse(localProducts)
      //   await supabase.from('products').insert(products)
      // }
      // if (localCategories) {
      //   const categories = JSON.parse(localCategories)
      //   await supabase.from('categories').insert(categories)
      // }

      // Simular migração por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStatus(prev => ({
        ...prev,
        isMigrating: false,
        migrationComplete: true,
        isVisible: false
      }))

      // Opcional: limpar dados locais após migração bem-sucedida
      // localStorage.removeItem('products')
      // localStorage.removeItem('categories')
    } catch (error) {
      console.error('Erro na migração:', error)
      setStatus(prev => ({ ...prev, isMigrating: false }))
      alert('Erro ao migrar dados. Tente novamente.')
    }
  }

  const handleDismiss = () => {
    // Marcar que o banner foi dispensado permanentemente
    localStorage.setItem('migrationBannerDismissed', 'true')
    setStatus(prev => ({ ...prev, isVisible: false }))
  }

  if (!status.isVisible || isChecking) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Migração de Dados Disponível</CardTitle>
            </div>
          </div>
          <CardDescription className="text-orange-800 dark:text-orange-200">
            Detectamos dados salvos localmente no seu navegador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Database className="h-4 w-4 text-gray-600" />
            <span>Dados locais encontrados</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Cloud className="h-4 w-4" />
            <span>Sincronizar com a nuvem</span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleMigration}
              disabled={status.isMigrating}
              className="flex-1"
            >
              {status.isMigrating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrando...
                </>
              ) : (
                'Migrar Dados'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              disabled={status.isMigrating}
            >
              Depois
            </Button>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Esta ação copiará seus dados para a nuvem, permitindo acesso de qualquer dispositivo.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}