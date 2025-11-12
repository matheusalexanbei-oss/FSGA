export type SubscriptionPlan = 'free' | 'premium' | 'enterprise'

export interface AIUsageLimits {
  subscription_plan: SubscriptionPlan
  commands_used: number
  commands_limit: number
  can_use_ai: boolean
  reset_date: string
}

export interface ParsedCommand {
  action: 'receita' | 'despesa' | 'sell' | 'buy' | 'expense' | 'income' | 'unknown'
  productName?: string
  amount?: number
  date?: string
  paymentScheduled?: boolean
  paymentDate?: string
  paymentMethod?: string
  category?: string
  confidence?: number
  productMatches?: ProductMatch[]
  // Parcelamento
  isInstallment?: boolean
  installmentCount?: number
  installmentInterval?: 'weekly' | 'monthly' | 'quarterly'
  // Recorrência
  isRecurring?: boolean
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly'
  recurringEndDate?: string | null
}

export interface AICommandResponse {
  success: boolean
  parsedCommand?: ParsedCommand
  confirmationText?: string
  error?: string
  usageInfo?: AIUsageLimits
}

export interface ProductMatch {
  id: string
  name: string
  price: number
  stock_quantity: number
  category?: string
  confidence: number
}

export interface AIConfirmation {
  productMatches: ProductMatch[]
  requiresConfirmation: boolean
  suggestedAction: string
  estimatedAmount?: number
}

export interface AIExecutionResult {
  success: boolean
  transactionId?: string
  productUpdated?: boolean
  stockReduced?: boolean
  cashBalanceUpdated?: boolean
  message: string
  error?: string
}

