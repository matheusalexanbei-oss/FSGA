/**
 * Sistema inteligente de contexto para o chat bot
 * Mantém histórico robusto de interações e entende referências contextuais
 */

import { ChatMessage } from './types'
import { getLatestContextByType, getConversationContext } from './context'
import { textToNumber } from './number-selection'

/**
 * Análise inteligente de contexto - verifica múltiplas fontes
 */
export interface ContextAnalysis {
  hasProductMatches: boolean
  productMatches: any[]
  hasPendingConfirmation: boolean
  lastQuestion?: string
  canAcceptNumber: boolean
  maxNumber?: number
}

/**
 * Analisa o contexto atual da conversa de forma robusta
 */
export function analyzeConversationContext(
  messages: ChatMessage[],
  pendingProductMatches: any[],
  pendingConfirmation: any
): ContextAnalysis {
  const analysis: ContextAnalysis = {
    hasProductMatches: false,
    productMatches: [],
    hasPendingConfirmation: !!pendingConfirmation,
    canAcceptNumber: false
  }
  
  // 1. Verificar pendingProductMatches (fonte mais confiável)
  if (pendingProductMatches.length > 0) {
    analysis.hasProductMatches = true
    analysis.productMatches = pendingProductMatches
    analysis.canAcceptNumber = true
    analysis.maxNumber = pendingProductMatches.length
  } else {
    // 2. Verificar última mensagem do bot
    const lastBotMessage = messages
      .filter(m => m.role === 'bot')
      .slice(-3) // Últimas 3 mensagens do bot
      .reverse()
      .find(m => m.data?.productMatches)
    
    if (lastBotMessage?.data?.productMatches) {
      analysis.hasProductMatches = true
      analysis.productMatches = lastBotMessage.data.productMatches
      analysis.canAcceptNumber = true
      analysis.maxNumber = lastBotMessage.data.productMatches.length
    }
    
    // 3. Verificar contexto global
    const selectContext = getLatestContextByType('select_product')
    if (selectContext && selectContext.type === 'select_product') {
      if (!analysis.hasProductMatches && selectContext.matches?.length > 0) {
        analysis.hasProductMatches = true
        analysis.productMatches = selectContext.matches
        analysis.canAcceptNumber = true
        analysis.maxNumber = selectContext.matches.length
      }
    }
  }
  
  // Extrair última pergunta (qualquer mensagem do bot que possa ser uma pergunta)
  const lastQuestion = messages
    .filter(m => m.role === 'bot' && m.content.includes('?'))
    .pop()?.content
  
  if (lastQuestion) {
    analysis.lastQuestion = lastQuestion
  }
  
  return analysis
}

/**
 * Processa uma entrada do usuário considerando contexto robusto
 */
export function processWithContext(
  userInput: string,
  analysis: ContextAnalysis
): {
  isNumericSelection: boolean
  selectedIndex: number | null
  isValid: boolean
} {
  // Verificar se o comando contém palavras-chave de ação (não é seleção)
  const actionKeywords = /(reposição|resposição|repor|adicionar|aumentar|vendi|comprei|vender|comprar|gastei|recebi)/i
  if (actionKeywords.test(userInput)) {
    // Comando de ação, não seleção numérica
    return {
      isNumericSelection: false,
      selectedIndex: null,
      isValid: false
    }
  }
  
  // Se não pode aceitar número, não processar
  if (!analysis.canAcceptNumber || analysis.productMatches.length === 0) {
    return {
      isNumericSelection: false,
      selectedIndex: null,
      isValid: false
    }
  }
  
  // Tentar converter para número
  const selectedNumber = textToNumber(userInput)
  
  if (selectedNumber === null) {
    return {
      isNumericSelection: false,
      selectedIndex: null,
      isValid: false
    }
  }
  
  // Verificar se está no range válido
  if (selectedNumber < 1 || selectedNumber > analysis.productMatches.length) {
    return {
      isNumericSelection: true,
      selectedIndex: null,
      isValid: false
    }
  }
  
  return {
    isNumericSelection: true,
    selectedIndex: selectedNumber - 1,
    isValid: true
  }
}

/**
 * Verifica se uma mensagem pode ser interpretada como resposta a uma pergunta anterior
 */
export function couldBeAnswerToQuestion(
  userInput: string,
  lastQuestion?: string
): boolean {
  if (!lastQuestion) return false
  
  const normalizedInput = userInput.toLowerCase().trim()
  const normalizedQuestion = lastQuestion.toLowerCase()
  
  // Verificar padrões de resposta
  const answerPatterns = [
    /^(sim|não|nao|ok|okay|confirmar|cancelar)$/i,
    /^(\d+)$/, // Números
    /^(um|dois|três|tres|quatro|cinco|seis|sete|oito|nove|dez)$/i,
    /^(primeiro|segundo|terceiro|quarto|quinto)$/i,
  ]
  
  return answerPatterns.some(pattern => pattern.test(normalizedInput))
}

