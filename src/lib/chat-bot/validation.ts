import { ParsedCommand, Intent } from './types'
import { validateDate } from './date-patterns'
import { 
  suggestSimilarCommands as smartSuggestSimilar,
  generateContextualSuggestions as smartContextualSuggestions,
  getExampleCommandsByCategory,
  addToHistory
} from './suggestions'

/**
 * Erros de validação
 */
export interface ValidationError {
  field: string
  message: string
  suggestion?: string
}

/**
 * Resultado da validação
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  suggestions: string[]
}

/**
 * Valida um comando parseado
 */
export function validateCommand(parsed: ParsedCommand): ValidationResult {
  const errors: ValidationError[] = []
  const suggestions: string[] = []

  // Validar intenção
  if (parsed.intent === 'unknown') {
    errors.push({
      field: 'intent',
      message: 'Não consegui entender o comando.',
      suggestion: 'Tente usar "vendi", "gastei", "recebi" ou "ajuda"'
    })
    suggestions.push('vendi o colar', 'gastei 50 reais', 'recebi 200 reais', 'ajuda')
  }

  // Validar datas
  if (parsed.entities.date && !validateDate(parsed.entities.date)) {
    errors.push({
      field: 'date',
      message: 'Data inválida detectada.',
      suggestion: 'Use formatos como "hoje", "amanhã", "dia 15" ou "15/02/2025"'
    })
  }

  if (parsed.entities.paymentDate && !validateDate(parsed.entities.paymentDate)) {
    errors.push({
      field: 'paymentDate',
      message: 'Data de pagamento inválida.',
      suggestion: 'Use formatos como "mês que vem", "semana que vem" ou "dia 15/02"'
    })
  }

  if (parsed.entities.recurringEndDate && !validateDate(parsed.entities.recurringEndDate)) {
    errors.push({
      field: 'recurringEndDate',
      message: 'Data de término da recorrência inválida.',
      suggestion: 'Use formatos como "dia 15/02" ou "15 de fevereiro"'
    })
  }

  // Validar valores monetários
  if (parsed.intent === 'register_expense' || parsed.intent === 'register_income') {
    if (!parsed.entities.amount || parsed.entities.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Valor não informado ou inválido.',
        suggestion: 'Informe o valor, por exemplo: "gastei 50 reais" ou "recebi 200 reais"'
      })
    }
  }

  // Validar parcelamentos
  if (parsed.entities.isInstallment) {
    if (!parsed.entities.installmentCount || parsed.entities.installmentCount < 2) {
      errors.push({
        field: 'installmentCount',
        message: 'Número de parcelas inválido.',
        suggestion: 'Informe o número de parcelas, por exemplo: "vendi em 3x" ou "parcelado em 6 vezes"'
      })
    }
    // Para vendas de produtos, não exigir amount se houver productName (o valor virá do produto)
    // Para despesas/receitas, permitir que o handler faça pergunta ao invés de bloquear aqui
    // O handler irá perguntar ao usuário se não tiver o valor
    const isProductSale = parsed.intent === 'sell_product' && parsed.entities.productName
    // Só adicionar erro de amount se não for produto (o handler vai perguntar se necessário)
    // Não adicionar erro aqui para permitir que o handler faça a pergunta de forma mais contextual
  }

  // Validar recorrências
  if (parsed.entities.isRecurring) {
    if (!parsed.entities.amount || parsed.entities.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Valor não informado para recorrência.',
        suggestion: 'Informe o valor, por exemplo: "receita de 200 reais todo mês"'
      })
    }
    if (!parsed.entities.recurringInterval) {
      errors.push({
        field: 'recurringInterval',
        message: 'Intervalo de recorrência não detectado.',
        suggestion: 'Informe o intervalo, por exemplo: "todo mês", "toda semana" ou "mensalmente"'
      })
    }
  }

  // Validar vendas
  if (parsed.intent === 'sell_product') {
    if (!parsed.entities.productName) {
      errors.push({
        field: 'productName',
        message: 'Nome do produto não informado.',
        suggestion: 'Informe o nome do produto, por exemplo: "vendi o colar de pérolas"'
      })
    }
  }

  // Gerar sugestões baseadas no contexto
  if (errors.length > 0) {
    suggestions.push(...generateContextualSuggestions(parsed, errors))
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions: [...new Set(suggestions)] // Remove duplicatas
  }
}

/**
 * Gera sugestões contextuais baseadas no comando e erros
 */
function generateContextualSuggestions(parsed: ParsedCommand, errors: ValidationError[]): string[] {
  // Usar sistema inteligente de sugestões
  const smartSuggestions = smartContextualSuggestions(parsed, errors)
  
  const suggestions: string[] = [...smartSuggestions]

  // Se não conseguiu entender a intenção, sugerir comandos básicos
  if (parsed.intent === 'unknown') {
    const commandWords = parsed.raw.toLowerCase().split(/\s+/)
    
    // Se mencionou "vendi" ou "venda"
    if (commandWords.some(w => w.includes('vend'))) {
      suggestions.push(...getExampleCommandsByCategory('sales'))
    }
    
    // Se mencionou "gastei" ou "gasto" ou "comprei"
    if (commandWords.some(w => w.includes('gast') || w.includes('compr'))) {
      suggestions.push(...getExampleCommandsByCategory('expenses'))
    }
    
    // Se mencionou "recebi" ou "receita"
    if (commandWords.some(w => w.includes('receb') || w.includes('receit'))) {
      suggestions.push(...getExampleCommandsByCategory('income'))
    }
    
    // Se mencionou "estoque"
    if (commandWords.some(w => w.includes('estoque') || w.includes('quant'))) {
      suggestions.push(...getExampleCommandsByCategory('stock'))
    }
  }

  // Se tem erro de valor, sugerir comandos com valores
  if (errors.some(e => e.field === 'amount')) {
    suggestions.push('50 reais', 'R$ 100', '200,50 reais', '3799 reais')
  }

  // Se tem erro de data, sugerir formatos de data
  if (errors.some(e => e.field === 'date' || e.field === 'paymentDate')) {
    suggestions.push('hoje', 'amanhã', 'mês que vem', 'dia 15/02')
  }

  // Se tem erro de produto, sugerir comandos de produto
  if (errors.some(e => e.field === 'productName')) {
    suggestions.push('vendi o colar', 'vendi produto', 'listar produtos')
  }

  return [...new Set(suggestions)].slice(0, 8) // Limitar a 8 sugestões
}

/**
 * Formata mensagem de erro amigável
 */
export function formatValidationError(result: ValidationResult): string {
  if (result.isValid) {
    return ''
  }

  if (result.errors.length === 1) {
    return `⚠️ ${result.errors[0].message}${result.errors[0].suggestion ? `\n💡 ${result.errors[0].suggestion}` : ''}`
  }

  let message = '⚠️ Encontrei alguns problemas:\n\n'
  result.errors.forEach((error, index) => {
    message += `${index + 1}. ${error.message}${error.suggestion ? `\n   💡 ${error.suggestion}` : ''}\n\n`
  })

  if (result.suggestions.length > 0) {
    message += '💡 Sugestões:\n'
    result.suggestions.slice(0, 3).forEach(suggestion => {
      message += `   • ${suggestion}\n`
    })
  }

  return message.trim()
}

/**
 * Sugere comandos similares baseado em palavras-chave (usando sistema inteligente)
 */
export function suggestSimilarCommands(
  command: string, 
  allCommands: string[],
  parsedCommand?: ParsedCommand
): string[] {
  return smartSuggestSimilar(command, allCommands, parsedCommand)
}

