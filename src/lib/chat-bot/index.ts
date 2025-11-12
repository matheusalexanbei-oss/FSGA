import { ParsedCommand, BotResponse, ConfirmationData } from './types'
import { parseCommand } from './command-parser'
import { handleSellProduct, executeSellProduct, handleSearchProduct } from './commands/products'
import { handleRegisterExpense, executeRegisterExpense, handleRegisterIncome, executeRegisterIncome } from './commands/financial'
import { handleCheckStock } from './commands/stock'
import { handleRestockProduct } from './commands/restock'
import { handleCreateTask } from './commands/tasks'
import { handleHelp } from './commands/help'
import { calculateNetProfit, generateFinancialInsights, analyzeTopProducts } from './commands/analytics'
import { checkRevenue, checkExpenses, generateAdvancedInsights } from './commands/queries'
import { getConversationContext, setConversationContext, clearConversationContext, isSimpleResponse, isAffirmativeResponse } from './context'
import { validateCommand, formatValidationError, suggestSimilarCommands } from './validation'
import { addToHistory } from './suggestions'
import type { Product } from '@/types/product'

/**
 * Processa um comando do usuário e retorna uma resposta do bot
 */
export async function processCommand(
  command: string,
  userId: string,
  products: Product[] = []
): Promise<BotResponse> {
  // LOG: Início do processCommand
  console.log('🚀 LOG - processCommand INICIADO')
  console.log('  - command:', command)
  console.log('  - userId:', userId)
  console.log('  - products.length:', products.length)
  
  // Verificar se é uma resposta simples (sim/não) com contexto
  const context = getConversationContext()
  console.log('🚀 LOG - Contexto da conversa:', context)
  
  // Se há contexto de pergunta de valor, tentar extrair o valor da resposta
  if (context && context.type === 'ask_amount') {
    console.log('🔍 LOG - Contexto ask_amount detectado! Tentando extrair valor de:', command)
    
    // Melhorar regex para capturar valores como "80,39", "80.39", "R$ 80,39", "80,00", etc.
    // Aceita: números com vírgula ou ponto decimal, com ou sem R$
    const valuePattern = /^[\s]*r\$\s*[\d.,]+|^[\d.,]+[\s]*$/i
    const isValueOnly = valuePattern.test(command.trim())
    
    console.log('  - isValueOnly:', isValueOnly)
    
    if (isValueOnly) {
      // Extrair valor do comando (remove R$, espaços)
      // Aceita tanto vírgula quanto ponto como separador decimal
      let cleanValue = command.trim()
        .replace(/r\$/gi, '') // Remove R$
        .replace(/\s/g, '') // Remove espaços
      
      // Detectar se usa vírgula ou ponto como separador decimal
      const hasComma = cleanValue.includes(',')
      const hasDot = cleanValue.includes('.')
      
      if (hasComma && hasDot) {
        // Tem ambos: vírgula é decimal, ponto é milhar (ex: 1.234,56)
        cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
      } else if (hasComma) {
        // Só vírgula: vírgula é decimal (ex: 80,39)
        cleanValue = cleanValue.replace(',', '.')
      } else if (hasDot) {
        // Só ponto: pode ser decimal (ex: 80.39) ou milhar (ex: 1.234)
        // Se tem mais de 3 dígitos antes do ponto, provavelmente é milhar
        const parts = cleanValue.split('.')
        if (parts.length === 2 && parts[0].length > 3) {
          // Provavelmente é milhar sem decimais (ex: 1.234)
          cleanValue = parts.join('')
        } else {
          // Provavelmente é decimal (ex: 80.39)
          // Manter o ponto como está
        }
      }
      
      // Se não tem ponto decimal e tem menos de 3 dígitos, pode ser um valor inteiro
      if (!cleanValue.includes('.') && cleanValue.length <= 3) {
        cleanValue = cleanValue + '.00'
      }
      
      const amount = parseFloat(cleanValue)
      console.log('  - cleanValue:', cleanValue)
      console.log('  - amount:', amount)
      
      if (!isNaN(amount) && amount > 0 && amount < 1000000) {
        console.log('✅ LOG - Valor extraído com sucesso! Processando comando original com valor:', amount)
        
        // Valor encontrado! Processar comando original com o valor
        clearConversationContext()
        
        // Criar comando combinado: comando original + valor informado
        const combinedCommand = `${context.originalCommand} ${amount} reais`
        const parsed = parseCommand(combinedCommand)
        
        // Garantir que o valor está nas entidades
        parsed.entities.amount = amount
        
        // Preservar outras entidades do contexto original (como paymentScheduled, paymentDate, etc.)
        if (context.entities) {
          Object.keys(context.entities).forEach(key => {
            if (key !== 'amount' && context.entities[key] !== undefined) {
              parsed.entities[key] = context.entities[key]
            }
          })
        }
        
        console.log('  - parsed.entities após merge:', JSON.stringify(parsed.entities, null, 2))
        
        // Processar normalmente
        return await processParsedCommand(parsed, userId, products)
      } else {
        console.log('❌ LOG - Valor não pôde ser parseado ou está fora do range válido')
      }
    } else {
      console.log('❌ LOG - Comando não parece ser apenas um valor')
    }
    
    // Se não conseguiu extrair valor, perguntar novamente
    return {
      message: `❓ Não consegui identificar o valor na sua resposta.\n\n💡 Por favor, informe apenas o valor, por exemplo:\n• 80,39\n• R$ 80,39\n• 50,00`,
      type: 'question',
      requiresInput: true,
      suggestions: ['80,39', 'R$ 80,39', '50,00']
    }
  }
  
  if (context && isSimpleResponse(command)) {
    if (context.type === 'list_products' && isAffirmativeResponse(command)) {
      clearConversationContext()
      return {
        message: products.length === 0 
          ? 'Você ainda não tem produtos cadastrados.'
          : `📦 Você tem ${products.length} produto(s) cadastrado(s):\n\n${products.map((p, i) => `${i + 1}. ${p.name} - R$ ${p.price.toFixed(2)} (Estoque: ${p.stock_quantity})`).join('\n')}`,
        type: 'info',
        data: { products }
      }
    }
    
    if (context.type === 'select_product' && isAffirmativeResponse(command)) {
      clearConversationContext()
      return {
        message: 'Digite o número do produto que você quer selecionar.',
        type: 'question',
        data: { productMatches: context.matches }
      }
    }
  }
  
  const parsed = parseCommand(command)
  
  // LOG: Comando parseado
  console.log('🚀 LOG - Comando parseado:')
  console.log('  - intent:', parsed.intent)
  console.log('  - entities:', JSON.stringify(parsed.entities, null, 2))
  console.log('  - entities.paymentScheduled:', parsed.entities.paymentScheduled)
  console.log('  - entities.paymentDate:', parsed.entities.paymentDate)
  console.log('  - entities.isInstallment:', parsed.entities.isInstallment)
  console.log('  - entities.installmentCount:', parsed.entities.installmentCount)
  console.log('  - entities.isRecurring:', parsed.entities.isRecurring)
  
  // Validar comando
  const validation = validateCommand(parsed)
  
  // Se ainda não identificou a intenção, verificar se é uma resposta simples sem contexto
  if (parsed.intent === 'unknown' && isSimpleResponse(command)) {
    return {
      message: 'Não há nenhuma pergunta pendente. Como posso ajudar?',
      type: 'info',
      suggestions: ['ajuda', 'vendi o colar', 'gastei 50 reais']
    }
  }
  
  // Se validação falhou e não é apenas intenção desconhecida, verificar se deve permitir que o handler faça pergunta
  if (!validation.isValid && parsed.intent !== 'unknown') {
    // Se é despesa/receita sem valor mas com parcelamento detectado, permitir que o handler pergunte
    const isExpenseWithoutAmount = (parsed.intent === 'register_expense' || parsed.intent === 'register_income') &&
                                    validation.errors.some(e => e.field === 'amount') &&
                                    parsed.entities.isInstallment &&
                                    parsed.entities.installmentCount
    
    // Se for apenas falta de valor em despesa/receita, permitir que o handler faça a pergunta
    const onlyMissingAmount = validation.errors.length === 1 && 
                              validation.errors[0].field === 'amount' &&
                              (parsed.intent === 'register_expense' || parsed.intent === 'register_income')
    
    // Se é apenas falta de valor, permitir que o handler faça pergunta interativa
    if (isExpenseWithoutAmount || onlyMissingAmount) {
      // Continuar para o handler que vai fazer a pergunta
    } else {
      // Outros erros, retornar mensagem de erro
      const errorMessage = formatValidationError(validation)
      const commonCommands = [
        'vendi o colar de pérolas',
        'gastei 50 reais no supermercado',
        'recebi 200 reais de serviço',
        'vendi em 3x de 50 reais',
        'receita de 500 reais todo mês',
        'quantas argolas gota eu tenho',
        'qual meu lucro líquido este mês',
        'comprei um notebook de 3799 parcelado em 6x',
        'venda de produto parcelada',
        'listar produtos'
      ]
      const allSuggestions = [
        ...validation.suggestions,
        ...suggestSimilarCommands(command, commonCommands, parsed)
      ]
      
      return {
        message: errorMessage || 'Não consegui processar o comando. Verifique os dados informados.',
        type: 'error',
        suggestions: allSuggestions.slice(0, 5) // Limitar a 5 sugestões
      }
    }
  }
  
  // Se intenção desconhecida e validação falhou, retornar mensagem com sugestões
  if (parsed.intent === 'unknown' && !validation.isValid) {
    const commonCommands = [
      'vendi o colar de pérolas',
      'gastei 50 reais no supermercado',
      'recebi 200 reais',
      'quantas argolas gota eu tenho',
      'qual meu lucro líquido este mês',
      'ajuda'
    ]
    
    const suggestions = suggestSimilarCommands(command, commonCommands, parsed)
    
    // Registrar comando desconhecido no histórico
    addToHistory(command, 'unknown', false)
    
    return {
      message: 'Desculpe, não entendi o comando. Digite "ajuda" para ver os comandos disponíveis ou tente um dos exemplos abaixo.',
      type: 'error',
      suggestions: suggestions.length > 0 ? suggestions.slice(0, 5) : commonCommands.slice(0, 5)
    }
  }
  
  const response = await processParsedCommand(parsed, userId, products)
  
  // Registrar comando no histórico se foi bem-sucedido
  if (response.type !== 'error' && parsed.intent !== 'unknown') {
    addToHistory(command, parsed.intent, true)
  }
  
  return response
}

/**
 * Processa um comando já parseado
 */
async function processParsedCommand(
  parsed: ParsedCommand,
  userId: string,
  products: Product[] = []
): Promise<BotResponse> {
  switch (parsed.intent) {
    case 'sell_product':
      console.log('🚀 LOG - Intent: sell_product - Chamando handleSellProduct')
      console.log('  - parsed.entities:', JSON.stringify(parsed.entities, null, 2))
      const sellResponse = await handleSellProduct(parsed, userId, products)
      console.log('🚀 LOG - handleSellProduct retornou:')
      console.log('  - message:', sellResponse.message)
      console.log('  - type:', sellResponse.type)
      console.log('  - requiresConfirmation:', sellResponse.requiresConfirmation)
      console.log('  - confirmationData:', JSON.stringify(sellResponse.confirmationData, null, 2))
      // Guardar contexto se a resposta precisa de confirmação ou listagem
      if (sellResponse.data?.contextType === 'list_products') {
        setConversationContext({
          type: 'list_products',
          question: sellResponse.data.question,
          timestamp: Date.now()
        })
      }
      return sellResponse
    
    case 'register_expense':
      const expenseResponse = await handleRegisterExpense(parsed, userId)
      // Se a resposta requer input (pergunta de valor), guardar contexto
      if (expenseResponse.requiresInput && expenseResponse.type === 'question') {
        setConversationContext({
          type: 'ask_amount',
          intent: parsed.intent,
          originalCommand: parsed.raw,
          entities: parsed.entities,
          timestamp: Date.now()
        })
      }
      return expenseResponse
    
    case 'register_income':
      return await handleRegisterIncome(parsed, userId)
    
    case 'check_stock':
      return await handleCheckStock(parsed, products)
    
    case 'restock_product':
      const restockResponse = await handleRestockProduct(parsed, userId, products)
      // Guardar contexto se precisa de listagem
      if (restockResponse.data?.contextType === 'list_products') {
        setConversationContext({
          type: 'list_products',
          question: restockResponse.data.question,
          timestamp: Date.now()
        })
      }
      return restockResponse
    
    case 'list_products':
      clearConversationContext()
      return {
        message: products.length === 0 
          ? 'Você ainda não tem produtos cadastrados.'
          : `📦 Você tem ${products.length} produto(s) cadastrado(s):\n\n${products.map((p, i) => `${i + 1}. ${p.name} - R$ ${p.price.toFixed(2)} (Estoque: ${p.stock_quantity})`).join('\n')}`,
        type: 'info',
        data: { products }
      }
    
    case 'search_product':
      return await handleSearchProduct(parsed, products)
    
    case 'calculate_profit':
      return await calculateNetProfit(parsed, userId)
    
    case 'generate_insights':
      // Se comando mencionar "avançado" ou "completo", usar insights avançados
      const commandLower = parsed.raw.toLowerCase()
      if (commandLower.includes('avançado') || commandLower.includes('avancado') || commandLower.includes('completo')) {
        return await generateAdvancedInsights(parsed, userId)
      }
      return await generateFinancialInsights(parsed, userId)
    
    case 'analyze_products':
      return await analyzeTopProducts(parsed, userId)
    
    case 'check_revenue':
      return await checkRevenue(parsed, userId)
    
    case 'check_expenses':
      return await checkExpenses(parsed, userId)
    
    case 'create_task':
      return await handleCreateTask(parsed, userId)
    
    case 'help':
      clearConversationContext()
      return handleHelp()
    
    case 'unknown':
    default:
      return {
        message: 'Desculpe, não entendi o comando. Digite "ajuda" para ver os comandos disponíveis.',
        type: 'error',
        suggestions: ['ajuda', 'vendi o colar', 'gastei 50 reais']
      }
  }
}

/**
 * Executa uma ação confirmada pelo usuário
 */
export async function executeConfirmedAction(
  data: ConfirmationData,
  userId: string,
  products: Product[] = []
): Promise<BotResponse> {
  switch (data.action) {
    case 'sell_product':
      return await executeSellProduct(data, userId)
    
    case 'register_expense':
      return await executeRegisterExpense(data, userId)
    
    case 'register_income':
      return await executeRegisterIncome(data, userId)
    
    default:
      return {
        message: 'Ação não reconhecida.',
        type: 'error'
      }
  }
}

