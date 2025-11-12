export type Intent = 
  | 'sell_product'
  | 'buy_product'
  | 'register_expense'
  | 'register_income'
  | 'check_stock'
  | 'restock_product'
  | 'list_products'
  | 'search_product'
  | 'calculate_profit'
  | 'generate_insights'
  | 'analyze_products'
  | 'check_revenue'
  | 'check_expenses'
  | 'create_task'
  | 'help'
  | 'unknown'

export interface ParsedCommand {
  intent: Intent
  confidence: number // 0-1
  entities: {
    productName?: string
    productId?: string
    amount?: number
    date?: string
    category?: string
    description?: string
    quantity?: number
    paymentScheduled?: boolean
    paymentDate?: string
    isInstallment?: boolean
    installmentCount?: number
    installmentInterval?: 'weekly' | 'monthly' | 'quarterly'
    isRecurring?: boolean
    recurringInterval?: 'weekly' | 'monthly' | 'quarterly'
    recurringEndDate?: string
    title?: string
    time?: string
  }
  raw: string // Comando original
}

export interface BotResponse {
  message: string
  type: 'success' | 'error' | 'info' | 'question' | 'confirmation'
  data?: any
  suggestions?: string[]
  requiresConfirmation?: boolean
  confirmationData?: any
  requiresInput?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  type?: 'success' | 'error' | 'info' | 'question'
  data?: any
}

export interface ConfirmationData {
  action: string
  [key: string]: any
}

