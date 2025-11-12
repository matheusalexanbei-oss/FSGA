import { BotResponse } from './types'

/**
 * Tipos de contexto de conversa
 */
export type ConversationContext = 
  | { type: 'list_products'; question: string; timestamp: number }
  | { type: 'confirm_action'; action: string; data: any; timestamp: number }
  | { type: 'select_product'; matches: any[]; question: string; timestamp: number }
  | { type: 'fee_question'; transactionId?: string; pendingTransaction?: any; timestamp: number }
  | { type: 'fee_amount'; transactionId: string; pendingTransaction?: any; timestamp: number }
  | { type: 'ask_amount'; intent: string; originalCommand: string; entities: any; timestamp: number }
  | null

/**
 * Armazena o contexto da última interação
 */
let conversationContext: ConversationContext = null

/**
 * Histórico de contexto (últimas 5 interações)
 */
const contextHistory: ConversationContext[] = []

/**
 * Limite de histórico
 */
const MAX_HISTORY = 5

/**
 * Define o contexto da conversa
 */
export function setConversationContext(context: ConversationContext): void {
  // Adicionar timestamp
  if (context) {
    context = { ...context, timestamp: Date.now() } as ConversationContext
    contextHistory.push(context)
    
    // Manter apenas últimas 5 interações
    if (contextHistory.length > MAX_HISTORY) {
      contextHistory.shift()
    }
  }
  
  conversationContext = context
}

/**
 * Busca o contexto mais recente de um tipo específico
 */
export function getLatestContextByType(type: 'list_products' | 'confirm_action' | 'select_product' | 'fee_question' | 'fee_amount' | 'ask_amount'): ConversationContext | null {
  // Primeiro verificar contexto atual
  if (conversationContext && conversationContext.type === type) {
    return conversationContext
  }
  
  // Buscar no histórico (do mais recente para o mais antigo)
  for (let i = contextHistory.length - 1; i >= 0; i--) {
    if (contextHistory[i]?.type === type) {
      return contextHistory[i]
    }
  }
  
  return null
}

/**
 * Obtém o contexto atual da conversa
 */
export function getConversationContext(): ConversationContext {
  return conversationContext
}

/**
 * Limpa o contexto da conversa
 */
export function clearConversationContext(): void {
  conversationContext = null
}

/**
 * Limpa uma mensagem removendo caracteres especiais e espaços extras
 * Mantém apenas letras, números e espaços, depois normaliza
 * Tolerante a erros de digitação como colchetes, parênteses extras, etc.
 */
function cleanMessage(message: string): string {
  // Remover caracteres especiais comuns que podem ser erros de digitação
  // Caracteres que são claramente erros: colchetes, parênteses, chaves, pontos de exclamação/interrogação extras, etc.
  let cleaned = message
    .replace(/[\[\](){}!?.,;:]/g, '') // Remove caracteres de pontuação e símbolos comuns
    .replace(/[^\w\sáàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]/gi, '') // Remove outros caracteres especiais, mantém acentos
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
    .trim()
    .toLowerCase()
  
  return cleaned
}

/**
 * Verifica se uma mensagem é uma resposta afirmativa
 * Tolerante a erros de digitação e caracteres extras
 */
export function isAffirmativeResponse(message: string): boolean {
  const cleaned = cleanMessage(message)
  
  // Palavras afirmativas (expandidas)
  const affirmativeWords = [
    'sim', 's', 'yes', 'y', 'ok', 'okay', 'okey',
    'confirmar', 'confirmo', 'confirmado', 'confirm',
    'quero', 'quero sim', 'quero confirmar',
    'aceito', 'aceitar', 'aceitado',
    'correto', 'certo', 'está certo', 'esta certo',
    'pode', 'pode ser', 'tudo bem', 'tudo certo',
    'vai', 'vamos', 'pode ir'
  ]
  
  // Verificar match exato
  if (affirmativeWords.includes(cleaned)) {
    return true
  }
  
  // Verificar se começa com palavra afirmativa (ex: "sim]", "sim!", "sim.", "sim ok")
  for (const word of affirmativeWords) {
    if (cleaned.startsWith(word)) {
      // Se a palavra afirmativa está no início
      const rest = cleaned.substring(word.length).trim()
      
      // Se não há resto após a palavra afirmativa, aceitar
      if (rest.length === 0) {
        return true
      }
      
      // Se o resto é muito curto (até 10 caracteres), provavelmente são caracteres extras removidos
      // Ex: "sim]" -> após limpar fica "sim" (rest vazio), mas se houver algo, aceitar se for curto
      if (rest.length <= 10) {
        // Verificar se são apenas palavras curtas ou caracteres que foram parcialmente removidos
        const restWords = rest.split(/\s+/).filter(w => w.length > 0)
        
        // Se não há palavras (apenas espaços ou caracteres removidos), aceitar
        if (restWords.length === 0) {
          return true
        }
        
        // Se há palavras extras, verificar se são neutras ou afirmativas
        if (restWords.length <= 2 && restWords.every(w => w.length <= 6)) {
          const neutralWords = ['ok', 'okay', 'tudo', 'bem', 'certo', 'pode', 'vai', 'vamos']
          if (restWords.every(w => neutralWords.includes(w) || affirmativeWords.includes(w))) {
            return true
          }
        }
      }
    }
  }
  
  // Verificar se contém palavra afirmativa como substring principal
  // (para casos como "quero sim" ou "sim quero")
  const words = cleaned.split(/\s+/)
  const hasAffirmativeWord = words.some(word => affirmativeWords.includes(word))
  const hasNegativeWord = words.some(word => ['não', 'nao', 'no', 'cancelar', 'cancela'].includes(word))
  
  // Se tem palavra afirmativa e não tem palavra negativa
  if (hasAffirmativeWord && !hasNegativeWord && words.length <= 3) {
    return true
  }
  
  return false
}

/**
 * Verifica se uma mensagem é uma resposta negativa
 * Tolerante a erros de digitação e caracteres extras
 */
export function isNegativeResponse(message: string): boolean {
  const cleaned = cleanMessage(message)
  
  const negativeWords = [
    'não', 'nao', 'no', 'n',
    'cancelar', 'cancela', 'cancelado', 'cancel',
    'não quero', 'nao quero', 'não quero sim',
    'errado', 'incorreto', 'não está certo', 'nao esta certo',
    'rejeitar', 'rejeito', 'rejeitado'
  ]
  
  // Verificar match exato
  if (negativeWords.includes(cleaned)) {
    return true
  }
  
  // Verificar se começa com palavra negativa
  for (const word of negativeWords) {
    if (cleaned.startsWith(word)) {
      const rest = cleaned.substring(word.length).trim()
      if (rest.length === 0 || rest.length <= 2) {
        return true
      }
    }
  }
  
  // Verificar se contém palavra negativa como substring principal
  const words = cleaned.split(/\s+/)
  const hasNegativeWord = words.some(word => negativeWords.includes(word))
  const hasAffirmativeWord = words.some(word => ['sim', 's', 'yes', 'y', 'ok'].includes(word))
  
  // Se tem palavra negativa e não tem palavra afirmativa forte
  if (hasNegativeWord && !hasAffirmativeWord && words.length <= 3) {
    return true
  }
  
  return false
}

/**
 * Verifica se uma mensagem é uma resposta simples (sim/não)
 */
export function isSimpleResponse(message: string): boolean {
  return isAffirmativeResponse(message) || isNegativeResponse(message)
}

