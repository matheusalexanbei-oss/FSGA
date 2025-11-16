'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MigrationBanner } from '@/components/MigrationBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { FloatingChatBot } from '@/components/chat/FloatingChatBot'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [products, setProducts] = useState<import('@/types/product').Product[]>([])

  // Usar autenticação híbrida
  const { isAuthenticated, loading, user } = useHybridAuth()
  
  // Ativar notificações em tempo real
  useRealtimeNotifications()

  useEffect(() => {
    // Só redirecionar após o loading terminar
    if (!loading && !isAuthenticated) {
      setShouldRedirect(true)
    }
  }, [loading, isAuthenticated])

  useEffect(() => {
    // Redirecionar em um useEffect separado
    if (shouldRedirect) {
      router.push('/login')
    }
  }, [shouldRedirect, router])

  // Carregar produtos para o bot
  const loadProducts = async () => {
    if (!user?.id || !isAuthenticated) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .limit(500) // Limite razoável

      if (!error && data) {
        setProducts(data as import('@/types/product').Product[])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos para o bot:', error)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [user?.id, isAuthenticated])

  // Escutar eventos de atualização do bot
  useEffect(() => {
    const handleProductUpdate = () => {
      loadProducts()
    }

    window.addEventListener('product-updated', handleProductUpdate)

    return () => {
      window.removeEventListener('product-updated', handleProductUpdate)
    }
  }, [user?.id, isAuthenticated])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 transition-colors">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="flex-1 p-4 sm:p-6 lg:ml-[280px]">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Redirecionar se não autenticado
  if (shouldRedirect) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Banner de Migração */}
      <MigrationBanner />
      
      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-[280px]" style={{ backgroundColor: 'hsl(var(--background))' }}>
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200" role="main" aria-label="Conteúdo principal" style={{ backgroundColor: 'hsl(var(--background))' }}>
            {children}
          </main>
        </div>
      </div>
      
      {/* Toaster para notificações */}
      <Toaster position="top-right" richColors />

      {/* BOT AI Flutuante - Sempre renderizar quando autenticado */}
      {!loading && isAuthenticated && user?.id && (
        <FloatingChatBot 
          userId={user.id}
          products={products}
          onTransactionCreated={() => {
            // Callback vazio - o evento customizado já atualiza tudo
          }}
        />
      )}
    </div>
  )
}