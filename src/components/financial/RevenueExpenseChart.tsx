'use client'

import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { parseLocalDate } from '@/lib/utils'
import { ChartSkeleton } from './ChartSkeleton'

interface Transaction {
  date: string
  type: 'income' | 'expense'
  amount: number
  is_paid?: boolean
  scheduled_date?: string | null
}

interface RevenueExpenseChartProps {
  transactions: Transaction[]
  loading?: boolean
}

export function RevenueExpenseChart({ transactions, loading = false }: RevenueExpenseChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Agrupar por mês (sempre executar hooks)
  const chartData = useMemo(() => {
    if (loading) return []
    
    const now = new Date()
    
    const monthlyData = transactions.reduce((acc, transaction) => {
      // Filtrar apenas transações passadas/presentes e pagas
      // IMPORTANTE: Usar parseLocalDate para evitar problemas de timezone
      const transactionDate = parseLocalDate(transaction.date)
      const isPastOrPresent = transactionDate <= now
      const isPaid = transaction.is_paid === undefined || transaction.is_paid === true
      
      if (!isPastOrPresent || !isPaid) return acc
      
      // Usar a data já parseada
      const date = transactionDate
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          receitas: 0,
          despesas: 0,
          lucro: 0
        }
      }
      
      if (transaction.type === 'income') {
        acc[monthKey].receitas += transaction.amount
      } else {
        acc[monthKey].despesas += transaction.amount
      }
      
      acc[monthKey].lucro = acc[monthKey].receitas - acc[monthKey].despesas
      
      return acc
    }, {} as Record<string, { month: string; receitas: number; despesas: number; lucro: number }>)

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Últimos 6 meses
      .map(item => ({
        ...item,
        month: parseLocalDate(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' } as any)
      }))
  }, [transactions, loading])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Renderizar skeleton após todos os hooks terem sido executados
  if (loading) {
    return <ChartSkeleton title="Receitas vs Despesas" description="Comparação mensal de entradas e saídas" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
        <CardTitle>Receitas vs Despesas (6 Meses)</CardTitle>
        <CardDescription>Comparação mensal de entradas e saídas</CardDescription>
          </div>
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
      </CardHeader>
      {isExpanded && (
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="month" className="text-xs" stroke="#888" />
              <YAxis 
                className="text-xs"
                stroke="#888"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
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
              <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <p className="text-sm">Nenhum dado disponível</p>
            </div>
          </div>
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

