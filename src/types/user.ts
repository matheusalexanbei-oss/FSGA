import { User as SupabaseUser } from '@supabase/supabase-js'

export interface User extends SupabaseUser {
  // Campos adicionais podem ser adicionados aqui
  business_name?: string
  business_type?: string
}

export interface UserProfile {
  id: string
  business_name: string | null
  business_type: string | null
  cash_balance: number
  subscription_plan: 'free' | 'premium' | 'enterprise'
  ai_commands_used: number
  ai_commands_limit: number
  usage_reset_date: string
  notifications_enabled: boolean
  notifications_financial_enabled: boolean
  notifications_financial_3days: boolean
  notifications_financial_1day: boolean
  notifications_financial_day: boolean
  notifications_financial_overdue: boolean
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}



