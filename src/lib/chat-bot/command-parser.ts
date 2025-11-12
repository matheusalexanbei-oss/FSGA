import { ParsedCommand, Intent } from './types'
import { INTENT_PATTERNS, MONEY_PATTERN, QUANTITY_PATTERN, PRODUCT_NAME_PATTERNS } from './patterns'
import { extractRelativeDate, validateDate } from './date-patterns'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'

/**
 * Normaliza o comando (remove acentos opcionalmente, lowercase, trim)
 */
function normalizeCommand(command: string): string {
  return command
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
}

/**
 * Reconhece a intenção do comando
 */
export function recognizeIntent(command: string): Intent {
  const normalized = normalizeCommand(command)
  
  // Verificar se há valor monetário no comando (para priorizar register_expense sobre buy_product)
  // Padrões: "de 3799", "por 100", "50 reais", "R$ 50", "valor de 500"
  // Para "comprei", verificar se tem padrão de valor monetário após "comprei"
  const hasMoneyValue = /(?:de|por|valor|preço|preco|r\$|reais?)\s+(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+[,.]?\d*)/i.test(command) ||
                       /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+[,.]?\d*)\s*(?:reais?|r\$)/i.test(command) ||
                       // Verificar se tem "comprei" seguido de algo que indica valor (número grande após "de/por" ou número isolado grande)
                       (normalized.includes('comprei') && /comprei\s+[^0-9]*?(?:de|por)\s+\d{2,}/i.test(command)) ||
                       (normalized.includes('comprei') && /comprei\s+[^0-9]*?\d{3,}/i.test(command)) // 3+ dígitos após "comprei"
  
  // Prioridade 1: Se tem "comprei" e valor monetário, tratar como despesa (register_expense)
  // Isso evita confundir compras de produtos pessoais/equipamentos com compras para estoque
  if (normalized.includes('comprei') && hasMoneyValue) {
    // Verificar se é realmente uma despesa (não menciona produto cadastrado específico)
    // Se mencionar "comprei" + valor, é despesa
    if (INTENT_PATTERNS.register_expense) {
      for (const pattern of INTENT_PATTERNS.register_expense) {
        if (pattern.test(normalized)) {
          return 'register_expense'
        }
      }
    }
    // Se não encontrou padrão específico, mas tem "comprei" + valor, tratar como despesa
    return 'register_expense'
  }
  
  // Frases iniciadas por "compra de" com valor monetário são despesas
  if (normalized.includes('compra de') && hasMoneyValue) {
    return 'register_expense'
  }
  
  // Verificar outros intents normalmente
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    // Pular register_expense se já foi tratado acima
    if (intent === 'register_expense' && normalized.includes('comprei') && hasMoneyValue) {
      continue
    }
    
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return intent as Intent
      }
    }
  }
  
  return 'unknown'
}

/**
 * Extrai entidades do comando (valores, datas, produtos, etc.)
 */
export function extractEntities(command: string, intent: Intent): ParsedCommand['entities'] {
  const entities: ParsedCommand['entities'] = {}
  const normalized = normalizeCommand(command)
  
  // Extrair valores monetários (melhorado para capturar mais padrões coloquiais)
  // Padrões: "50 reais", "R$ 50", "de 3799", "no valor de 3799", "por 100", "3799 reais"
  // IMPORTANTE: Processar antes de parcelamento para evitar conflitos
  // IMPORTANTE: Capturar valores mesmo sem "reais" ou "R$" quando há contexto monetário
  
  // Função auxiliar para parsear valores monetários (aceita vírgula e ponto como decimal)
  const parseMoneyValue = (valueStr: string): number | null => {
    if (!valueStr) return null
    
    const hasComma = valueStr.includes(',')
    const hasDot = valueStr.includes('.')
    let cleanValue = valueStr.trim()
    
    if (hasComma && hasDot) {
      // Tem ambos: vírgula é decimal, ponto é milhar (ex: 1.234,56)
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
    } else if (hasComma) {
      // Só vírgula: vírgula é decimal (ex: 80,39)
      cleanValue = cleanValue.replace(',', '.')
    } else if (hasDot) {
      // Só ponto: pode ser decimal (ex: 80.39) ou milhar (ex: 1.234)
      const parts = cleanValue.split('.')
      if (parts.length === 2) {
        const integerPart = parts[0]
        const decimalPart = parts[1]
        
        // Se a parte decimal tem 1 ou 2 dígitos, provavelmente é decimal (ex: 80.39, 80.3)
        if (decimalPart.length <= 2) {
          // É decimal, manter como está
          // cleanValue já está correto
        } else if (integerPart.length > 3) {
          // Parte inteira grande + parte decimal grande = provavelmente é milhar (ex: 1.234)
          cleanValue = parts.join('')
        } else {
          // Parte inteira pequena + parte decimal grande = provavelmente é decimal mal formatado
          // Manter como está e deixar parseFloat lidar
        }
      } else {
        // Múltiplos pontos = separador de milhar (ex: 1.234.567)
        cleanValue = cleanValue.replace(/\./g, '')
      }
    }
    
    const parsed = parseFloat(cleanValue)
    if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
      return parsed
    }
    return null
  }
  
  // Padrão 1: Valores explícitos com moeda ("50 reais", "R$ 50", "80.39 reais", "80,39 reais")
  const explicitMoneyPattern = MONEY_PATTERN
  let explicitMatch = command.match(explicitMoneyPattern)
  if (explicitMatch && explicitMatch[1]) {
    const parsedAmount = parseMoneyValue(explicitMatch[1])
    if (parsedAmount !== null) {
      entities.amount = parsedAmount
    }
  }
  
  // Padrão 2: Valores com preposições ("de 3799", "por 100", "valor de 500")
  // Este é o padrão mais importante para casos como "comprei um notebook de 3799 em 6x"
  if (!entities.amount) {
    // Procurar por "de [número]" primeiro (mais comum em português coloquial)
    // Ex: "de 3799", "de 50", "de 3.799,00"
    // Padrão mais flexível: captura números com ou sem separadores
    const dePattern = /\bde\s+(\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d{2,})/i
    const deMatch = command.match(dePattern)
    
    if (deMatch && deMatch[1]) {
      const numberValue = deMatch[1]
      const matchIndex = deMatch.index!
      const matchEnd = matchIndex + deMatch[0].length
      
      // Verificar o contexto ao redor do número
      const contextBefore = command.substring(Math.max(0, matchIndex - 20), matchIndex).toLowerCase()
      const contextAfter = command.substring(matchEnd, Math.min(command.length, matchEnd + 20)).toLowerCase()
      
      // Se "de" estiver após palavras de compra/gasto, é provável que seja valor monetário
      const isAfterPurchaseWord = /\b(?:comprei|gastei|paguei|compra|gasto|pagamento|notebook|celular|produto|item)\b/i.test(contextBefore)
      
      // Se depois do número vier "em 6x", "parcelado", etc, provavelmente é valor monetário
      const isBeforeInstallment = /\b(?:em|parcelado|parcelar|parcelamento)\s+\d/i.test(contextAfter)
      
      // Verificar se não é "de 6x" ou similar (número pequeno antes de "x")
      const parsedNumber = parseFloat(numberValue.replace(/\./g, '').replace(',', '.'))
      const isSmallNumberBeforeX = parsedNumber <= 60 && /^\s*\d*\s*x/i.test(contextAfter)
      
      if ((isAfterPurchaseWord || isBeforeInstallment || parsedNumber >= 100) && !isSmallNumberBeforeX) {
        const parsedAmount = parseMoneyValue(numberValue)
        if (parsedAmount !== null) {
          entities.amount = parsedAmount
        }
      }
    }
    
    // Se ainda não encontrou, tentar outros padrões de preposição
    if (!entities.amount) {
      const otherPrepositionPatterns = [
        // "por 100"
        /\bpor\s+(\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d{2,})/i,
        // "valor de", "preço de", "no valor de"
        /(?:no\s+)?(?:valor|preço|preco)\s+de\s+(\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d{2,})/i,
      ]
      
      for (const pattern of otherPrepositionPatterns) {
        const match = command.match(pattern)
        if (match && match[1]) {
          const parsedAmount = parseMoneyValue(match[1])
          if (parsedAmount !== null) {
            entities.amount = parsedAmount
            break
          }
        }
      }
    }
  }
  
  // Padrão 3: Números grandes isolados em contexto de compra/gasto (3+ dígitos)
  // Ex: "comprei notebook 3799 em 6x" (sem "de")
  if (!entities.amount && (intent === 'register_expense' || intent === 'register_income' || intent === 'sell_product')) {
    const bigNumberPattern = /\b(\d{3,}(?:[.,]\d{3})*(?:[.,]\d{2})?)\b/
    const bigNumberMatch = command.match(bigNumberPattern)
    if (bigNumberMatch && bigNumberMatch[1]) {
      // Verificar se não é número de parcelas (deve estar próximo a "em Xx", "Xx", etc)
      const numberPos = bigNumberMatch.index!
      const beforeNumber = command.substring(Math.max(0, numberPos - 10), numberPos)
      const afterNumber = command.substring(numberPos + bigNumberMatch[0].length, Math.min(command.length, numberPos + bigNumberMatch[0].length + 10))
      
      const isNearInstallment = /\b(?:em|com|de)\s*\d*\s*(?:x|vezes|parcelas?)/i.test(beforeNumber + afterNumber)
      const isAfterInstallmentKeyword = /\b(?:parcelado|parcelar|parcelamento)\s+(?:em|de)\s*$/i.test(beforeNumber)
      
      if (!isNearInstallment && !isAfterInstallmentKeyword) {
        const parsedAmount = parseMoneyValue(bigNumberMatch[1])
        if (parsedAmount !== null && parsedAmount >= 100) {
          entities.amount = parsedAmount
        }
      }
    }
  }
  
  // Padrão 4: Fallback - qualquer número com "reais" ou "R$"
  if (!entities.amount) {
    const fallbackPattern = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+[,.]?\d*)\s*(?:reais?|r\$|rs|real|R\$)/i
    const fallbackMatch = command.match(fallbackPattern)
    if (fallbackMatch && fallbackMatch[1]) {
      const amountStr = fallbackMatch[1].replace(/\./g, '').replace(',', '.')
      const parsedAmount = parseFloat(amountStr)
      if (!isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount < 1000000) {
        entities.amount = parsedAmount
      }
    }
  }
  
  // Extrair quantidades (melhorado para capturar mais padrões)
  const quantityMatch = command.match(QUANTITY_PATTERN)
  if (quantityMatch) {
    entities.quantity = parseInt(quantityMatch[1])
  } else {
    // Tentar extrair número diretamente após palavras-chave de reposição (prioridade)
    if (intent === 'restock_product' || normalized.includes('reposição') || normalized.includes('resposição') || normalized.includes('repor')) {
      // Padrão: "reposição de 9 argola retangular" ou "reposição 9 argola"
      const restockQuantityPattern = /(?:reposição|resposição|repor|adicionar|aumentar)\s+(?:de\s+)?(\d+)/i
      const restockMatch = command.match(restockQuantityPattern)
      if (restockMatch) {
        entities.quantity = parseInt(restockMatch[1])
      } else {
        // Tentar número antes do produto (ex: "9 argola retangular")
        const numberBeforeProduct = /(\d+)\s+(?:unidades?\s+)?(?:de\s+)?(?:o|a|os|as)?\s*(.+)/i
        const numberMatch = command.match(numberBeforeProduct)
        if (numberMatch && normalized.includes('reposição')) {
          entities.quantity = parseInt(numberMatch[1])
          // Se não tiver productName ainda, pegar após o número
          if (!entities.productName && numberMatch[2]) {
            entities.productName = numberMatch[2].trim()
          }
        }
      }
    } else {
      // Para outros intents, usar padrão padrão
      const numberBeforeProduct = /(\d+)\s+(?:unidades?\s+)?(?:de\s+)?(?:o|a|os|as)?\s*(.+)/i
      const numberMatch = command.match(numberBeforeProduct)
      if (numberMatch) {
        let possibleProduct = numberMatch[2]?.trim() ?? ''
        if (possibleProduct.length > 0) {
          possibleProduct = possibleProduct.split(/\b(por|de|com|para)\b/i)[0].trim().toLowerCase()
        }
        const nonProductKeywords = /(reais?|real|r\$|\bvalor\b|\bpreço\b|\bpreco\b|\bpagamento\b|\bdias?\b|\bmes(es)?\b|\bsemana(s)?\b|\bparcelas?\b)/i
        const startsWithInstallmentMarker = possibleProduct.startsWith('x') || possibleProduct.startsWith('parcel')
        if (possibleProduct.length > 0 && !nonProductKeywords.test(possibleProduct) && !startsWithInstallmentMarker) {
          entities.quantity = parseInt(numberMatch[1])
        }
      }
    }
  }
  
  // Extrair informações de parcelamento (melhorado)
  // Padrões: "em 3x", "em 3 vezes", "em 3 parcelas", "3x de 50", "parcelado em 6x"
  // IMPORTANTE: Processar após a extração de valores monetários para evitar conflitos
  // IMPORTANTE: Limitar número de parcelas a valores razoáveis (1-60) para evitar capturar valores monetários
  const installmentPatterns = [
    /(?:parcelado|parcelar|parcelamento)\s+(?:em|de)\s+(\d{1,2})\s*(?:x|vezes|parcelas?)/i, // "parcelado em 6x" (limite de 2 dígitos)
    /(?:em|com)\s+(\d{1,2})\s*(?:x|vezes|parcelas?)(?:\s+de\s+(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$))?/i, // "em 6x", "em 6x de 50 reais"
    /\b(\d{1,2})\s*(?:x|vezes|parcelas?)\s*(?:de\s+(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$))?/i, // "6x", "6x de 50 reais" (com word boundary)
    /parcelamento\s+(?:em|de)\s+(\d{1,2})/i
  ]
  
  for (const pattern of installmentPatterns) {
    const installmentMatch = command.match(pattern)
    if (installmentMatch) {
      const installmentCount = parseInt(installmentMatch[1])
      // Validar que é um número razoável de parcelas (1-60)
      if (installmentCount >= 1 && installmentCount <= 60) {
        entities.isInstallment = true
        entities.installmentCount = installmentCount
        
        // Detectar valor por parcela se mencionado
        let installmentValue: number | null = null
        if (installmentMatch[2]) {
          installmentValue = parseFloat(installmentMatch[2].replace(',', '.'))
        } else {
          const fallbackValueMatch = command.match(/de\s+(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$)/i)
          if (fallbackValueMatch) {
            installmentValue = parseFloat(fallbackValueMatch[1].replace(',', '.'))
          }
        }

        if (installmentValue !== null && !isNaN(installmentValue) && installmentValue > 0) {
          ;(entities as any).installmentValue = installmentValue
          if (!entities.amount || Math.abs((entities.amount ?? 0) - installmentValue) < 0.01) {
            entities.amount = installmentValue * entities.installmentCount
          }
        }
        
        // Detectar intervalo (semanal, mensal, trimestral)
        if (normalized.match(/semanal(?:mente)?|semanais?|toda\s+semana/i)) {
          entities.installmentInterval = 'weekly'
        } else if (normalized.match(/trimestral|trimestre|a\s+cada\s+3\s+meses/i)) {
          entities.installmentInterval = 'quarterly'
        } else {
          entities.installmentInterval = 'monthly' // Default mensal
        }
        break
      }
    }
  }
  
  // Extrair informações de recorrência (melhorado)
  // Padrões: "todo mês", "toda semana", "mensalmente", "recorrente", "recorrência"
  const recurringPatterns = [
    /(?:todo\s+mês|todo\s+mes|toda\s+semana|mensalmente?|semanalmente?|trimestralmente?|recorrente|recorrência|recorrencia)/i,
    /(?:a\s+cada\s+)?(\d+)\s*(?:semanas?|meses?|trimestres?)/i,
    /(?:mensal|semanal|trimestral)\s+(?:de|no\s+valor\s+de)/i,
    /\bmensal\b/i,
    /\bsemanal\b/i
  ]
  
  for (const pattern of recurringPatterns) {
    if (pattern.test(command)) {
      entities.isRecurring = true
      
      // Detectar intervalo específico do padrão numérico
      const numericMatch = command.match(/(?:a\s+cada\s+)?(\d+)\s*(semanas?|meses?|trimestres?)/i)
      if (numericMatch) {
        const intervalValue = parseInt(numericMatch[1])
        const intervalUnit = numericMatch[2].toLowerCase()
        if (intervalUnit.includes('semana')) {
          entities.recurringInterval = 'weekly'
        } else if (intervalUnit.includes('trimestre')) {
          entities.recurringInterval = 'quarterly'
        } else {
          entities.recurringInterval = 'monthly'
        }
      } else if (normalized.match(/semanal(?:mente)?|semanais?|toda\s+semana/i)) {
        entities.recurringInterval = 'weekly'
      } else if (normalized.match(/trimestral|trimestre|trimestralmente/i)) {
        entities.recurringInterval = 'quarterly'
      } else {
        entities.recurringInterval = 'monthly' // Default mensal
      }
      
      // Tentar extrair data de término (melhorado)
      const endDatePatterns = [
        /(?:até|ate|termina|acaba|finaliza|até\s+o\s+dia)\s+(?:dia\s+)?(\d{1,2})(?:\/(\d{1,2}))?(?:\/(\d{4}))?/i,
        /(?:até|ate|termina|acaba|finaliza)\s+(?:dia\s+)?(\d{1,2})\s+(?:de\s+)?(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+(?:de\s+)?(\d{4}))?/i
      ]
      
      for (const endPattern of endDatePatterns) {
        const endDateMatch = command.match(endPattern)
        if (endDateMatch) {
          const today = new Date()
          let day: number, month: number, year: number
          
          if (endDateMatch[2] && endDateMatch[2].match(/janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i)) {
            // Formato: "até dia 15 de janeiro"
            const monthNames: Record<string, number> = {
              'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3,
              'abril': 4, 'maio': 5, 'junho': 6, 'julho': 7,
              'agosto': 8, 'setembro': 9, 'outubro': 10,
              'novembro': 11, 'dezembro': 12
            }
            day = parseInt(endDateMatch[1])
            month = monthNames[endDateMatch[2].toLowerCase()]
            year = endDateMatch[3] ? parseInt(endDateMatch[3]) : today.getFullYear()
          } else {
            // Formato: "até dia 15/02" ou "até dia 15/02/2025"
            day = parseInt(endDateMatch[1])
            month = endDateMatch[2] ? parseInt(endDateMatch[2]) : today.getMonth() + 1
            year = endDateMatch[3] ? parseInt(endDateMatch[3]) : today.getFullYear()
          }
          
          const endDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          if (validateDate(endDateString)) {
            entities.recurringEndDate = endDateString
          }
          break
        }
      }
      break
    }
  }
  
  // Extrair datas relativas (melhorado com validação)
  if (intent === 'sell_product' || intent === 'register_expense' || intent === 'register_income') {
    const extractedDate = extractRelativeDate(command)
    const today = getLocalDateString()
    
    // Validar data extraída
    if (!validateDate(extractedDate)) {
      // Se a data não for válida, usar hoje como fallback
      entities.date = today
    } else {
      // Verificar se há menção a pagamento futuro (padrões expandidos)
      const futurePaymentPattern = /(?:será\s+pago|sera\s+pago|ser\s+pago|pago\s+será|pago\s+sera|pago\s+em|pago\s+no|pago\s+na|pagamento\s+em|pagamento\s+no|pagamento\s+na|receberei|receberá|recebera|receber|vou\s+receber|vai\s+receber|pra\s+receber|para\s+receber|a\s+receber|vou\s+pagar|vai\s+pagar|pra\s+pagar|para\s+pagar|a\s+pagar|mês\s+que\s+vem|mes\s+que\s+vem|semana\s+que\s+vem|próximo\s+mês|proximo\s+mes|próxima\s+semana|proxima\s+semana|futuro|depois|agendar|marcar)/i
      const isFutureDate = parseLocalDate(extractedDate) > parseLocalDate(today)
      
      // Verificar se há menção a receber/pagar no futuro
      const receivePattern = /(?:receberei|receberá|recebera|receber|vou\s+receber|vai\s+receber|pra\s+receber|para\s+receber|a\s+receber)/i
      const payPattern = /(?:vou\s+pagar|vai\s+pagar|pra\s+pagar|para\s+pagar|a\s+pagar)/i
      
      // Não marcar como agendado se for parcelamento ou recorrência (já tratados separadamente)
      if (!entities.isInstallment && !entities.isRecurring) {
        if (futurePaymentPattern.test(command) || receivePattern.test(command) || payPattern.test(command) || isFutureDate) {
          entities.paymentScheduled = true
          entities.paymentDate = extractedDate
          // Data da transação é hoje, pagamento é futuro
          entities.date = today
        } else {
          // Pagamento imediato
          entities.date = extractedDate
          entities.paymentScheduled = false
        }
      } else {
        // Para parcelamentos e recorrências, usar data extraída
        entities.date = extractedDate
        entities.paymentScheduled = false
      }
    }
  } else {
    const extractedDate = extractRelativeDate(command)
    entities.date = validateDate(extractedDate) ? extractedDate : getLocalDateString()
  }
  
  // Extrair nome do produto (após palavras-chave)
  if (intent === 'sell_product' || intent === 'buy_product' || intent === 'check_stock' || intent === 'search_product' || intent === 'restock_product') {
    // Para consultas de estoque com "quantas/quantos", extrair nome do produto
    if (intent === 'check_stock') {
      // Padrão: "quantas argolas gota eu tenho"
      const quantasMatch = command.match(/(?:quantas|quantos)\s+(.+?)(?:\s+(?:eu|você|tenho|tem|há|existe)|$)/i)
      if (quantasMatch && quantasMatch[1]) {
        let productName = quantasMatch[1].trim()
        // Remover palavras comuns no final
        productName = productName.replace(/\s+(eu|você|tenho|tem|há|existe|em|no|na|do|da|de|por|com|para)\s*.*$/i, '').trim()
        if (productName.length > 0) {
          entities.productName = productName
        }
      } else {
        // Padrão: "tenho quantas argolas"
        const tenhoMatch = command.match(/(?:tenho|tem|há|existe)\s+(?:quantas|quantos)\s+(.+?)(?:$|\.)/i)
        if (tenhoMatch && tenhoMatch[1]) {
          let productName = tenhoMatch[1].trim()
          productName = productName.replace(/\s+(eu|você|tenho|tem|há|existe|em|no|na|do|da|de|por|com|para)\s*.*$/i, '').trim()
          if (productName.length > 0) {
            entities.productName = productName
          }
        }
      }
    }
    
    // Primeiro, tentar com padrões existentes
    if (!entities.productName) {
      for (const pattern of PRODUCT_NAME_PATTERNS) {
        const match = command.match(pattern)
        if (match && match[1]) {
          let productName = match[1].trim()
          // Remover valores monetários e quantidades do nome do produto
          productName = productName.replace(MONEY_PATTERN, '').trim()
          productName = productName.replace(QUANTITY_PATTERN, '').trim()
          // Remover artigos comuns do início
          productName = productName.replace(/^(a|o|as|os|um|uma|uns|umas)\s+/i, '').trim()
          // Remover palavras comuns no final
          productName = productName.replace(/\s+(por|de|com|para|em|no|na)\s+.*$/i, '').trim()
          if (productName.length > 0) {
            entities.productName = productName
            break
          }
        }
      }
    }
    
      // Se não encontrou com padrões, tentar extrair diretamente após a palavra-chave
      if (!entities.productName) {
        let actionPattern: RegExp
        if (intent === 'restock_product') {
          // Padrão melhorado para reposição: "reposição de 4 argola gota" ou "resposição de 4 argola gota"
          // Tenta vários padrões diferentes
          actionPattern = /(?:reposição|resposição|repor|adicionar|aumentar|colocar)\s+(?:de\s+)?\d+\s*(?:unidades?\s+)?(?:de\s+)?(?:o|a|os|as)?\s*(.+?)(?:\s*$|reais?|r\$)/i
          
          const match = command.match(actionPattern)
          if (match && match[match.length - 1]) {
            let productName = match[match.length - 1].trim()
            productName = productName.replace(MONEY_PATTERN, '').trim()
            productName = productName.replace(QUANTITY_PATTERN, '').trim()
            productName = productName.replace(/^\d+\s*(?:unidades?\s+)?(?:de\s+)?/i, '').trim() // Remover números do início
            productName = productName.replace(/^(a|o|as|os|um|uma|uns|umas)\s+/i, '').trim()
            productName = productName.replace(/\s+(por|de|com|para|em|no|na)\s+.*$/i, '').trim()
            if (productName.length > 0) {
              entities.productName = productName
            }
          } else {
            // Padrão alternativo: número antes do produto (ex: "reposição de 4 argola gota")
            const altPattern = /(?:reposição|resposição|repor)\s+(?:de\s+)?(\d+)\s+(.+)/i
            const altMatch = command.match(altPattern)
            if (altMatch && altMatch[2]) {
              let productName = altMatch[2].trim()
              productName = productName.replace(MONEY_PATTERN, '').trim()
              productName = productName.replace(/^(a|o|as|os|um|uma|uns|umas)\s+/i, '').trim()
              productName = productName.replace(/\s+(por|de|com|para|em|no|na)\s+.*$/i, '').trim()
              if (productName.length > 0) {
                entities.productName = productName
              }
              // Também definir quantidade se não foi definida
              if (!entities.quantity && altMatch[1]) {
                entities.quantity = parseInt(altMatch[1])
              }
            }
          }
        } else {
          actionPattern = /(vendi|comprei|tem|tenho|procura|buscar|busca)\s+(.+?)(?:\s+(?:por|de|com|para|reais?|r\$)|$)/i
          
          const match = command.match(actionPattern)
          if (match && match[match.length - 1]) {
            let productName = match[match.length - 1].trim()
            productName = productName.replace(MONEY_PATTERN, '').trim()
            productName = productName.replace(QUANTITY_PATTERN, '').trim()
            productName = productName.replace(/^\d+\s*(?:unidades?\s+)?(?:de\s+)?/i, '').trim() // Remover números do início
            productName = productName.replace(/^(a|o|as|os|um|uma|uns|umas)\s+/i, '').trim()
            productName = productName.replace(/\s+(por|de|com|para|em|no|na)\s+.*$/i, '').trim()
            if (productName.length > 0) {
              entities.productName = productName
            }
          }
        }
      }
  }
  
  // Extrair categoria (palavras após "em", "com", "categoria")
  const categoryPattern = /(?:em|com|categoria|cat)\s+(.+?)(?:\s+(?:por|de|reais?|r\$)|$)/i
  const categoryMatch = command.match(categoryPattern)
  if (categoryMatch && categoryMatch[1]) {
    entities.category = categoryMatch[1].trim()
  }
  
  // Extrair descrição (parte após "para", "com", "descrição")
  const descriptionPattern = /(?:para|com|descrição|descricao)\s+(.+?)(?:\s+(?:por|de|reais?|r\$)|$)/i
  const descriptionMatch = command.match(descriptionPattern)
  if (descriptionMatch && descriptionMatch[1]) {
    entities.description = descriptionMatch[1].trim()
  }
  
  // Extrair informações de tarefa (título, data, hora)
  if (intent === 'create_task') {
    // Extrair título da tarefa (remover palavras-chave e datas/horas)
    let taskTitle = command
      .replace(/tarefa|lembrar|lembre|lembre-me|agendar|agenda|compromisso/i, '')
      .replace(/\b(?:amanhã|amanha|hoje|depois|sexta|segunda|terça|quarta|quinta|sábado|domingo)\b/gi, '')
      .replace(/\b(?:às|as|as|h|horas?|hora)\s*\d+/gi, '')
      .replace(/\d{1,2}[h:]\d{0,2}/gi, '')
      .trim()
    
    // Se ainda não tem título nas entidades, usar o título extraído
    if (!entities.title && taskTitle.length > 0) {
      entities.title = taskTitle
    }
    
    // Extrair data para tarefa
    if (!entities.date) {
      const extractedDate = extractRelativeDate(command)
      if (validateDate(extractedDate)) {
        entities.date = extractedDate
      }
    }
    
    // Extrair hora (padrões: "às 7h", "as 7 horas", "7h", "7:30")
    if (!entities.time) {
      const timePatterns = [
        /(?:às|as|as)\s*(\d{1,2})[h:]?(\d{0,2})?/i,
        /(\d{1,2})[h:](\d{0,2})/i,
        /(\d{1,2})\s*(?:horas?|h)/i
      ]
      
      for (const pattern of timePatterns) {
        const match = command.match(pattern)
        if (match) {
          const hours = match[1].padStart(2, '0')
          const minutes = (match[2] || '00').padStart(2, '0')
          entities.time = `${hours}:${minutes}`
          break
        }
      }
    }
  }
  
  return entities
}

/**
 * Faz o parse completo do comando
 */
export function parseCommand(command: string): ParsedCommand {
  const intent = recognizeIntent(command)
  const entities = extractEntities(command, intent)
  
  return {
    intent,
    confidence: intent !== 'unknown' ? 0.9 : 0.1,
    entities,
    raw: command
  }
}
