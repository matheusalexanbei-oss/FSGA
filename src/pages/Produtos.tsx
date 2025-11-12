'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  FolderPlus, 
  Search, 
  Filter,
  Database,
  Cloud,
  CheckCircle2,
  RefreshCcw,
  ChevronRight,
  MoreVertical,
  Folder
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSecureAuth } from '@/hooks/useSecureAuth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  count: number
  value: number
}

interface Product {
  id: string
  name: string
  price: number
  stock_quantity: number
  category_id?: string
  category?: {
    name: string
  }
}

const Produtos = () => {
  const { user, useSupabase } = useSecureAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState({
    connected: false,
    lastSync: null as Date | null
  })

  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      try {
        setLoading(true)
        
        if (useSupabase) {
          // Carregar dados do Supabase
          const supabase = createClient()
          
          // Carregar produtos
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*, category:categories(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (productsError) {
            console.error('Erro ao carregar produtos:', productsError)
            return
          }

          // Carregar categorias
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*, products(count)')
            .eq('user_id', user.id)
            .order('name')

          if (categoriesError) {
            console.error('Erro ao carregar categorias:', categoriesError)
            return
          }

          setProducts(productsData || [])
          
          // Calcular estatísticas das categorias
          const categoriesWithStats = categoriesData?.map(category => {
            const categoryProducts = productsData?.filter(p => p.category_id === category.id) || []
            const totalValue = categoryProducts.reduce((sum, product) => {
              const price = parseFloat(product.price) || 0
              const stock = parseInt(product.stock_quantity) || 0
              return sum + (price * stock)
            }, 0)
            
            return {
              id: category.id,
              name: category.name,
              count: categoryProducts.length,
              value: totalValue
            }
          }) || []

          // Adicionar categoria "Todos os Produtos"
          const totalProducts = productsData?.length || 0
          const totalValue = productsData?.reduce((sum, product) => {
            const price = parseFloat(product.price) || 0
            const stock = parseInt(product.stock_quantity) || 0
            return sum + (price * stock)
          }, 0) || 0

          setCategories([
            {
              id: 'all',
              name: 'Todos os Produtos',
              count: totalProducts,
              value: totalValue
            },
            ...categoriesWithStats
          ])

          setSyncStatus({
            connected: true,
            lastSync: new Date()
          })

        } else {
          // Carregar dados do localStorage
          const storedProducts = localStorage.getItem(`products_${user.id}`)
          const storedCategories = localStorage.getItem(`categories_${user.id}`)
          
          const productsData = storedProducts ? JSON.parse(storedProducts) : []
          const categoriesData = storedCategories ? JSON.parse(storedCategories) : []

          setProducts(productsData)

          // Calcular estatísticas das categorias
          const categoriesWithStats = categoriesData.map((category: any) => {
            const categoryProducts = productsData.filter((p: any) => p.category_id === category.id)
            const totalValue = categoryProducts.reduce((sum: number, product: any) => {
              const price = parseFloat(product.price) || 0
              const stock = parseInt(product.stock_quantity) || 0
              return sum + (price * stock)
            }, 0)
            
            return {
              id: category.id,
              name: category.name,
              count: categoryProducts.length,
              value: totalValue
            }
          })

          // Adicionar categoria "Todos os Produtos"
          const totalProducts = productsData.length
          const totalValue = productsData.reduce((sum: number, product: any) => {
            const price = parseFloat(product.price) || 0
            const stock = parseInt(product.stock_quantity) || 0
            return sum + (price * stock)
          }, 0)

          setCategories([
            {
              id: 'all',
              name: 'Todos os Produtos',
              count: totalProducts,
              value: totalValue
            },
            ...categoriesWithStats
          ])

          setSyncStatus({
            connected: false,
            lastSync: null
          })
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados dos produtos')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id, useSupabase])

  const handleNewProduct = () => {
    router.push('/products/new')
  }

  const handleNewCategory = () => {
    router.push('/products/categories')
  }

  const handleRefresh = async () => {
    if (!user?.id) return
    
    try {
      if (useSupabase) {
        const supabase = createClient()
        
        // Recarregar dados do Supabase
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (productsError) {
          console.error('Erro ao recarregar produtos:', productsError)
          return
        }

        setProducts(productsData || [])
        setSyncStatus({
          connected: true,
          lastSync: new Date()
        })
        
        toast.success('Dados recarregados da nuvem!')
      } else {
        // Recarregar dados do localStorage
        const storedProducts = localStorage.getItem(`products_${user.id}`)
        const productsData = storedProducts ? JSON.parse(storedProducts) : []
        setProducts(productsData)
        
        toast.success('Dados recarregados do armazenamento local!')
      }
    } catch (error) {
      console.error('Erro ao recarregar dados:', error)
      toast.error('Erro ao recarregar dados')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground mt-1">Carregando dados...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-32 mb-4"></div>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu inventário completo</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
          <Button variant="outline" onClick={handleNewCategory}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Status de Sincronização</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Gerencie a sincronização entre dados locais e nuvem
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`w-5 h-5 ${syncStatus.connected ? 'text-success' : 'text-muted-foreground'}`} />
              <span className="font-medium">
                {syncStatus.connected ? 'Conectado ao Supabase' : 'Modo Offline'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Dados Locais</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {syncStatus.connected ? 'Sincronizados com nuvem' : 'Armazenamento local ativo'}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Supabase</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {syncStatus.connected ? 'Conectado e ativo' : 'Desconectado'}
                </p>
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  {syncStatus.connected ? 'Já Sincronizado' : 'Conectar'}
                </Button>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleRefresh}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Recarregar da {syncStatus.connected ? 'Nuvem' : 'Local'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos por nome, código ou categoria..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Folder className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{category.name}</h3>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{category.count} produtos</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando sua primeira categoria'}
          </p>
          <Button onClick={handleNewCategory}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      )}
    </div>
  );
};

export default Produtos;



