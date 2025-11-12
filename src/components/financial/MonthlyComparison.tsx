'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { parseLocalDate } from '@/lib/utils'
import { AnimatedCard } from '@/components/shared/AnimatedCard'

interface Transaction {
  date: string
  type: 'income' | 'expense'
  amount: number
  is_paid?: boolean
  scheduled_date?: string | null
}

interface MonthlyComparisonProps {
  transactions: Transaction[]
}

export function MonthlyComparison({ transactions }: MonthlyComparisonProps) {
  const comparison = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Mês atual
    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0)
    
    // Mês anterior
    const previousMonthStart = new Date(currentYear, currentMonth - 1, 1)
    const previousMonthEnd = new Date(currentYear, currentMonth, 0)
    
    // Filtrar transações do mês atual
    const currentMonthTransactions = transactions.filter(t => {
      if (!t.is_paid && t.is_paid !== undefined) return false
      const date = parseLocalDate(t.date)
      return date >= currentMonthStart && date <= currentMonthEnd
    })
    
    // Filtrar transações do mês anterior
    const previousMonthTransactions = transactions.filter(t => {
      if (!t.is_paid && t.is_paid !== undefined) return false
      const date = parseLocalDate(t.date)
      return date >= previousMonthStart && date <= previousMonthEnd
    })
    
    // Calcular totais
    const currentRevenue = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    
    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    
    const previousRevenue = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    
    const previousExpenses = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    
    // Calcular variações percentuais
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : currentRevenue > 0 ? 100 : 0
    
    const expensesChange = previousExpenses > 0
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
      : currentExpenses > 0 ? 100 : 0
    
    const profitChange = (previousRevenue - previousExpenses) !== 0
      ? (((currentRevenue - currentExpenses) - (previousRevenue - previousExpenses)) / Math.abs(previousRevenue - previousExpenses)) * 100
      : (currentRevenue - currentExpenses) > 0 ? 100 : 0
    
    return {
      current: {
        revenue: currentRevenue,
        expenses: currentExpenses,
        profit: currentRevenue - currentExpenses
      },
      previous: {
        revenue: previousRevenue,
        expenses: previousExpenses,
        profit: previousRevenue - previousExpenses
      },
      changes: {
        revenue: revenueChange,
        expenses: expensesChange,
        profit: profitChange
      }
    }
  }, [transactions])
  
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
  
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }
  
  const getTrendColor = (change: number, isExpense: boolean = false) => {
    if (isExpense) {
      // Para despesas, aumento é ruim (vermelho), diminuição é bom (verde)
      return change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600'
    }
    // Para receitas e lucro, aumento é bom (verde), diminuição é ruim (vermelho)
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
  }
  
  return (
    <AnimatedCard delay={0.1}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Comparação Mensal
        </CardTitle>
        <CardDescription>
          Mês atual vs mês anterior
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Receita */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Receita</span>
              <div className={`flex items-center gap-1 ${getTrendColor(comparison.changes.revenue)}`}>
                {getTrendIcon(comparison.changes.revenue)}
                <span className="text-sm font-semibold">{formatPercentage(comparison.changes.revenue)}</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(comparison.current.revenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Mês anterior: {formatCurrency(comparison.previous.revenue)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Despesas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Despesas</span>
              <div className={`flex items-center gap-1 ${getTrendColor(comparison.changes.expenses, true)}`}>
                {getTrendIcon(-comparison.changes.expenses)}
                <span className="text-sm font-semibold">{formatPercentage(comparison.changes.expenses)}</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(comparison.current.expenses)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Mês anterior: {formatCurrency(comparison.previous.expenses)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Lucro */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Lucro Líquido</span>
              <div className={`flex items-center gap-1 ${getTrendColor(comparison.changes.profit)}`}>
                {getTrendIcon(comparison.changes.profit)}
                <span className="text-sm font-semibold">{formatPercentage(comparison.changes.profit)}</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className={`text-2xl font-bold ${comparison.current.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  {formatCurrency(comparison.current.profit)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Mês anterior: {formatCurrency(comparison.previous.profit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

