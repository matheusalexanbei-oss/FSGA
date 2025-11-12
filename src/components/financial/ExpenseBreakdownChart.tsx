'use client'

import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { parseLocalDate } from '@/lib/utils'
import { ChartSkeleton } from './ChartSkeleton'

interface Transaction {
  date: string
  type: 'income' | 'expense'
  amount: number
  category: string
  is_paid?: boolean
  scheduled_date?: string | null
}

interface ExpenseBreakdownChartProps {
  transactions: Transaction[]
  loading?: boolean
}

const COLORS = [
  '#EF4444', // red-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#EC4899', // pink-500
  '#10B981', // emerald-500
  '#6366F1', // indigo-500
  '#F97316', // orange-500
  '#14B8A6', // teal-500
  '#A855F7', // purple-500
]

export function ExpenseBreakdownChart({ transactions, loading = false }: ExpenseBreakdownChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const chartData = useMemo(() => {
    if (loading) return []
    
    const now = new Date()
    
    // Agrupar despesas por categoria
    const categoryMap = new Map<string, number>()
    
    transactions.forEach(transaction => {
      // Filtrar apenas despesas passadas/presentes e pagas
      // IMPORTANTE: Usar parseLocalDate para evitar problemas de timezone
      const transactionDate = parseLocalDate(transaction.date)
      const isPastOrPresent = transactionDate <= now
      const isPaid = transaction.is_paid === undefined || transaction.is_paid === true
      
      let isNotScheduled = true
      if (transaction.scheduled_date) {
        const scheduledDate = parseLocalDate(transaction.scheduled_date)
        isNotScheduled = scheduledDate <= now
      }
      
      if (
        transaction.type === 'expense' &&
        isPastOrPresent &&
        isPaid &&
        isNotScheduled
      ) {
        const category = transaction.category || 'Sem categoria'
        const current = categoryMap.get(category) || 0
        categoryMap.set(category, current + transaction.amount)
      }
    })

    // Converter para array e calcular porcentagens
    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0)
    
    if (total === 0) {
      return []
    }
    
    const data = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / total) * 100
      }))
      .sort((a, b) => b.value - a.value)
    
    return data
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
      const data = payload[0]
      const percentage = (data.payload as any)?.percentage || 0
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-red-600 font-medium">
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-500">
            {typeof percentage === 'number' ? percentage.toFixed(1) : '0.0'}% do total
          </p>
        </div>
      )
    }
    return null
  }

  // Renderizar skeleton após todos os hooks terem sido executados
  if (loading) {
    return <ChartSkeleton title="Distribuição de Despesas" description="Despesas por categoria" />
  }

  if (chartData.length === 0) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Despesas</CardTitle>
          <CardDescription>Despesas por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Nenhuma despesa registrada</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Despesas por categoria</CardDescription>
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
      </CardHeader>
      <CardContent>
        <div style={{ height: isExpanded ? '500px' : '300px', transition: 'height 0.3s ease' }}>
          <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const data = chartData.find(item => item.name === entry.name)
                    return data ? `${entry.name}: ${data.percentage.toFixed(1)}%` : entry.name
                  }}
                  outerRadius={isExpanded ? 120 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                  ))}
                </Pie>
              <Tooltip content={<CustomTooltip />} animationDuration={0} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => {
                  const data = chartData.find(item => item.name === value)
                  return data ? `${value} (${data.percentage.toFixed(1)}%)` : value
                }}
              />
              </PieChart>
            </ResponsiveContainer>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-2">
            {chartData.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                    <div 
                    className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                    </div>
                  </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
