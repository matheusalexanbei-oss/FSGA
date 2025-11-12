'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { parseLocalDate } from '@/lib/utils'
import { AnimatedCard } from '@/components/shared/AnimatedCard'

interface Transaction {
  date: string
  type: 'income' | 'expense'
  amount: number
  is_paid?: boolean
  scheduled_date?: string | null
}

interface ProjectionsProps {
  transactions: Transaction[]
}

export function Projections({ transactions }: ProjectionsProps) {
  const projections = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Coletar dados dos últimos 3 meses
    const monthsData: Array<{
      month: number
      year: number
      revenue: number
      expenses: number
    }> = []
    
    for (let i = 2; i >= 0; i--) {
      const monthStart = new Date(currentYear, currentMonth - i, 1)
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0)
      
      const monthTransactions = transactions.filter(t => {
        if (!t.is_paid && t.is_paid !== undefined) return false
        const date = parseLocalDate(t.date)
        return date >= monthStart && date <= monthEnd
      })
      
      const revenue = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
      
      monthsData.push({
        month: currentMonth - i,
        year: currentYear,
        revenue,
        expenses
      })
    }
    
    // Calcular médias e tendências
    const avgRevenue = monthsData.reduce((sum, m) => sum + m.revenue, 0) / monthsData.length
    const avgExpenses = monthsData.reduce((sum, m) => sum + m.expenses, 0) / monthsData.length
    
    // Calcular tendência (regressão linear simples)
    const revenueTrend = calculateTrend(monthsData.map(m => m.revenue))
    const expensesTrend = calculateTrend(monthsData.map(m => m.expenses))
    
    // Projeção para o próximo mês
    const nextMonthRevenue = avgRevenue + (revenueTrend * avgRevenue / 100)
    const nextMonthExpenses = avgExpenses + (expensesTrend * avgExpenses / 100)
    const nextMonthProfit = nextMonthRevenue - nextMonthExpenses
    
    return {
      current: {
        revenue: monthsData[monthsData.length - 1]?.revenue || 0,
        expenses: monthsData[monthsData.length - 1]?.expenses || 0,
        profit: (monthsData[monthsData.length - 1]?.revenue || 0) - (monthsData[monthsData.length - 1]?.expenses || 0)
      },
      projected: {
        revenue: nextMonthRevenue,
        expenses: nextMonthExpenses,
        profit: nextMonthProfit
      },
      trends: {
        revenue: revenueTrend,
        expenses: expensesTrend
      },
      average: {
        revenue: avgRevenue,
        expenses: avgExpenses
      }
    }
  }, [transactions])
  
  // Função para calcular tendência (variação percentual média)
  function calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    
    const changes: number[] = []
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        const change = ((values[i] - values[i - 1]) / values[i - 1]) * 100
        changes.push(change)
      }
    }
    
    if (changes.length === 0) return 0
    return changes.reduce((sum, c) => sum + c, 0) / changes.length
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }
  
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />
    if (trend < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }
  
  const getTrendColor = (trend: number, isExpense: boolean = false) => {
    if (isExpense) {
      return trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-600'
    }
    return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
  }
  
  return (
    <AnimatedCard delay={0.2}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Projeções
        </CardTitle>
        <CardDescription>
          Previsão para o próximo mês baseada em histórico
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Receita Projetada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Receita Projetada</span>
              <div className={`flex items-center gap-1 ${getTrendColor(projections.trends.revenue)}`}>
                {getTrendIcon(projections.trends.revenue)}
                <span className="text-sm font-semibold">{formatPercentage(projections.trends.revenue)}</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(projections.projected.revenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Média últimos 3 meses: {formatCurrency(projections.average.revenue)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Despesas Projetadas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Despesas Projetadas</span>
              <div className={`flex items-center gap-1 ${getTrendColor(projections.trends.expenses, true)}`}>
                {getTrendIcon(-projections.trends.expenses)}
                <span className="text-sm font-semibold">{formatPercentage(projections.trends.expenses)}</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(projections.projected.expenses)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Média últimos 3 meses: {formatCurrency(projections.average.expenses)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Lucro Projetado */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Lucro Projetado</span>
              <div className={`flex items-center gap-1 ${projections.projected.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {projections.projected.profit >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {formatCurrency(projections.projected.profit)}
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className={`text-2xl font-bold ${projections.projected.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  {formatCurrency(projections.projected.profit)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Lucro atual: {formatCurrency(projections.current.profit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

