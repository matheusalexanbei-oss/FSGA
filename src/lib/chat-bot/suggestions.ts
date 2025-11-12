import { ParsedCommand, Intent } from './types'

/**
 * Histórico de comandos do usuário (armazenado em memória, pode ser migrado para localStorage)
 */
interface CommandHistoryEntry {
  command: string
  intent: Intent
  timestamp: number
  success: boolean
}

let commandHistory: CommandHistoryEntry[] = []

/**
 * Adiciona um comando ao histórico
 */
export function addToHistory(command: string, intent: Intent, success: boolean = true) {
  commandHistory.push({
    command,
    intent,
    timestamp: Date.now(),
    success
  })
  
  // Manter apenas os últimos 50 comandos
  if (commandHistory.length > 50) {
    commandHistory = commandHistory.slice(-50)
  }
}

/**
 * Limpa o histórico de comandos
 */
export function clearHistory() {
  commandHistory = []
}

/**
 * Obtém histórico recente de comandos
 */
export function getRecentHistory(limit: number = 10): CommandHistoryEntry[] {
  return commandHistory.slice(-limit)
}

/**
 * Obtém histórico por intenção
 */
export function getHistoryByIntent(intent: Intent, limit: number = 5): CommandHistoryEntry[] {
  return commandHistory
    .filter(entry => entry.intent === intent && entry.success)
    .slice(-limit)
}

/**
 * Calcula similaridade entre duas strings usando algoritmo de Levenshtein simplificado
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  if (s1.length === 0 || s2.length === 0) return 0.0
  
  // Verificar se uma contém a outra
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.7
  }
  
  // Contar palavras em comum
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  const commonWords = words1.filter(w1 => 
    words2.some(w2 => w1.includes(w2) || w2.includes(w1))
  )
  
  const similarity = commonWords.length / Math.max(words1.length, words2.length)
  return similarity
}

/**
 * Sugere comandos similares baseado em múltiplos fatores
 */
export function suggestSimilarCommands(
  command: string, 
  allCommands: string[],
  parsedCommand?: ParsedCommand
): string[] {
  const normalized = command.toLowerCase().trim()
  const suggestions: Array<{ command: string; score: number }> = []
  
  // Se temos histórico, usar comandos recentes bem-sucedidos
  const recentSuccessful = getRecentHistory(20).filter(e => e.success)
  
  for (const cmd of allCommands) {
    const cmdNormalized = cmd.toLowerCase()
    
    // Calcular score de similaridade
    let score = calculateSimilarity(normalized, cmdNormalized)
    
    // Bonus se o comando está no histórico recente e bem-sucedido
    const inHistory = recentSuccessful.find(e => 
      e.command.toLowerCase().trim() === cmdNormalized
    )
    if (inHistory) {
      score += 0.3
    }
    
    // Bonus se a intenção do comando sugerido corresponde à intenção parseada (se disponível)
    if (parsedCommand && parsedCommand.intent !== 'unknown') {
      // Tentar inferir a intenção do comando sugerido
      const suggestedIntent = inferIntentFromCommand(cmd)
      if (suggestedIntent === parsedCommand.intent) {
        score += 0.2
      }
    }
    
    // Bonus se há palavras-chave em comum
    const commandWords = normalized.split(/\s+/)
    const cmdWords = cmdNormalized.split(/\s+/)
    const commonKeywords = commandWords.filter(w => 
      w.length > 3 && cmdWords.some(cw => cw.includes(w) || w.includes(cw))
    )
    score += commonKeywords.length * 0.1
    
    if (score > 0.1 && cmdNormalized !== normalized) {
      suggestions.push({ command: cmd, score })
    }
  }
  
  // Ordenar por score e retornar top 5
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.command)
}

/**
 * Infere a intenção de um comando (simplificado, para scoring)
 */
function inferIntentFromCommand(command: string): Intent | null {
  const cmd = command.toLowerCase()
  
  if (cmd.includes('vendi') || cmd.includes('venda')) return 'sell_product'
  if (cmd.includes('gastei') || cmd.includes('gasto') || cmd.includes('paguei') || cmd.includes('comprei')) {
    return cmd.includes('produto') && !cmd.match(/\d+\s*reais?/) ? 'buy_product' : 'register_expense'
  }
  if (cmd.includes('recebi') || cmd.includes('receita')) return 'register_income'
  if (cmd.includes('estoque') || cmd.includes('quantas') || cmd.includes('quantos')) return 'check_stock'
  if (cmd.includes('reposição') || cmd.includes('repor')) return 'restock_product'
  if (cmd.includes('listar') || cmd.includes('lista')) return 'list_products'
  if (cmd.includes('lucro') || cmd.includes('receitas') || cmd.includes('despesas')) return 'calculate_profit'
  
  return null
}

/**
 * Gera sugestões contextuais baseadas no histórico do usuário
 */
export function generateContextualSuggestions(
  parsedCommand: ParsedCommand,
  errors: Array<{ field: string; message: string }>
): string[] {
  const suggestions: string[] = []
  
  // Se temos histórico do mesmo intent, sugerir comandos similares que funcionaram
  if (parsedCommand.intent !== 'unknown') {
    const similarCommands = getHistoryByIntent(parsedCommand.intent, 5)
    similarCommands.forEach(entry => {
      // Adaptar o comando histórico ao contexto atual
      const adapted = adaptCommandToContext(entry.command, parsedCommand)
      if (adapted) {
        suggestions.push(adapted)
      }
    })
  }
  
  // Sugestões baseadas nos erros
  errors.forEach(error => {
    switch (error.field) {
      case 'amount':
        suggestions.push('50 reais', 'R$ 100', '200,50 reais', '3799 reais')
        break
      case 'productName':
        suggestions.push('vendi o colar', 'vendi produto', 'listar produtos')
        break
      case 'date':
        suggestions.push('hoje', 'amanhã', 'mês que vem', 'dia 15/02')
        break
      case 'installmentCount':
        suggestions.push('em 3x', 'parcelado em 6x', 'em 12 vezes')
        break
    }
  })
  
  return [...new Set(suggestions)].slice(0, 5)
}

/**
 * Adapta um comando histórico ao contexto atual
 */
function adaptCommandToContext(
  historicalCommand: string, 
  currentContext: ParsedCommand
): string | null {
  // Por enquanto, retorna o comando histórico como está
  // Futuramente pode adaptar valores, datas, etc.
  return historicalCommand
}

/**
 * Obtém exemplos de comandos válidos por categoria
 */
export function getExampleCommandsByCategory(category?: string): string[] {
  const examples: Record<string, string[]> = {
    sales: [
      'vendi o colar de pérolas',
      'vendi um produto por 150 reais',
      'vendi produto em 3x de 50 reais',
      'venda de 200 reais que será pago mês que vem',
      'vendi 2 unidades do colar por 300 reais'
    ],
    expenses: [
      'gastei 50 reais no supermercado',
      'paguei 200 reais de conta de luz',
      'comprei um notebook de 3799 parcelado em 6x',
      'gastei 100 reais hoje',
      'despesa de 500 reais com material'
    ],
    income: [
      'recebi 500 reais de serviço',
      'receita de 200 reais',
      'recebi 1000 reais hoje',
      'receita recorrente de 300 reais todo mês'
    ],
    stock: [
      'quantas argolas gota eu tenho',
      'tem estoque do colar?',
      'quantos produtos tem no estoque?',
      'estoque de colar',
      'falta estoque?'
    ],
    restock: [
      'reposição de 10 kit 5 pares de brincos',
      'repor 20 unidades de colar',
      'adicionar 15 argolas ao estoque',
      'reposição de estoque'
    ],
    queries: [
      'qual meu lucro líquido esse mês',
      'lucro mês passado',
      'qual minhas receitas este mês',
      'quanto gastei esta semana',
      'mostra minhas despesas'
    ],
    analytics: [
      'gera insights',
      'insights avançados',
      'análise financeira',
      'resumo financeiro',
      'produtos mais vendidos',
      'top produtos'
    ]
  }
  
  if (category && examples[category]) {
    return examples[category]
  }
  
  // Retornar todos os exemplos se nenhuma categoria especificada
  return Object.values(examples).flat()
}







