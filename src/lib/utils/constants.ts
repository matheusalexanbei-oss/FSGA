/**
 * Constantes da aplicação Fullstack Gestor
 */

export const APP_NAME = 'Fullstack Gestor'
export const APP_DESCRIPTION = 'Sistema ERP com catalogação de produtos assistida por IA'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCTS_NEW: '/products/new',
  PRODUCTS_IMPORT: '/products/import',
  PRODUCTS_CATEGORIES: '/products/categories',
  FINANCIAL: '/financial',
  FINANCIAL_TRANSACTIONS: '/financial/transactions',
  FINANCIAL_REPORTS: '/financial/reports',
  EXPORTS: '/exports',
  CHAT: '/chat',
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_BUSINESS: '/settings/business',
  SETTINGS_INTEGRATIONS: '/settings/integrations',
  ONBOARDING_WELCOME: '/welcome',
  ONBOARDING_BUSINESS_INFO: '/business-info',
  ONBOARDING_TOUR: '/tour',
} as const

export const API_ENDPOINTS = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const

export const PRODUCT_CATEGORIES_DEFAULT = [
  'Eletrônicos',
  'Roupas',
  'Alimentos',
  'Móveis',
  'Livros',
  'Brinquedos',
  'Esportes',
  'Beleza',
  'Automotivo',
  'Outros',
] as const

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  ISO_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const


