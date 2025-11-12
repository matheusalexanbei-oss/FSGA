export type TransactionType = 'income' | 'expense'

export interface FinancialTransaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string | null
  category: string | null
  date: string
  payment_method: string | null
  scheduled_date: string | null
  is_paid: boolean | null
  notes: string | null
  created_at: string | null
  is_installment?: boolean | null
  installment_count?: number | null
  installment_number?: number | null
  category_id?: string | null
}

export interface FinancialSummary {
  totalIncome: number
  totalExpense: number
  netProfit: number
  inventoryValue: number
  period: {
    start: string
    end: string
  }
}

export interface CashFlowData {
  date: string
  income: number
  expense: number
  balance: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  count: number
}



