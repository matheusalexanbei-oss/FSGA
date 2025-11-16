'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { parseLocalDate } from '@/lib/utils'
import type { Product } from '@/types/product'
import type { FinancialTransaction } from '@/types/financial'

interface TopProductsChartProps {
  userProducts: Product[]
  transactions: FinancialTransaction[]
}

export function TopProductsChart({ userProducts, transactions }: TopProductsChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Agrupar vendas por produto
  const chartData = useMemo(() => {
    // Mapa para agrupar vendas por produto (usando product_id quando disponível)
    const salesMap = new Map()
    const now = new Date()
    
    // Para cada transação de receita
    transactions.forEach(transaction => {
      // Filtrar apenas transações pagas e não futuras
      // IMPORTANTE: Usar parseLocalDate para evitar problemas de timezone
      const transactionDate = parseLocalDate(transaction.date)
      const isPastOrPresent = transactionDate <= now
      const isPaid = transaction.is_paid === undefined || transaction.is_paid === true
      
      if (transaction.type === 'income' && transaction.description && isPastOrPresent && isPaid) {
        // Limpar descrição: remover "Venda - " e informação de parcelas
        let cleanName = transaction.description
          .replace(/^Venda - /i, '')
          .replace(/\s*\(\d+\/\d+\)\s*$/i, '')
          .replace(/\s*-\s*\d+\/\d+\s*$/i, '')
          .trim()
        
        // Se não há nome limpo, pular
        if (!cleanName) return
        
        // Se tiver product_id, usar ele como chave (melhor forma de agrupar)
        // Caso contrário, usar o nome completo normalizado (sem truncar)
        let key: string
        if (transaction.product_id) {
          key = `product_${transaction.product_id}`
        } else {
          // Normalizar chave removendo espaços extras e acentos, MAS mantendo todo o nome
          key = cleanName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        }
        
        if (salesMap.has(key)) {
          // Incrementar vendas existentes
          const existing = salesMap.get(key)
          existing.sales++
          existing.revenue += transaction.amount
        } else {
          // Tentar encontrar produto correspondente
          const product = userProducts.find(p => {
            if (p.id === transaction.product_id) return true
            
            const prodNameNormalized = p.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, ' ')
              .trim()
            
            const cleanNameNormalized = cleanName
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, ' ')
              .trim()
            
            return prodNameNormalized === cleanNameNormalized
          })
          
          // Nova entrada
          salesMap.set(key, {
            name: cleanName,
            sales: 1,
            revenue: transaction.amount,
            product
          })
        }
      }
    })
    
    // Converter para array e filtrar produtos com pelo menos 1 venda
    const allProductSales = Array.from(salesMap.values())
  .filter(p => p.sales > 0)
  .sort((a, b) => b.revenue - a.revenue)


    // Pegar top 10 e criar display names com garantia de unicidade
    const productSales = allProductSales
  .slice(0, 10)
      .map((item, index) => {
        // Criar displayName com mínimo de 30 caracteres para evitar duplicação
        let displayName = item.name
        
        // Se o nome é muito longo, corta mas mantém o suficiente para diferenciar
        if (displayName.length > 40) {
          displayName = displayName.substring(0, 40) + '...'
        }
        
        return {
          ...item,
          displayName,
          position: index + 1,
          stock: item.product?.stock_quantity || 0,
          price: item.product?.price || 0
        }
      })

    return productSales
  }, [userProducts, transactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calcular valor máximo para escala
  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(p => p.revenue)) : 0
  
  // Função para obter cor da barra baseada na posição (tons de azul)
  const getBarColor = (index: number) => {
    if (index === 0) return '#2563eb' // azul escuro
    if (index === 1) return '#3b82f6' // azul médio
    if (index === 2) return '#60a5fa' // azul claro
    return '#93c5fd' // azul bem claro
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
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
        <CardDescription>Por receita total gerada</CardDescription>
      </CardHeader>
      {isExpanded && (
      <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis 
                  dataKey="displayName" 
                  className="text-xs" 
                  stroke="#888"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-xs"
                  stroke="#888"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={(props: any) => {
                    if (!props.active || !props.payload || props.payload.length === 0) return null
                    const product = props.payload[0].payload
                    const salesText = product.sales === 1 ? 'venda' : 'vendas'
              return (
                      <div style={{
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px'
                      }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{product.name}</p>
                        <p style={{ margin: 0 }}>
                          {formatCurrency(product.revenue)} - {product.sales} {salesText}
                        </p>
                </div>
              )
                  }}
                  animationDuration={0}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma venda registrada</p>
              <p className="text-xs text-gray-400 mt-1">Registre vendas de produtos para ver as estatísticas</p>
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

