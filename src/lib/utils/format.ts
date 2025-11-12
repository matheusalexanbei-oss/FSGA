import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata um número como moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma data no formato brasileiro
 */
export function formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, pattern, { locale: ptBR })
}

/**
 * Formata uma data para exibição relativa (ex: "há 2 dias")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return 'agora mesmo'
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`
  
  return formatDate(dateObj)
}

/**
 * Formata um número com separador de milhares
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}


