'use client'

import { useState, useEffect, useCallback } from 'react'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { motion } from 'framer-motion'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/product'
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Activity,
  Users,
  ArrowUpRight,
  Sparkles,
  Download
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useHybridAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Função para carregar dados
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao carregar produtos:', error)
      } else {
        setProducts((productsData || []) as Product[])
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Carregar dados dos produtos
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Escutar eventos de atualização do bot
  useEffect(() => {
    const handleProductUpdate = () => {
      if (user?.id) {
        loadDashboardData()
      }
    }

    window.addEventListener('product-updated', handleProductUpdate)
    window.addEventListener('transaction-updated', handleProductUpdate)

    return () => {
      window.removeEventListener('product-updated', handleProductUpdate)
      window.removeEventListener('transaction-updated', handleProductUpdate)
    }
  }, [user?.id, loadDashboardData])

  // Calcular estatísticas
  const totalProducts = products.length
  const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.stock_quantity), 0)
  const totalSales = products.reduce((sum, product) => sum + product.stock_quantity, 0)

  const stats = [
    {
      title: 'Produtos',
      value: totalProducts.toString(),
      change: '+0%',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Receita',
      value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`,
      change: '+0%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Vendas',
      value: totalSales.toString(),
      change: '+0%',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Clientes',
      value: '0',
      change: '+0%',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ]

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Bem-vindo de volta! 👋
          </h1>
          <p className="text-muted-foreground">
            {user?.email || 'Seu negócio'} - {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </motion.div>
      </div>


      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <AnimatedCard key={stat.title} delay={index * 0.1} hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <motion.p
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="text-3xl font-bold"
                    >
                      {stat.value}
                    </motion.p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs mês passado
                      </span>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`${stat.bgColor} p-3 rounded-full`}
                  >
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </motion.div>
                </div>
              </CardContent>
            </AnimatedCard>
          )
        })}
      </div>

      {/* Quick Actions - Full Width */}
      <AnimatedCard delay={0.4} className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Acesso Rápido
          </CardTitle>
          <CardDescription>
            Comece a usar o sistema agora mesmo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full">
            {[
              {
                title: 'Adicionar Produto',
                description: 'Cadastre produtos com IA',
                href: '/products/new',
                icon: Package,
                badge: 'Novo',
              },
              {
                title: 'Importar Lista',
                description: 'Upload de nota fiscal',
                href: '/products/import',
                icon: TrendingUp,
                badge: 'IA',
              },
              {
                title: 'Vendas',
                description: 'Gerenciar vendas e pedidos',
                href: '/sales',
                icon: ShoppingCart,
                badge: 'Em breve',
              },
                 {
                   title: 'Dashboard Financeiro',
                   description: 'Análises e insights',
                   href: '/financial',
                   icon: Activity,
                 },
                 {
                   title: 'Exportar Dados',
                   description: 'PDF, Shopify, ERP',
                   href: '/exports',
                   icon: Download,
                 },
            ].map((action, index) => {
              const ActionIcon = action.icon
              return (
                <motion.a
                  key={action.title}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 p-6 hover:border-primary/50 hover:shadow-lg transition-all w-full text-center bg-card dark:bg-gray-950"
                >
                  <div className="flex flex-col items-center justify-center gap-4 h-full">
                    <div className="rounded-xl bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                      <ActionIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 w-full">
                      <div className="flex flex-col items-center gap-2">
                        <h3 className="font-semibold text-base text-center text-foreground">
                          {action.title}
                        </h3>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground text-center leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </motion.a>
              )
            })}
          </div>
        </CardContent>
      </AnimatedCard>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

      </div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <AnimatedCard delay={0.9}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Sistema Pronto para Uso! 🎉
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seu Fullstack Gestor está configurado e pronto. Comece cadastrando seus produtos,
                  use a IA para reconhecimento automático, e acompanhe suas finanças em tempo real.
                </p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </motion.div>
    </PageWrapper>
  )
}