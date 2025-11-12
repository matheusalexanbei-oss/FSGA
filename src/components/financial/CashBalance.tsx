'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { AnimatedCard } from '@/components/shared/AnimatedCard'

interface CashBalanceProps {
  balance: number
  isLoading?: boolean
}

export function CashBalance({ balance, isLoading }: CashBalanceProps) {
  const isPositive = balance >= 0
  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(balance)

  if (isLoading) {
    return (
      <AnimatedCard delay={0} className="bg-linear-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">
            Dinheiro em Caixa
          </CardTitle>
          <Wallet className="w-5 h-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">R$ --</div>
          <p className="text-sm text-blue-600 mt-2">Carregando...</p>
        </CardContent>
      </AnimatedCard>
    )
  }

  return (
    <AnimatedCard 
      delay={0} 
      className={`bg-linear-to-br border ${
        isPositive 
          ? 'from-green-50 to-green-100/50 border-green-200/50' 
          : 'from-red-50 to-red-100/50 border-red-200/50'
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-sm font-medium ${
          isPositive ? 'text-green-700' : 'text-red-700'
        }`}>
          Dinheiro em Caixa
        </CardTitle>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {isPositive ? (
            <TrendingUp className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
          {formattedBalance}
        </div>
        <p className={`text-sm mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? 'Saldo positivo' : 'Saldo negativo'}
        </p>
      </CardContent>
    </AnimatedCard>
  )
}

