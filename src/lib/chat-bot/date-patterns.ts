import { getLocalDateString, parseLocalDate } from '@/lib/utils'

/**
 * Extrai uma data relativa do comando do usuário
 * Suporta: hoje, amanhã, semana que vem, mês que vem, datas específicas
 */
export function extractRelativeDate(command: string): string {
  const today = new Date()
  const normalized = command.toLowerCase().trim()
  
  // Hoje
  if (normalized.includes('hoje') || normalized === 'hoje') {
    return getLocalDateString()
  }
  
  // Amanhã
  if (normalized.includes('amanhã') || normalized.includes('amanha') || normalized.includes('amanha')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDate(tomorrow)
  }
  
  // Ontem
  if (normalized.includes('ontem')) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return formatDate(yesterday)
  }
  
  // Semana que vem / Próxima semana
  if (normalized.includes('semana que vem') || 
      normalized.includes('próxima semana') || 
      normalized.includes('proxima semana') ||
      normalized.includes('semana proxima')) {
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    return formatDate(nextWeek)
  }
  
  // Semana passada
  if (normalized.includes('semana passada') || normalized.includes('semana anterior')) {
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    return formatDate(lastWeek)
  }
  
  // Mês que vem / Próximo mês
  if (normalized.includes('mês que vem') || 
      normalized.includes('mes que vem') || 
      normalized.includes('próximo mês') || 
      normalized.includes('proximo mes') ||
      normalized.includes('mes proximo') ||
      normalized.includes('mês proximo')) {
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return formatDate(nextMonth)
  }
  
  // Mês passado
  if (normalized.includes('mês passado') || 
      normalized.includes('mes passado') || 
      normalized.includes('mês anterior') ||
      normalized.includes('mes anterior')) {
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return formatDate(lastMonth)
  }
  
  // Ano que vem / Próximo ano
  if (normalized.includes('ano que vem') || 
      normalized.includes('próximo ano') || 
      normalized.includes('proximo ano')) {
    const nextYear = new Date(today)
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    return formatDate(nextYear)
  }
  
  // Dias da semana (próxima segunda, próxima terça, etc)
  const weekDays: Record<string, number> = {
    'domingo': 0, 'segunda': 1, 'segunda-feira': 1, 'terça': 2, 'terça-feira': 2, 'terca': 2,
    'quarta': 3, 'quarta-feira': 3, 'quinta': 4, 'quinta-feira': 4,
    'sexta': 5, 'sexta-feira': 5, 'sábado': 6, 'sabado': 6
  }
  
  for (const [dayName, dayIndex] of Object.entries(weekDays)) {
    if (normalized.includes(`próxima ${dayName}`) || normalized.includes(`proxima ${dayName}`)) {
      const targetDate = new Date(today)
      const daysUntilTarget = (dayIndex - today.getDay() + 7) % 7
      targetDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget))
      return formatDate(targetDate)
    }
    if (normalized.includes(`próximo ${dayName}`) || normalized.includes(`proximo ${dayName}`)) {
      const targetDate = new Date(today)
      const daysUntilTarget = (dayIndex - today.getDay() + 7) % 7
      targetDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget))
      return formatDate(targetDate)
    }
  }
  
  // Dia específico com múltiplos formatos:
  // "dia 15", "dia 15/02", "dia 15/02/2025", "15/02", "15/02/2025", "15-02", "15-02-2025"
  const datePatterns = [
    /(?:dia\s+)?(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/,  // 15/02/2025 ou 15-02-2025
    /(?:dia\s+)?(\d{1,2})[\/-](\d{1,2})/,              // 15/02 ou 15-02
    /dia\s+(\d{1,2})(?:\s+(?:de|do)\s+)?(?:janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)?/i,  // dia 15 ou dia 15 de janeiro
    /(\d{1,2})(?:\s+(?:de|do)\s+)?(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+(?:de|do)\s+)?(\d{4})?/i  // 15 de janeiro ou 15 de janeiro de 2025
  ]
  
  const monthNames: Record<string, number> = {
    'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3,
    'abril': 4, 'maio': 5, 'junho': 6, 'julho': 7,
    'agosto': 8, 'setembro': 9, 'outubro': 10,
    'novembro': 11, 'dezembro': 12
  }
  
  for (const pattern of datePatterns) {
    const match = command.match(pattern)
    if (match) {
      let day: number, month: number, year: number
      
      if (match[3] && match[3].length === 4) {
        // Formato completo: 15/02/2025
        day = parseInt(match[1])
        month = parseInt(match[2])
        year = parseInt(match[3])
      } else if (match[2] && monthNames[match[2].toLowerCase()]) {
        // Formato: 15 de janeiro ou 15 de janeiro de 2025
        day = parseInt(match[1])
        month = monthNames[match[2].toLowerCase()]
        year = match[3] ? parseInt(match[3]) : today.getFullYear()
      } else if (match[2]) {
        // Formato: 15/02
        day = parseInt(match[1])
        month = parseInt(match[2])
        year = today.getFullYear()
        // Se a data já passou este ano, assumir próximo ano
        if (month < today.getMonth() + 1 || (month === today.getMonth() + 1 && day < today.getDate())) {
          year = today.getFullYear() + 1
        }
      } else {
        // Formato: dia 15
        day = parseInt(match[1])
        month = today.getMonth() + 1
        year = today.getFullYear()
        // Se o dia já passou este mês, assumir próximo mês
        if (day < today.getDate()) {
          const nextMonth = new Date(today)
          nextMonth.setMonth(nextMonth.getMonth() + 1)
          month = nextMonth.getMonth() + 1
          year = nextMonth.getFullYear()
        }
      }
      
      // Validar e criar data
      const date = new Date(year, month - 1, day)
      if (isValidDate(date, day, month, year)) {
        return formatDate(date)
      }
    }
  }
  
  // Default: hoje
  return getLocalDateString()
}

/**
 * Valida se uma data é válida
 */
function isValidDate(date: Date, day: number, month: number, year: number): boolean {
  return date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year &&
         date.getTime() > 0
}

/**
 * Formata uma data para YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Valida se uma string de data é válida
 */
export function validateDate(dateString: string): boolean {
  try {
    const date = parseLocalDate(dateString)
    const [year, month, day] = dateString.split('-').map(Number)
    return isValidDate(date, day, month, year)
  } catch {
    return false
  }
}

/**
 * Formata uma data para exibição ao usuário (DD/MM/YYYY)
 */
export function formatDateString(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

