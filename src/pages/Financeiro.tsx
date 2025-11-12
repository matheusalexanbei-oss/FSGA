'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useSecureAuth } from '@/hooks/useSecureAuth'
import { createClient } from '@/lib/supabase/client'

interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  revenueGrowth: number
  profitGrowth: number
}

interface Transaction {
  id: string
  description: string
  value: number
  date: string
  type: 'revenue' | 'expense'
  category?: string
}

const Financeiro = () => {
  const { user, useSupabase } = useSecureAuth()
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    revenueGrowth: 0,
    profitGrowth: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const loadFinancialData = async () => {
      try {
        setLoading(true)
        
        if (useSupabase) {
          // Carregar dados do Supabase
          const supabase = createClient()
          
          // Carregar produtos para calcular receita potencial
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('price, stock_quantity, cost')
            .eq('user_id', user.id)

          if (productsError) {
            console.error('Erro ao carregar produtos:', productsError)
            return
          }

          // Carregar transações financeiras (se existir tabela)
          const { data: financialTransactions, error: transactionsError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

          // Se não houver tabela de transações, simular com base nos produtos
          if (transactionsError && transactionsError.code === 'PGRST116') {
            // Tabela não existe, simular transações baseadas nos produtos
            const simulatedTransactions: Transaction[] = products?.slice(0, 5).map((product, index) => ({
              id: `sim_${index}`,
              description: `Venda - Produto ${index + 1}`,
              value: parseFloat(product.price) || 0,
              date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
              type: 'revenue' as const,
              category: 'Vendas'
            })) || []

            setTransactions(simulatedTransactions)
          } else if (financialTransactions) {
            // Usar transações reais se existirem
            const mappedTransactions: Transaction[] = financialTransactions.map(transaction => ({
              id: transaction.id,
              description: transaction.description,
              value: parseFloat(transaction.amount),
              date: new Date(transaction.created_at).toLocaleDateString('pt-BR'),
              type: transaction.type as 'revenue' | 'expense',
              category: transaction.category
            }))
            setTransactions(mappedTransactions)
          }

          // Calcular estatísticas baseadas nos produtos
          const totalRevenue = products?.reduce((sum, product) => {
            const price = parseFloat(product.price) || 0
            const stock = parseInt(product.stock_quantity) || 0
            return sum + (price * stock)
          }, 0) || 0

          const totalExpenses = products?.reduce((sum, product) => {
            const cost = parseFloat(product.cost) || 0
            const stock = parseInt(product.stock_quantity) || 0
            return sum + (cost * stock)
          }, 0) || 0

          const netProfit = totalRevenue - totalExpenses
          const revenueGrowth = 12 // Simulado por enquanto
          const profitGrowth = 15 // Simulado por enquanto

          setStats({
            totalRevenue,
            totalExpenses,
            netProfit,
            revenueGrowth,
            profitGrowth
          })

        } else {
          // Carregar dados do localStorage
          const storedProducts = localStorage.getItem(`products_${user.id}`)
          const products = storedProducts ? JSON.parse(storedProducts) : []

          // Calcular estatísticas
          const totalRevenue = products.reduce((sum: number, product: any) => {
            const price = parseFloat(product.price) || 0
            const stock = parseInt(product.stock_quantity) || 0
            return sum + (price * stock)
          }, 0)

          const totalExpenses = products.reduce((sum: number, product: any) => {
            const cost = parseFloat(product.cost) || 0
            const stock = parseInt(product.stock_quantity) || 0
            return sum + (cost * stock)
          }, 0)

          const netProfit = totalRevenue - totalExpenses

          setStats({
            totalRevenue,
            totalExpenses,
            netProfit,
            revenueGrowth: 12,
            profitGrowth: 15
          })

          // Simular transações baseadas nos produtos
          const simulatedTransactions: Transaction[] = products.slice(0, 5).map((product: any, index: number) => ({
            id: `sim_${index}`,
            description: `Venda - ${product.name}`,
            value: parseFloat(product.price) || 0,
            date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            type: 'revenue' as const,
            category: 'Vendas'
          }))

          setTransactions(simulatedTransactions)
        }
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFinancialData()
  }, [user?.id, useSupabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Carregando dados financeiros...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="w-5 h-5 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground mt-1">Análises e transações financeiras</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.revenueGrowth}% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas
            </CardTitle>
            <TrendingDown className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">operacionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
            <Activity className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {stats.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.profitGrowth}% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <span className={`font-semibold ${transaction.type === 'revenue' ? 'text-success' : 'text-destructive'}`}>
                    {transaction.type === 'revenue' ? '+' : '-'} R$ {transaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm">As transações aparecerão aqui quando houver movimentação financeira</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;



