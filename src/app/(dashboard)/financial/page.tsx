'use client'

import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, TrendingDown, Activity, Plus, History, Package, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ManualTransactionModal } from '@/components/financial/ManualTransactionModal'
import { TransactionRecordsModal } from '@/components/financial/TransactionRecordsModal'
import { PendingTransactions } from '@/components/financial/PendingTransactions'
import { CashFlowChart } from '@/components/financial/CashFlowChart'
import { RevenueExpenseChart } from '@/components/financial/RevenueExpenseChart'
import { ExpenseBreakdownChart } from '@/components/financial/ExpenseBreakdownChart'
import { ProfitEvolutionChart } from '@/components/financial/ProfitEvolutionChart'
import { TopProductsChart } from '@/components/financial/TopProductsChart'
import { MonthlyComparison } from '@/components/financial/MonthlyComparison'
import { Projections } from '@/components/financial/Projections'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'
import { FinancialTransaction } from '@/types/financial'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

type Transaction = FinancialTransaction

export default function FinancialPage() {
  const { user } = useHybridAuth()
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [userProducts, setUserProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    stockValue: 0
  })
  const [reloadTrigger, setReloadTrigger] = useState(0)

  // Carregar dados com cleanup adequado para evitar erros ao trocar de abas
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    
    let isCancelled = false
    
    const fetchData = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        
        // Carregar transações
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100)

        if (isCancelled) return
        if (transactionsError) throw transactionsError
        
        // Ordenar por data de transação
        const sorted = (transactionsData || []).sort((a, b) => {
          const dateA = parseLocalDate(a.date).getTime()
          const dateB = parseLocalDate(b.date).getTime()
          if (dateA === dateB) {
            const createdA = new Date(a.created_at || a.date).getTime()
            const createdB = new Date(b.created_at || b.date).getTime()
            return createdB - createdA
          }
          return dateB - dateA
        })
        
        if (isCancelled) return
        setTransactions(sorted as FinancialTransaction[])

        // Filtrar transações recentes
        const now = new Date()
        const recentTransactions = sorted.filter(transaction => {
          const transactionDate = parseLocalDate(transaction.date)
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          transactionDate.setHours(0, 0, 0, 0)
          
          const isPastOrPresent = transactionDate <= todayStart
          const isPaid = transaction.is_paid === undefined || transaction.is_paid === true
          
          let isNotScheduled = true
          if (transaction.scheduled_date) {
            const scheduledDate = parseLocalDate(transaction.scheduled_date)
            scheduledDate.setHours(0, 0, 0, 0)
            isNotScheduled = scheduledDate <= todayStart || isPaid
          }
          
          return isPastOrPresent && isPaid && isNotScheduled
        }).slice(0, 5)

        if (isCancelled) return
        setRecentTransactions(recentTransactions as FinancialTransaction[])

        // Verificar transações pendentes com data de hoje
        const { data: pendingTransactionsToday } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_paid', false)
          .not('scheduled_date', 'is', null)

        if (!isCancelled && pendingTransactionsToday && pendingTransactionsToday.length > 0) {
          const today = getLocalDateString()
          const todayPending = pendingTransactionsToday.filter(t => {
            if (!t.scheduled_date) return false
            const scheduledDate = parseLocalDate(t.scheduled_date)
            const todayDate = parseLocalDate(today)
            scheduledDate.setHours(0, 0, 0, 0)
            todayDate.setHours(0, 0, 0, 0)
            return scheduledDate.getTime() === todayDate.getTime()
          })

          if (todayPending.length > 0) {
            todayPending.forEach(transaction => {
              const typeLabel = transaction.type === 'income' ? 'Receber' : 'Pagar'
              const amount = parseFloat(transaction.amount.toString())
              toast.info(
                `⚠️ Transação vencendo hoje: ${typeLabel} ${formatCurrency(amount)}`,
                {
                  description: transaction.description || 'Transação pendente',
                  duration: 10000,
                }
              )
            })
          }
        }

        // Carregar produtos
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)

        if (isCancelled) return
        if (productsError) throw productsError
        setUserProducts(productsData || [])

        // Calcular estatísticas
        const { data: allTransactions } = await supabase
          .from('financial_transactions')
          .select('type, amount, is_paid, scheduled_date, date')
          .eq('user_id', user.id)

        const stockValue = productsData
          ? productsData.reduce((sum, p) => sum + (parseFloat(p.price.toString()) * p.stock_quantity), 0)
          : 0
        
        if (!isCancelled && allTransactions) {
          const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
          const parseDate = (s: string) => parseLocalDate(s)
          const eligible = allTransactions.filter(t => {
            const isPaid = t.is_paid === undefined || t.is_paid === true
            let isNotScheduled = true
            if (t.scheduled_date) {
              const sched = parseDate(t.scheduled_date)
              sched.setHours(0, 0, 0, 0)
              isNotScheduled = sched <= todayStart
            }
            const date = parseDate(t.date)
            date.setHours(0, 0, 0, 0)
            const isPastOrPresent = date <= todayStart
            return isPaid && isNotScheduled && isPastOrPresent
          })
          
          const totalRevenue = eligible
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
          
          const totalExpenses = eligible
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
          
          setStats({
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            stockValue
          })
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Erro ao carregar dados:', error)
          toast.error('Erro ao carregar dados financeiros')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchData()
    
    return () => {
      isCancelled = true
    }
  }, [user?.id, reloadTrigger])

  // Escutar eventos de atualização do bot
  useEffect(() => {
    const handleTransactionUpdate = () => {
      if (user?.id) {
        // Forçar reload através do trigger
        setReloadTrigger(prev => prev + 1)
      }
    }

    window.addEventListener('transaction-updated', handleTransactionUpdate)
    window.addEventListener('product-updated', handleTransactionUpdate)

    return () => {
      window.removeEventListener('transaction-updated', handleTransactionUpdate)
      window.removeEventListener('product-updated', handleTransactionUpdate)
    }
  }, [user?.id])

  const handleTransactionCreated = () => {
    // Forçar reload através do trigger
    setReloadTrigger(prev => prev + 1)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    toast.info('Edição de transações será implementada em breve', {
      description: 'Esta funcionalidade está em desenvolvimento'
    })
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error

      toast.success('Transação excluída com sucesso!')
      handleTransactionCreated()
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      toast.error('Erro ao excluir transação')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <PageWrapper>
      <ErrorBoundary>
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Financeiro
            </h1>
            <p className="text-muted-foreground text-lg">
              Análises e transações financeiras em tempo real
            </p>
          </div>
          <Button 
            onClick={() => setIsTransactionModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard delay={0.1} className="bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Receita
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                Total recebido
              </p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="bg-linear-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200/50 dark:border-red-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
                Despesa
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-red-500/20 dark:bg-red-500/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                {formatCurrency(stats.totalExpenses)}
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">Total gasto</p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Lucro Líquido
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>
                {formatCurrency(stats.netProfit)}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                Resultado
              </p>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.4} className="bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Valor em Estoque
              </CardTitle>
              <div className="w-10 h-10 rounded-full bg-orange-500/20 dark:bg-orange-500/30 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                {formatCurrency(stats.stockValue)}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">Investido</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Transações Recentes e Top 10 Produtos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard delay={0.6}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Transações Recentes
              </CardTitle>
              <CardDescription>Suas últimas movimentações financeiras</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setIsHistoryModalOpen(true)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Ver Histórico
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPendingModalOpen(true)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Pendentes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/50 dark:hover:bg-accent/30 transition-all duration-200 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                    >
                    <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="flex-1">
                        <p className="font-medium">
                          {(transaction.description || '').replace(/^Venda - /i, '')}
                        </p>
                          <p className="text-sm text-muted-foreground">
                          {parseLocalDate(transaction.date).toLocaleDateString('pt-BR')} • {transaction.category}
                          </p>
                        </div>
                      </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-lg ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma transação ainda</p>
                    <Button 
                      onClick={() => setIsTransactionModalOpen(true)}
                      variant="link"
                      className="mt-2"
                    >
                      Criar primeira transação
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </AnimatedCard>

          <TopProductsChart userProducts={userProducts} transactions={transactions} />
                </div>
                
        {/* Comparação Mensal e Projeções */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyComparison transactions={transactions as any} />
          <Projections transactions={transactions as any} />
        </div>

        {/* Fluxo de Caixa e Receitas vs Despesas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CashFlowChart transactions={transactions as any} period="30d" loading={loading} />
          <RevenueExpenseChart transactions={transactions as any} loading={loading} />
                </div>
                
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfitEvolutionChart transactions={transactions as any} loading={loading} />
          <ExpenseBreakdownChart transactions={transactions as any} loading={loading} />
        </div>

      </div>

      {/* Modais */}
      {user?.id && (
        <>
          <ManualTransactionModal
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            userId={user.id}
            userProducts={userProducts}
            onTransactionCreated={handleTransactionCreated}
          />
          
          {/* Modal de Histórico */}
          <TransactionRecordsModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            userId={user.id}
            onTransactionUpdated={handleTransactionCreated}
          />

          {/* Modal de Transações Pendentes */}
          <Dialog open={isPendingModalOpen} onOpenChange={setIsPendingModalOpen}>
            <DialogContent hideCloseButton className="relative max-w-4xl bg-transparent dark:bg-transparent border-0 shadow-none p-0">
              <DialogHeader className="sr-only">
                <DialogTitle>Transações Pendentes</DialogTitle>
              </DialogHeader>
              <PendingTransactions 
                userId={user.id}
                onTransactionUpdated={handleTransactionCreated}
              />
            </DialogContent>
          </Dialog>

        </>
      )}
      </ErrorBoundary>
    </PageWrapper>
  )
}




