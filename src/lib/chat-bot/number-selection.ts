/**
 * Utilitário para detectar e processar seleções numéricas
 */

/**
 * Verifica se uma string é uma seleção numérica válida
 */
export function isNumericSelection(input: string, maxNumber: number): boolean {
  const trimmed = input.trim()
  const number = parseInt(trimmed)
  
  // Deve ser um número válido entre 1 e maxNumber
  return !isNaN(number) && number >= 1 && number <= maxNumber
}

/**
 * Extrai o índice da seleção (0-based)
 */
export function extractSelectionIndex(input: string, maxNumber: number): number | null {
  if (!isNumericSelection(input, maxNumber)) {
    return null
  }
  
  const number = parseInt(input.trim())
  return number - 1 // Converter para índice 0-based
}

/**
 * Verifica se uma string pode ser interpretada como número (mais flexível)
 */
export function couldBeNumber(input: string): boolean {
  const trimmed = input.trim().toLowerCase()
  
  // Palavras que significam números
  const numberWords: Record<string, number> = {
    'um': 1,
    'uma': 1,
    'dois': 2,
    'duas': 2,
    'três': 3,
    'tres': 3,
    'quatro': 4,
    'cinco': 5,
    'seis': 6,
    'sete': 7,
    'oito': 8,
    'nove': 9,
    'dez': 10,
    'primeiro': 1,
    'segundo': 2,
    'terceiro': 3,
    'primeira': 1,
    'segunda': 2,
    'terceira': 3,
  }
  
  // Verificar se é palavra numérica
  if (numberWords[trimmed]) {
    return true
  }
  
  // Verificar se é número puro
  const number = parseInt(trimmed)
  if (!isNaN(number)) {
    return true
  }
  
  // Verificar padrões como "opção 1", "produto 1", "número 1"
  const patterns = [
    /^(opção|opcao|produto|numero|número|item)\s*(\d+)$/i,
    /^(\d+)$/,
    /^(\d+)\s*(produto|opção|opcao|item)$/i
  ]
  
  return patterns.some(pattern => pattern.test(trimmed))
}

/**
 * Converte texto em número (suporta palavras)
 */
export function textToNumber(input: string): number | null {
  const trimmed = input.trim().toLowerCase()
  
  const numberWords: Record<string, number> = {
    'um': 1,
    'uma': 1,
    'dois': 2,
    'duas': 2,
    'três': 3,
    'tres': 3,
    'quatro': 4,
    'cinco': 5,
    'seis': 6,
    'sete': 7,
    'oito': 8,
    'nove': 9,
    'dez': 10,
    'primeiro': 1,
    'segundo': 2,
    'terceiro': 3,
    'primeira': 1,
    'segunda': 2,
    'terceira': 3,
  }
  
  // Verificar palavra numérica
  if (numberWords[trimmed]) {
    return numberWords[trimmed]
  }
  
  // Extrair número de padrões
  const patternMatch = trimmed.match(/(\d+)/)
  if (patternMatch) {
    return parseInt(patternMatch[1])
  }
  
  // Tentar parse direto
  const number = parseInt(trimmed)
  return !isNaN(number) ? number : null
}

