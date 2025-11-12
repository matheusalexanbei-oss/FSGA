'use client'

import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import { parseLocalDate } from '@/lib/utils'
import { ChartSkeleton } from './ChartSkeleton'

interface Transaction {
  date: string
  type: 'income' | 'expense'
  amount: number
  is_paid?: boolean
  scheduled_date?: string | null
}

interface ProfitEvolutionChartProps {
  transactions: Transaction[]
  loading?: boolean
}

export function ProfitEvolutionChart({ transactions, loading = false }: ProfitEvolutionChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const chartData = useMemo(() => {
    if (loading) return []
    
    const now = new Date()
    
    // Agrupar por data e calcular lucro acumulado
    const dailyData = new Map<string, { date: string; income: number; expense: number; profit: number }>()
    
    // Processar todas as transações
    transactions.forEach(transaction => {
      // Filtrar apenas transações passadas/presentes e pagas
      // IMPORTANTE: Usar parseLocalDate para evitar problemas de timezone
      const transactionDate = parseLocalDate(transaction.date)
      const isPastOrPresent = transactionDate <= now
      const isPaid = transaction.is_paid === undefined || transaction.is_paid === true
      
      let isNotScheduled = true
      if (transaction.scheduled_date) {
        const scheduledDate = parseLocalDate(transaction.scheduled_date)
        isNotScheduled = scheduledDate <= now
      }
      
      if (!isPastOrPresent || !isPaid || !isNotScheduled) return
      
      const dateKey = transaction.date // YYYY-MM-DD format
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: dateKey,
          income: 0,
          expense: 0,
          profit: 0
        })
      }
      
      const dayData = dailyData.get(dateKey)!
      if (transaction.type === 'income') {
        dayData.income += transaction.amount
      } else {
        dayData.expense += transaction.amount
      }
      dayData.profit = dayData.income - dayData.expense
    })
    
    // Converter para array, ordenar por data e calcular lucro acumulado
    // IMPORTANTE: Usar parseLocalDate para ordenar corretamente
    const sortedData = Array.from(dailyData.values())
      .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
    
    // Calcular lucro acumulado
    let cumulativeProfit = 0
    return sortedData.map(item => {
        cumulativeProfit += item.profit
        return {
          ...item,
        date: parseLocalDate(item.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' } as any),
        cumulativeProfit
        }
      })
  }, [transactions, loading])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.date}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-green-600 font-medium">Receitas: </span>
              {formatCurrency(data.income)}
            </p>
            <p className="text-sm">
              <span className="text-red-600 font-medium">Despesas: </span>
              {formatCurrency(data.expense)}
            </p>
            <p className="text-sm">
              <span className="text-blue-600 font-medium">Lucro do dia: </span>
              {formatCurrency(data.profit)}
            </p>
            <p className="text-sm font-semibold">
              <span className="text-purple-600">Lucro Acumulado: </span>
              {formatCurrency(data.cumulativeProfit)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Renderizar skeleton após todos os hooks terem sido executados
  if (loading) {
    return <ChartSkeleton title="Evolução do Lucro" description="Lucro acumulado ao longo do tempo" />
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Lucro</CardTitle>
          <CardDescription>Lucro acumulado ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalProfit = chartData[chartData.length - 1]?.cumulativeProfit || 0
  const isPositive = totalProfit >= 0
  
  // Calcular valores mínimo e máximo de forma segura
  const profitValues = chartData.map(d => d.cumulativeProfit)
  const minValue = Math.min(...profitValues, 0)
  const maxValue = Math.max(...profitValues, 0)
  
  // Garantir que há diferença entre min e max para evitar problemas de domínio
  const domainPadding = Math.max((maxValue - minValue) * 0.1, Math.abs(maxValue) * 0.1 || 100)
  const domainMin = minValue - domainPadding
  const domainMax = maxValue + domainPadding

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Evolução do Lucro</CardTitle>
            <CardDescription>Lucro acumulado ao longo do tempo</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfit)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
      <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                stroke="#888"
                tick={{ fill: '#666' }}
              />
              <YAxis 
                className="text-xs"
                stroke="#888"
                domain={[domainMin, domainMax]}
                tickFormatter={(value) => {
                  // Formatar valores corretamente
                  const absValue = Math.abs(value)
                  if (absValue >= 1000000) {
                    return `R$ ${(value / 1000000).toFixed(1)}M`
                  } else if (absValue >= 1000) {
                    return `R$ ${(value / 1000).toFixed(1)}k`
                  } else {
                    return formatCurrency(value)
                  }
                }}
              />
              <Tooltip content={<CustomTooltip />} animationDuration={0} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="cumulativeProfit" 
                name="Lucro Acumulado"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
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
