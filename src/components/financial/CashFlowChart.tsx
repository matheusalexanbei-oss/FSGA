'use client'

import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import { parseLocalDate } from '@/lib/utils'
import { ChartSkeleton } from './ChartSkeleton'
import { motion } from 'framer-motion'

interface Transaction {
  date: string
  type: 'income' | 'expense'
  amount: number
  is_paid?: boolean
  scheduled_date?: string | null
}

interface CashFlowChartProps {
  transactions: Transaction[]
  period?: '7d' | '30d' | '90d' | '1y'
  loading?: boolean
}

export function CashFlowChart({ transactions, period = '30d', loading = false }: CashFlowChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Processar dados para o gráfico (sempre executar hooks, mesmo quando loading)
  const chartData = useMemo(() => {
    if (loading) return []
    
    const now = new Date()
    let startDate = new Date()

    // Definir data de início baseado no período
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Filtrar transações do período e apenas pagas
    // IMPORTANTE: Usar parseLocalDate para evitar problemas de timezone
    const periodTransactions = transactions.filter(t => {
      const transactionDate = parseLocalDate(t.date)
      const dateCondition = transactionDate >= startDate
      const paidCondition = t.is_paid === undefined || t.is_paid === true
      
      let scheduledCondition = true
      if (t.scheduled_date) {
        const scheduledDate = parseLocalDate(t.scheduled_date)
        scheduledCondition = scheduledDate <= now
      }
      
      return dateCondition && paidCondition && scheduledCondition
    })

    // Agrupar por data
    const groupedByDate = periodTransactions.reduce((acc, transaction) => {
      // Limpar data para garantir apenas a parte da data (sem hora)
      const date = transaction.date.split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 }
      }
      if (transaction.type === 'income') {
        acc[date].income += transaction.amount
      } else {
        acc[date].expense += transaction.amount
      }
      return acc
    }, {} as Record<string, { date: string; income: number; expense: number }>)

    // Converter para array e ordenar
    const result = Object.values(groupedByDate)
      .sort((a, b) => {
        // Ordenar por data usando parseLocalDate
        const dateA = parseLocalDate(a.date).getTime()
        const dateB = parseLocalDate(b.date).getTime()
        return dateA - dateB
      })
      .map(item => {
        // IMPORTANTE: Parsear data usando componentes locais
        const date = parseLocalDate(item.date)
        let dateStr: string
        
        // Formatar data baseado no período
        if (period === '7d') {
          // Para 7 dias, mostrar dia e mês abreviado
          dateStr = date.toLocaleDateString('pt-BR', { 
            month: 'short', 
            day: 'numeric'
          })
        } else if (period === '30d') {
          // Para 30 dias, mostrar dia e mês abreviado
          dateStr = date.toLocaleDateString('pt-BR', { 
            month: 'short', 
            day: 'numeric'
          })
        } else {
          // Para períodos maiores, mostrar mês e ano
          dateStr = date.toLocaleDateString('pt-BR', { 
            month: 'short',
            year: '2-digit'
          })
        }
        
        return {
        ...item,
        balance: item.income - item.expense,
          date: dateStr
        }
      })
    
    return result
  }, [transactions, period, loading])

  // Calcular estatísticas (sempre executar hooks)
  const stats = useMemo(() => {
    if (loading || chartData.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        avgDaily: 0,
        trend: 0
      }
    }
    const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0)
    const totalExpense = chartData.reduce((sum, item) => sum + item.expense, 0)
    const avgDaily = chartData.length > 0 ? (totalIncome - totalExpense) / chartData.length : 0
    const trend = chartData.length >= 2 
      ? chartData[chartData.length - 1].balance - chartData[0].balance 
      : 0

    return {
      totalIncome,
      totalExpense,
      avgDaily,
      trend
    }
  }, [chartData, loading])

  // Função para formatar valor no tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Renderizar skeleton após todos os hooks terem sido executados
  if (loading) {
    return <ChartSkeleton title="Fluxo de Caixa" description="Entradas e saídas ao longo do tempo" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Fluxo de Caixa</CardTitle>
            <CardDescription>Entradas e saídas ao longo do tempo</CardDescription>
          </div>
          <div className="flex items-center gap-3">
          {stats.trend !== 0 && (
            <div className={`flex items-center gap-1 ${stats.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trend > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="text-sm font-semibold">
                {stats.trend > 0 ? '+' : ''}{formatCurrency(stats.trend)}
              </span>
            </div>
          )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Minimizar
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Expandir
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
      <CardContent>
        {chartData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  stroke="#888"
                />
                <YAxis 
                  className="text-xs"
                  stroke="#888"
                  tickFormatter={(value) => {
                    if (Math.abs(value) < 1000) {
                      return `R$ ${value.toFixed(0)}`
                    }
                    return `R$ ${(value / 1000).toFixed(1)}k`
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  animationDuration={0}
                  cursor={{ stroke: '#888', strokeWidth: 1 }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  name="Entradas" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  name="Saídas" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  name="Saldo" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Resumo estatístico */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpense)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Média Diária</p>
                <p className={`text-2xl font-bold ${stats.avgDaily >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.avgDaily)}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-64 text-gray-500"
          >
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-2 font-medium">Nenhum dado disponível</p>
              <p className="text-sm text-muted-foreground">Adicione transações para ver o fluxo de caixa</p>
            </div>
          </motion.div>
        )}
      </CardContent>
      )}
      {!isExpanded && (
        <CardContent className="py-3">
          <div className="flex items-center justify-center h-24 text-gray-500">
            <div className="text-center">
              <p className="text-sm mb-2">Gráfico minimizado</p>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                Mostrar Gráfico
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

