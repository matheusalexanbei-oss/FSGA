/**
 * Exports centralizados de tipos
 */

export type { Product, Category } from './product'
export type { UserProfile } from './user'

// Tipos do Supabase
export type { Database } from './database'

// Tipos auxiliares comuns
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface SelectOption {
  label: string
  value: string
}



