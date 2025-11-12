'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { useSecureAuth } from '@/hooks/useSecureAuth'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalProducts: number
  totalValue: number
  totalCategories: number
  activeProducts: number
}

interface RecentProduct {
  id: string
  name: string
  price: number
  category: string
  image_url?: string
}

interface RecentActivity {
  action: string
  time: string
}

const Dashboard = () => {
  const { user, useSupabase } = useSecureAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    totalCategories: 0,
    activeProducts: 0
  })
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const loadDashboardData = async () => {
      try {
        if (useSupabase) {
          // Carregar dados do Supabase
          const supabase = createClient()
          
          // Carregar produtos
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*, category:categories(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

          if (productsError) {
            console.error('Erro ao carregar produtos:', productsError)
            return
          }

          // Carregar categorias
          const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('id')
            .eq('user_id', user.id)

          if (categoriesError) {
            console.error('Erro ao carregar categorias:', categoriesError)
            return
          }

          // Calcular estatísticas
          const totalProducts = products?.length || 0
          const totalValue = products?.reduce((sum, product) => {
            const price = parseFloat(product.price) || 0
            const stock = parseInt(product.stock_quantity) || 0
            return sum + (price * stock)
          }, 0) || 0
          const totalCategories = categories?.length || 0
          const activeProducts = products?.filter(p => (parseInt(p.stock_quantity) || 0) > 0).length || 0

          setStats({
            totalProducts,
            totalValue,
            totalCategories,
            activeProducts
          })

          // Produtos recentes
          const recentProductsData = products?.slice(0, 3).map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            category: product.category?.name || 'Sem categoria',
            image_url: product.image_url
          })) || []

          setRecentProducts(recentProductsData)

          // Atividades recentes (simuladas por enquanto)
          setRecentActivities([
            { action: "Produto adicionado", time: "5 minutos atrás" },
            { action: "Estoque atualizado", time: "1 hora atrás" },
            { action: "Categoria criada", time: "2 horas atrás" },
          ])

        } else {
          // Carregar dados do localStorage
          const storedProducts = localStorage.getItem(`products_${user.id}`)
          const storedCategories = localStorage.getItem(`categories_${user.id}`)
          
          const products = storedProducts ? JSON.parse(storedProducts) : []
          const categories = storedCategories ? JSON.parse(storedCategories) : []

          const totalProducts = products.length
          const totalValue = products.reduce((sum: number, product: any) => {
            const price = parseFloat(product.price) || 0
            const stock = parseInt(product.stock_quantity) || 0
            return sum + (price * stock)
          }, 0)
          const totalCategories = categories.length
          const activeProducts = products.filter((p: any) => (parseInt(p.stock_quantity) || 0) > 0).length

          setStats({
            totalProducts,
            totalValue,
            totalCategories,
            activeProducts
          })

          // Produtos recentes
          const recentProductsData = products.slice(0, 3).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            category: product.category_name || 'Sem categoria',
            image_url: product.image_url
          }))

          setRecentProducts(recentProductsData)

          // Atividades recentes
          setRecentActivities([
            { action: "Produto adicionado", time: "5 minutos atrás" },
            { action: "Estoque atualizado", time: "1 hora atrás" },
            { action: "Categoria criada", time: "2 horas atrás" },
          ])
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.id, useSupabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Carregando dados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="w-5 h-5 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statsData = [
    {
      title: "Total de Produtos",
      value: stats.totalProducts.toString(),
      subtitle: "produtos cadastrados",
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Valor Total em Estoque",
      value: `R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: "todos os produtos",
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Categorias",
      value: stats.totalCategories.toString(),
      subtitle: "categorias ativas",
      icon: ShoppingCart,
      color: "text-warning",
    },
    {
      title: "Produtos Ativos",
      value: stats.activeProducts.toString(),
      subtitle: "disponíveis para venda",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm text-muted-foreground">Em estoque</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto cadastrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;



