import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Obtém a data atual no formato YYYY-MM-DD usando o timezone local do usuário
 * Garante que não há problema de conversão UTC que pode mudar o dia
 * @param date Opcional: Date object para converter. Se não fornecido, usa a data atual.
 */
export function getLocalDateString(date?: Date): string {
  const dateObj = date || new Date()
  // Usar componentes locais para garantir que não há conversão UTC
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converte uma string de data (YYYY-MM-DD) para Date object usando o timezone local
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  // Criar data usando componentes locais (não UTC)
  return new Date(year, month - 1, day)
}
