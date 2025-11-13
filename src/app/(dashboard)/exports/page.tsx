'use client'

import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, ShoppingBag, FileSpreadsheet } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Importar os modais dinamicamente sem SSR para garantir que as bibliotecas sejam carregadas no cliente
const FinancialExportModal = dynamic(
  () => import('@/components/financial/FinancialExportModal').then(mod => ({ default: mod.FinancialExportModal })),
  { ssr: false }
)
const ProductExportModal = dynamic(
  () => import('@/components/export/ProductExportModal').then(mod => ({ default: mod.ProductExportModal })),
  { ssr: false }
)
const ProductCatalogPDFModal = dynamic(
  () => import('@/components/export/ProductCatalogPDFModal').then(mod => ({ default: mod.ProductCatalogPDFModal })),
  { ssr: false }
)
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { createClient } from '@/lib/supabase/client'
import { FinancialTransaction } from '@/types/financial'
import type { Product } from '@/types/product'
import type { Category } from '@/lib/categories'
import { loadDataSmartly } from '@/lib/supabase/sync'

export default function ExportsPage() {
  const { user, useSupabase } = useHybridAuth()
  const [isFinancialExportOpen, setIsFinancialExportOpen] = useState(false)
  const [isProductExportOpen, setIsProductExportOpen] = useState(false)
  const [isProductCatalogPDFOpen, setIsProductCatalogPDFOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [financialData, setFinancialData] = useState({
    transactions: [] as FinancialTransaction[],
    stats: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      cashBalance: 0,
      stockValue: 0
    }
  })
  const [loadingFinancial, setLoadingFinancial] = useState(false)

  const loadFinancialData = async () => {
    if (!user?.id) return
    
    setLoadingFinancial(true)
    try {
      const supabase = createClient()
      
      // Carregar transações
      const { data: transactionsData } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .limit(1000)

      // Carregar produtos para calcular valor em estoque
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)

      // Calcular estatísticas
      const transactions = (transactionsData || []) as FinancialTransaction[]
      const totalRevenue = transactions
        .filter(t => t.type === 'income' && (t.is_paid !== false))
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense' && (t.is_paid !== false))
        .reduce((sum, t) => sum + t.amount, 0)

      const stockValue = (productsData || []).reduce((sum: number, p: Product) => sum + (p.price * (p.stock_quantity || 0)), 0)

      // Carregar saldo em caixa
      const { data: profile } = await supabase
        .from('users_profile')
        .select('cash_balance')
        .eq('id', user.id)
        .single()

      const cashBalance = profile?.cash_balance ? parseFloat(profile.cash_balance.toString()) : 0

      setFinancialData({
        transactions,
        stats: {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          cashBalance,
          stockValue
        }
      })
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoadingFinancial(false)
    }
  }

  // Carregar produtos e categorias
  const loadProductsData = async () => {
    if (!user?.id) return
    
    setLoadingProducts(true)
    try {
      if (useSupabase) {
        const data = await loadDataSmartly(user.id)
        setProducts(data.products || [])
        setCategories(data.categories || [])
      } else {
        // Carregar do localStorage
        const storedProducts = localStorage.getItem(`products_${user.id}`)
        const storedCategories = localStorage.getItem(`categories_${user.id}`)
        
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts))
        }
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadProductsData()
    }
  }, [user?.id, useSupabase])

  useEffect(() => {
    if (isFinancialExportOpen && user?.id) {
      loadFinancialData()
    }
  }, [isFinancialExportOpen, user?.id])

  useEffect(() => {
    if ((isProductExportOpen || isProductCatalogPDFOpen) && user?.id && products.length === 0) {
      loadProductsData()
    }
  }, [isProductExportOpen, isProductCatalogPDFOpen, user?.id])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Exportações
          </h1>
          <p className="text-muted-foreground text-lg">
            Exportar dados e catálogos para diferentes plataformas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard delay={0.1} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Catálogo PDF</CardTitle>
                  <CardDescription>Exporte seu estoque completo em PDF</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Gere um catálogo profissional com fotos e preços de todos os seus produtos para compartilhar em redes sociais.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Inclui fotos dos produtos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Preços atualizados</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Layout profissional</span>
                </div>
              </div>
              <Button 
                onClick={() => setIsProductCatalogPDFOpen(true)}
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all duration-200"
                disabled={loadingProducts}
              >
                <Download className="w-4 h-4 mr-2" />
                {loadingProducts ? 'Carregando...' : 'Gerar Catálogo PDF'}
              </Button>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Integração Shopify</CardTitle>
                  <CardDescription>Sincronize com sua loja Shopify</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Conecte sua loja Shopify e sincronize produtos, estoque e vendas automaticamente.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Sincronização automática</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Gestão de estoque</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Relatórios de vendas</span>
                </div>
              </div>
              <Button variant="outline" className="w-full border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all duration-200">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Configurar Shopify
              </Button>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Integração Nuvemshop</CardTitle>
                  <CardDescription>Sincronize com sua Nuvemshop</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Conecte sua loja Nuvemshop e mantenha tudo sincronizado em tempo real.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Tempo real</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Multi-categoria</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Backup automático</span>
                </div>
              </div>
              <Button variant="outline" className="w-full border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Configurar Nuvemshop
              </Button>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.4} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Exportar Dados</CardTitle>
                  <CardDescription>Baixe seus dados em Excel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Exporte seus produtos, estoque e vendas em formato Excel para análise offline.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Formato Excel (.xlsx)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Dados completos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Análise offline</span>
                </div>
              </div>
              <Button 
                onClick={() => setIsProductExportOpen(true)}
                variant="outline" 
                className="w-full border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200"
                disabled={loadingProducts}
              >
                <Download className="w-4 h-4 mr-2" />
                {loadingProducts ? 'Carregando...' : 'Exportar para Excel'}
              </Button>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.5} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <FileSpreadsheet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Relatório Financeiro</CardTitle>
                  <CardDescription>Exporte dados financeiros em PDF ou Excel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Gere relatórios completos das suas transações financeiras, com gráficos, resumos e análises detalhadas.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Formato PDF e Excel</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Relatório completo com resumo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <span>Análise por categorias</span>
                </div>
              </div>
              <Button 
                onClick={() => setIsFinancialExportOpen(true)}
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all duration-200"
                disabled={loadingFinancial}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {loadingFinancial ? 'Carregando...' : 'Exportar Relatório Financeiro'}
              </Button>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Modais de Exportação */}
        <FinancialExportModal
          isOpen={isFinancialExportOpen}
          onClose={() => setIsFinancialExportOpen(false)}
          transactions={financialData.transactions}
          stats={financialData.stats}
          userName={user?.email || 'Usuário'}
        />

        <ProductExportModal
          isOpen={isProductExportOpen}
          onClose={() => setIsProductExportOpen(false)}
          products={products}
          categories={categories}
        />

        <ProductCatalogPDFModal
          isOpen={isProductCatalogPDFOpen}
          onClose={() => setIsProductCatalogPDFOpen(false)}
          products={products}
          categories={categories}
        />
      </div>
    </PageWrapper>
  )
}




