'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cloud, Database, RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { syncLocalDataToSupabase, loadSupabaseDataToLocal } from '@/lib/supabase/sync'
import { toast } from 'sonner'

export function SyncStatus() {
  const { user, useSupabase } = useHybridAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const handleSyncToSupabase = async () => {
    if (!user?.id) return
    
    setIsSyncing(true)
    try {
      const result = await syncLocalDataToSupabase(user.id)
      if (result.success) {
        setLastSync(new Date())
        toast.success('Dados sincronizados com sucesso!')
      } else {
        toast.error('Erro ao sincronizar dados')
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      toast.error('Erro ao sincronizar dados')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLoadFromSupabase = async () => {
    if (!user?.id) return
    
    setIsSyncing(true)
    try {
      const result = await loadSupabaseDataToLocal(user.id)
      if (result.success) {
        setLastSync(new Date())
        toast.success(`${result.products.length} produtos e ${result.categories.length} categorias carregados!`)
        // Recarregar a página para mostrar os dados
        window.location.reload()
      } else {
        toast.error('Erro ao carregar dados do Supabase')
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do Supabase')
    } finally {
      setIsSyncing(false)
    }
  }

  const getSyncStatus = () => {
    if (useSupabase) {
      return {
        status: 'connected',
        label: 'Conectado ao Supabase',
        color: 'bg-green-500',
        icon: <CheckCircle className="h-4 w-4" />
      }
    } else {
      return {
        status: 'local',
        label: 'Modo Local',
        color: 'bg-yellow-500',
        icon: <AlertCircle className="h-4 w-4" />
      }
    }
  }

  const syncStatus = getSyncStatus()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Status de Sincronização
        </CardTitle>
        <CardDescription>
          Gerencie a sincronização entre dados locais e nuvem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${syncStatus.color} text-white`}>
              {syncStatus.icon}
              {syncStatus.label}
            </Badge>
          </div>
          {lastSync && (
            <span className="text-sm text-muted-foreground">
              Última sincronização: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Database className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Dados Locais</p>
              <p className="text-sm text-muted-foreground">
                {useSupabase ? 'Sincronizados com nuvem' : 'Armazenados localmente'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Cloud className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Supabase</p>
              <p className="text-sm text-muted-foreground">
                {useSupabase ? 'Conectado e ativo' : 'Desconectado'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSyncToSupabase}
            disabled={isSyncing || useSupabase}
            variant="outline"
            className="flex-1"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {useSupabase ? 'Já Sincronizado' : 'Sincronizar para Nuvem'}
          </Button>
          
          <Button
            onClick={handleLoadFromSupabase}
            disabled={isSyncing || !useSupabase}
            variant="outline"
            className="flex-1"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            {useSupabase ? 'Recarregar da Nuvem' : 'Conectar ao Supabase'}
          </Button>
        </div>

        {!useSupabase && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Dica:</strong> Faça login com uma conta Supabase para sincronizar seus dados na nuvem e acessá-los de qualquer dispositivo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
