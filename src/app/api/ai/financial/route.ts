import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Função para gerar textos de confirmação nativos
function generateConfirmationText(parsedCommand: any, productMatches: any[]): string {
  const { action, productName, amount, category, date, paymentScheduled, paymentDate, description } = parsedCommand
  
  if (action === 'receita') {
    if (productMatches.length > 0) {
      if (productMatches.length === 1) {
        let message = `✅ Perfeito! Identifiquei que você vendeu "${productMatches[0].name}" por ${amount ? `R$ ${amount.toFixed(2)}` : 'valor a definir'}. A transação será registrada como receita na categoria "${category}".`
        
        if (paymentScheduled && paymentDate) {
          const paymentDateFormatted = new Date(paymentDate).toLocaleDateString('pt-BR')
          message += `\n\n📅 **Pagamento Agendado:** Esta transação será marcada como pendente e você receberá uma notificação em ${paymentDateFormatted}.`
        }
        
        return message
      } else {
        // Gerar lista numerada de produtos
        const productList = productMatches.map((product, index) => 
          `${index + 1}- ${product.name} (R$ ${product.price.toFixed(2)})`
        ).join('\n')
        
        return `🤖 **Produtos encontrados:**\n\n${productList}\n\n**Digite o número do produto vendido para confirmar a transação.**`
      }
    } else {
      return `🤖 Entendi que você fez uma venda! Por favor, selecione o produto vendido para registrar a receita na categoria "${category}".`
    }
  } else if (action === 'despesa') {
    // Se não tem valor, pergunta o valor
    if (!amount || amount === 0) {
      const descriptionText = description || productName || 'esta despesa'
      return `✅ Entendi que você quer registrar uma despesa: "${descriptionText}"\n\n❓ **Qual foi o valor?** Por favor, informe o valor da despesa.\n\n💡 **Exemplos:**\n• 80,39\n• R$ 80,39\n• 50,00`
    }
    
    // Se tem valor, confirma a transação
    const descriptionText = description || productName || 'Despesa'
    let message = `✅ Perfeito! Registrei sua despesa de **R$ ${amount.toFixed(2)}** na categoria "${category}".\n\n📝 **Descrição:** ${descriptionText}\n📅 **Data:** ${new Date(date).toLocaleDateString('pt-BR')}`
    
    if (paymentScheduled && paymentDate) {
      const paymentDateFormatted = new Date(paymentDate).toLocaleDateString('pt-BR')
      message += `\n\n📅 **Pagamento Agendado:** Esta transação será marcada como pendente até ${paymentDateFormatted}.`
    } else {
      message += `\n\n✅ A transação será registrada e o valor será deduzido do seu caixa.`
    }
    
    return message
  }
  
  return `🤖 Comando processado com sucesso!`
}

export async function POST(request: NextRequest) {
  try {
    // LOG: Início da função POST
    console.log('🚀 LOG - API Route POST INICIADO')
    console.log('  - Method:', request.method)
    console.log('  - URL:', request.url)
    console.log('  - Headers:', Object.fromEntries(request.headers.entries()))
    
    console.log('🔵 API Route: Requisição recebida')
    
    const requestBody = await request.json()
    console.log('🚀 LOG - Request body recebido:')
    console.log('  - command:', requestBody.command)
    console.log('  - userId:', requestBody.userId)
    console.log('  - userProducts.length:', requestBody.userProducts?.length)
    
    const { command, userId, userProducts } = requestBody
    console.log('🔵 API Route: Dados recebidos:', { command, userId, userProductsLength: userProducts?.length })

    if (!command || !userId) {
      console.log('🔴 API Route: Command ou userId faltando')
      return NextResponse.json(
        { error: 'Command and userId are required' },
        { status: 400 }
      )
    }

    // Obter o token do cabeçalho Authorization
    const authHeader = request.headers.get('authorization')
    console.log('🔵 API Route: Authorization header existe?', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔴 API Route: Authorization header inválido')
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('🔵 API Route: Token extraído (tamanho):', token.length)
    
    // Verificar se o token não está vazio
    if (!token || token === 'undefined' || token === 'null') {
      console.log('🔴 API Route: Token inválido')
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Criar cliente Supabase
    console.log('🔵 API Route: Criando cliente Supabase...')
    const supabase = await createClient()
    console.log('🔵 API Route: Cliente Supabase criado')
    
    // Verificar se o usuário está autenticado usando o token
    console.log('🔵 API Route: Verificando usuário com token...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError) {
      console.log('🔴 API Route: Erro de autenticação:', authError)
      return NextResponse.json(
        { error: 'Invalid or expired token', details: authError.message },
        { status: 401 }
      )
    }
    
    if (!user) {
      console.log('🔴 API Route: Usuário não encontrado')
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    console.log('🔵 API Route: Usuário autenticado:', user.id)

    // Verificar se o userId corresponde ao usuário autenticado
    if (user.id !== userId) {
      console.log('🔴 API Route: User ID mismatch')
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      )
    }

    // Processar comando com sistema nativo (sem IA)
    console.log('🔵 API Route: Processando comando com sistema nativo...')
    console.log('🔵 API Route: Comando:', command)
    console.log('🔵 API Route: Produtos disponíveis:', userProducts.length)
    console.log('🔵 API Route: Primeiros 3 produtos:', userProducts.slice(0, 3).map((p: any) => ({ name: p.name, price: p.price })))
    
    // Função para extrair valor monetário do texto
    // Aceita formatos: "80,39", "80.39", "R$ 80,39", "80 reais", etc.
    const extractAmount = (text: string): number | null => {
      // Primeiro tenta padrão com palavras monetárias (reais, R$, rs)
      const amountRegexWithCurrency = /(\d+(?:[.,]\d{2})?)\s*(?:reais?|r\$|rs)/i
      let match = text.match(amountRegexWithCurrency)
      if (match) {
        return parseFloat(match[1].replace(',', '.'))
      }
      
      // Se não encontrou, tenta padrão numérico simples (formato brasileiro: vírgula decimal)
      // Aceita: "80,39", "80,39 reais", "R$ 80,39", "80.39", etc.
      const simpleAmountRegex = /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?|\d+(?:\.\d{2})?)/
      match = text.match(simpleAmountRegex)
      if (match) {
        // Remove pontos de milhar e substitui vírgula por ponto
        const cleanValue = match[1].replace(/\./g, '').replace(',', '.')
        const parsed = parseFloat(cleanValue)
        // Valida se é um valor razoável (entre 0 e 1 milhão)
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1000000) {
          return parsed
        }
      }
      
      return null
    }

    // Função para extrair data do texto
    const extractDate = (text: string): string => {
      const today = new Date()
      const lowerText = text.toLowerCase()
      
      if (lowerText.includes('hoje')) {
        return today.toLocaleDateString('en-CA')
      }
      if (lowerText.includes('ontem')) {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday.toLocaleDateString('en-CA')
      }
      if (lowerText.includes('amanhã') || lowerText.includes('amanha')) {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toLocaleDateString('en-CA')
      }
      if (lowerText.includes('mês que vem') || lowerText.includes('mes que vem') || lowerText.includes('próximo mês') || lowerText.includes('proximo mes')) {
        const nextMonth = new Date(today)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return nextMonth.toLocaleDateString('en-CA')
      }
      if (lowerText.includes('semana que vem') || lowerText.includes('próxima semana') || lowerText.includes('proxima semana')) {
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)
        return nextWeek.toLocaleDateString('en-CA')
      }
      
      return today.toLocaleDateString('en-CA')
    }

    // Função para detectar se é pagamento agendado
    const detectScheduledPayment = (text: string): { isScheduled: boolean; scheduledDate: string | null } => {
      console.log('🚀 LOG - detectScheduledPayment chamado com texto:', text)
      
      const lowerText = text.toLowerCase()
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normalizar para meia-noite
      
      // Palavras-chave que indicam pagamento futuro (expandidas com todas as variações)
      const futureKeywords = [
        // Variações de "será pago"
        'será pago', 'sera pago', 'ser pago', 'será pago em', 'sera pago em', 'ser pago em',
        'pago será', 'pago sera', 'pago em', 'pago no', 'pago na',
        // Variações de receber
        'receberei', 'receberá', 'recebera', 'receber', 'vou receber', 'vai receber',
        'vou receber em', 'vai receber em', 'receber em', 'receber no', 'receber na',
        'pra receber', 'para receber', 'a receber', 'a receber em',
        // Variações de pagar
        'vou pagar', 'vai pagar', 'vou pagar em', 'vai pagar em',
        'pagar em', 'pagar no', 'pagar na', 'pra pagar', 'para pagar',
        'a pagar', 'a pagar em',
        // Variações temporais - IMPORTANTE: verificar primeiro antes de outras palavras-chave
        'amanhã', 'amanha', 'mês que vem', 'mes que vem', 'próximo mês', 'proximo mes',
        'semana que vem', 'próxima semana', 'proxima semana',
        'ano que vem',
        // Outras variações
        'pagamento futuro', 'pagamento agendado', 'agendado', 'agendar', 'marcar',
        'posterior', 'depois', 'futuro'
      ]
      
      // Verificar primeiro por datas relativas explícitas (prioridade)
      let scheduledDate: Date | null = null
      let isScheduled = false
      
      if (lowerText.includes('amanhã') || lowerText.includes('amanha')) {
        scheduledDate = new Date(today)
        scheduledDate.setDate(scheduledDate.getDate() + 1)
        isScheduled = true
        console.log('🚀 LOG - detectScheduledPayment: Detectado "amanhã" - scheduledDate:', scheduledDate.toLocaleDateString('en-CA'))
      } else if (lowerText.includes('mês que vem') || lowerText.includes('mes que vem') || lowerText.includes('próximo mês') || lowerText.includes('proximo mes')) {
        scheduledDate = new Date(today)
        scheduledDate.setMonth(scheduledDate.getMonth() + 1)
        isScheduled = true
      } else if (lowerText.includes('semana que vem') || lowerText.includes('próxima semana') || lowerText.includes('proxima semana')) {
        scheduledDate = new Date(today)
        scheduledDate.setDate(scheduledDate.getDate() + 7)
        isScheduled = true
      } else if (lowerText.includes('ano que vem')) {
        scheduledDate = new Date(today)
        scheduledDate.setFullYear(scheduledDate.getFullYear() + 1)
        isScheduled = true
      } else {
        // Verificar outras palavras-chave de pagamento futuro
        const hasFutureKeyword = futureKeywords.some(keyword => lowerText.includes(keyword))
        
        console.log('🚀 LOG - detectScheduledPayment:')
        console.log('  - hasFutureKeyword:', hasFutureKeyword)
        console.log('  - lowerText:', lowerText)
        
        if (!hasFutureKeyword) {
          console.log('🚀 LOG - detectScheduledPayment: NÃO detectado (retornando false)')
          return { isScheduled: false, scheduledDate: null }
        }
        
        console.log('🚀 LOG - detectScheduledPayment: DETECTADO! Continuando extração de data...')
        
        // Tentar extrair data específica (ex: "dia 15", "15 de fevereiro")
        const dayMatch = text.match(/(?:dia|dia\s)?(\d{1,2})(?:\s+de\s+)?(\w+)?/)
        if (dayMatch) {
          const day = parseInt(dayMatch[1])
          scheduledDate = new Date(today)
          
          // Se mencionou mês específico
          const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                              'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
          if (dayMatch[2]) {
            const monthIndex = monthNames.findIndex(m => m.toLowerCase().includes(dayMatch[2].toLowerCase()))
            if (monthIndex !== -1) {
              scheduledDate.setMonth(monthIndex)
            } else {
              scheduledDate.setMonth(scheduledDate.getMonth() + 1)
            }
          } else {
            scheduledDate.setMonth(scheduledDate.getMonth() + 1)
          }
          
          scheduledDate.setDate(day)
          isScheduled = true
        } else {
          // Padrão: mês que vem
          scheduledDate = new Date(today)
          scheduledDate.setMonth(scheduledDate.getMonth() + 1)
          isScheduled = true
        }
      }
      
      return {
        isScheduled,
        scheduledDate: scheduledDate ? scheduledDate.toLocaleDateString('en-CA') : null
      }
    }

    // Função para determinar ação baseada em palavras-chave
    const determineAction = (text: string): string => {
      const lowerText = text.toLowerCase()
      
      // Palavras que indicam receita/venda
      const receitaKeywords = ['vendi', 'venda', 'vender', 'recebi', 'receita', 'vendas', 'ganhei', 'ganhar']
      if (receitaKeywords.some(keyword => lowerText.includes(keyword))) {
        return 'receita'
      }
      
      // Palavras que indicam despesa/compra (expandido)
      const despesaKeywords = [
        'gastei', 'comprei', 'compra', 'despesa', 'gasto', 'paguei', 'pagar', 
        'conta de', 'conta do', 'conta da', 'conta para', 'conta para pagar',
        'para pagar', 'a pagar', 'vou pagar', 'vai pagar'
      ]
      if (despesaKeywords.some(keyword => lowerText.includes(keyword))) {
        return 'despesa'
      }
      
      return 'receita' // Default para receita
    }

    // Função para determinar categoria
    const determineCategory = (action: string, text: string): string => {
      const lowerText = text.toLowerCase()
      
      if (action === 'receita') {
        return 'Vendas'
      }
      
      if (action === 'despesa') {
        if (lowerText.includes('supermercado') || lowerText.includes('compras')) {
          return 'Compras'
        }
        if (lowerText.includes('imposto') || lowerText.includes('taxa')) {
          return 'Impostos'
        }
        if (lowerText.includes('operacional') || lowerText.includes('operação')) {
          return 'Operacional'
        }
        return 'Despesas'
      }
      
      return 'Outros'
    }

    // Função para buscar produtos no sistema
    const findProducts = (text: string, products: any[]): any[] => {
      const lowerText = text.toLowerCase()
      const matches: any[] = []
      
      // Palavras-chave comuns para produtos
      const productKeywords = [
        'brinco', 'brincos', 'colar', 'colares', 'anel', 'aneis', 
        'pulseira', 'pulseiras', 'corrente', 'correntes', 'pingente', 'pingentes',
        'produto', 'produtos', 'item', 'items'
      ]
      
      // Palavras específicas para filtrar ainda mais
      const specificWords = ['gota', 'coração', 'argola', 'bolinha', 'gatinha', 'ponto', 'luz', 'trevo', 'chapa']
      
      // Encontrar palavra-chave principal no texto
      const foundKeyword = productKeywords.find(keyword => lowerText.includes(keyword))
      
      if (foundKeyword) {
        // Buscar produtos que contenham a palavra-chave principal
        let productMatches = products.filter(product => {
          const productName = product.name.toLowerCase()
          
          // Match exato com palavra-chave principal
          if (productName.includes(foundKeyword)) return true
          
          // Match por categoria comum
          const commonWords = ['brinco', 'colar', 'anel', 'pulseira', 'corrente', 'pingente']
          const hasCommonWord = commonWords.some(word => 
            productName.includes(word) && foundKeyword.includes(word)
          )
          
          return hasCommonWord
        })
        
        // Se encontrou palavra-chave específica (como "gota"), filtrar ainda mais
        const foundSpecificWord = specificWords.find(word => lowerText.includes(word))
        
        if (foundSpecificWord) {
          // Filtrar produtos que contenham TODAS as palavras específicas encontradas
          const allSpecificWords = specificWords.filter(word => lowerText.includes(word))
          
          productMatches = productMatches.filter(product => {
            const productName = product.name.toLowerCase()
            
            // O produto deve conter TODAS as palavras específicas encontradas
            return allSpecificWords.every(word => productName.includes(word))
          })
        }
        
        matches.push(...productMatches)
      }
      
      // Se não encontrou produtos específicos, mostrar todos os produtos disponíveis
      if (matches.length === 0 && products.length > 0) {
        matches.push(...products.slice(0, 5)) // Limitar a 5 produtos
      }
      
      return matches.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price, // Este já é o preço de venda (com margem aplicada)
        stock_quantity: p.stock_quantity,
        category: p.category?.name,
        confidence: 0.8
      }))
    }

    // Função para detectar parcelamento
    const detectInstallment = (text: string): { isInstallment: boolean; installmentCount: number; installmentInterval: string } => {
      console.log('🚀 LOG - detectInstallment chamado com texto:', text)
      
      const lowerText = text.toLowerCase()
      
      // Padrões para parcelamento
      const installmentPattern = /(?:em|com|de)\s+(\d+)\s*(?:x|vezes|parcelas?)/i
      const match = text.match(installmentPattern)
      
      console.log('🚀 LOG - detectInstallment:')
      console.log('  - match encontrado:', match)
      console.log('  - padrão usado:', installmentPattern)
      
      if (!match) {
        console.log('🚀 LOG - detectInstallment: NÃO detectado (retornando false)')
        return { isInstallment: false, installmentCount: 1, installmentInterval: 'monthly' }
      }
      
      console.log('🚀 LOG - detectInstallment: DETECTADO!')
      
      const count = parseInt(match[1])
      let interval = 'monthly' // Default
      
      if (lowerText.includes('semanal') || lowerText.includes('semana')) {
        interval = 'weekly'
      } else if (lowerText.includes('trimestral') || lowerText.includes('trimestre')) {
        interval = 'quarterly'
      }
      
      return { isInstallment: true, installmentCount: count, installmentInterval: interval }
    }

    // Função para detectar recorrência
    const detectRecurring = (text: string): { isRecurring: boolean; recurringInterval: string; recurringEndDate: string | null } => {
      const lowerText = text.toLowerCase()
      
      const recurringPattern = /(?:todo\s+mês|toda\s+semana|mensalmente?|semanalmente?|recorrente|recorrencia)/i
      if (!recurringPattern.test(text)) {
        return { isRecurring: false, recurringInterval: 'monthly', recurringEndDate: null }
      }
      
      let interval = 'monthly'
      if (lowerText.includes('semanal') || lowerText.includes('semana')) {
        interval = 'weekly'
      } else if (lowerText.includes('trimestral') || lowerText.includes('trimestre')) {
        interval = 'quarterly'
      }
      
      // Tentar extrair data de término
      const endDatePattern = /(?:até|ate|termina|acaba)\s+(?:dia\s+)?(\d{1,2})(?:\/(\d{1,2}))?(?:\/(\d{4}))?/i
      const endDateMatch = text.match(endDatePattern)
      let endDate: string | null = null
      
      if (endDateMatch) {
        const today = new Date()
        const day = parseInt(endDateMatch[1])
        const month = endDateMatch[2] ? parseInt(endDateMatch[2]) : today.getMonth() + 1
        const year = endDateMatch[3] ? parseInt(endDateMatch[3]) : today.getFullYear()
        endDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
      
      return { isRecurring: true, recurringInterval: interval, recurringEndDate: endDate }
    }

    // Verificar se é apenas um valor numérico (resposta a uma pergunta anterior)
    // Se o comando é apenas um número ou valor monetário, trata como valor
    const valuePattern = /^[\s]*r\$\s*[\d.,]+|^[\d.,]+[\s]*$/i
    const isOnlyAmount = valuePattern.test(command.trim())
    
    // Processar comando
    let action = determineAction(command)
    let amount = extractAmount(command)
    let category = determineCategory(action, command)
    let productMatches = findProducts(command, userProducts)
    let { isScheduled, scheduledDate } = detectScheduledPayment(command)
    const { isInstallment, installmentCount, installmentInterval } = detectInstallment(command)
    const { isRecurring, recurringInterval, recurringEndDate } = detectRecurring(command)
    
    // IMPORTANTE: Se há pagamento agendado, a data da transação deve ser HOJE (quando foi registrada)
    // e o scheduled_date deve ser a data futura. Se não há agendamento, usar a data extraída.
    let date: string
    if (isScheduled && scheduledDate) {
      // Pagamento agendado: data da transação é hoje, scheduled_date é a data futura
      const today = new Date()
      date = today.toLocaleDateString('en-CA')
      console.log('🚀 LOG - Pagamento agendado detectado:')
      console.log('  - date (hoje):', date)
      console.log('  - scheduledDate (futuro):', scheduledDate)
    } else {
      // Sem agendamento: usar data extraída do comando
      date = extractDate(command)
    }
    
    // Se o comando é apenas um valor e não há ação clara ou não foi extraído valor
    // (caso comum: usuário responde apenas o valor após BOT perguntar)
    if (isOnlyAmount && (!amount || amount === 0)) {
      // Tenta extrair valor com padrão mais simples
      let cleanValue = command.trim()
        .replace(/r\$/gi, '') // Remove R$
        .replace(/\s/g, '') // Remove espaços
        .replace(/\./g, '') // Remove pontos (podem ser separadores de milhar)
        .replace(',', '.') // Converte vírgula para ponto
      
      // Se não tem ponto decimal e tem menos de 3 dígitos, pode ser um valor inteiro
      if (!cleanValue.includes('.') && cleanValue.length <= 3) {
        cleanValue = cleanValue + '.00'
      }
      
      const parsedValue = parseFloat(cleanValue)
      if (!isNaN(parsedValue) && parsedValue > 0) {
        amount = parsedValue
        // Se não há contexto claro, assume despesa (mais comum quando usuário responde valor)
        if (action === 'receita') {
          action = 'despesa'
          category = 'Despesas'
        }
      }
    }
    
    // Se detectou despesa mas não há produto, não precisa buscar produtos
    if (action === 'despesa' && productMatches.length === 0) {
      // Despesas sem produtos são válidas (ex: conta de água, conta de luz)
      productMatches = []
    }

    // LOG: Detalhado de todas as informações extraídas
    console.log('🔍 LOG - API Route - Informações extraídas do comando:')
    console.log('  - Comando original:', command)
    console.log('  - Action determinada:', action)
    console.log('  - Amount extraído:', amount)
    console.log('  - Date extraída:', date)
    console.log('  - Category determinada:', category)
    console.log('  - Product matches encontrados:', productMatches.length)
    console.log('  - Product matches:', productMatches.map(p => ({ name: p.name, price: p.price })))
    console.log('  - Pagamento agendado:')
    console.log('    * isScheduled:', isScheduled, '(tipo:', typeof isScheduled, ')')
    console.log('    * scheduledDate:', scheduledDate, '(tipo:', typeof scheduledDate, ')')
    console.log('  - Parcelamento:')
    console.log('    * isInstallment:', isInstallment, '(tipo:', typeof isInstallment, ')')
    console.log('    * installmentCount:', installmentCount, '(tipo:', typeof installmentCount, ')')
    console.log('    * installmentInterval:', installmentInterval)
    console.log('  - Recorrência:')
    console.log('    * isRecurring:', isRecurring, '(tipo:', typeof isRecurring, ')')
    console.log('    * recurringInterval:', recurringInterval)
    console.log('    * recurringEndDate:', recurringEndDate)

    // Extrair descrição da despesa (ex: "conta de água", "conta de luz")
    let description: string | null = null
    if (action === 'despesa') {
      // Tenta extrair descrição de padrões como "conta de água", "conta de luz", etc.
      const descriptionMatch = command.match(/(?:conta\s+de\s+|conta\s+do\s+|conta\s+da\s+)([^\d]+?)(?:\s+para|\s+de|\s+que|$)/i)
      if (descriptionMatch) {
        description = descriptionMatch[1].trim()
      } else {
        // Se não encontrou padrão específico, usa o comando inteiro (sem valores)
        description = command.replace(/\d+[.,]?\d*/g, '').replace(/reais?|r\$/gi, '').trim()
        if (description && description.length > 50) {
          description = description.substring(0, 50) + '...'
        }
      }
    }
    
    const parsedCommand = {
      action,
      productName: productMatches.length > 0 ? productMatches[0].name : (description || null),
      amount,
      date,
      paymentScheduled: isScheduled,
      paymentDate: scheduledDate,
      category,
      confidence: 0.9,
      productMatches,
      description, // Adicionar descrição para despesas sem produtos
      // Parcelamento
      isInstallment,
      installmentCount,
      installmentInterval,
      // Recorrência
      isRecurring,
      recurringInterval,
      recurringEndDate
    }

    // LOG: Verificar parsedCommand que será retornado
    console.log('🔍 LOG - API Route - parsedCommand completo:')
    console.log(JSON.stringify(parsedCommand, null, 2))
    console.log('🔍 LOG - API Route - Valores específicos:')
    console.log('  - paymentScheduled:', parsedCommand.paymentScheduled, '(tipo:', typeof parsedCommand.paymentScheduled, ')')
    console.log('  - paymentDate:', parsedCommand.paymentDate, '(tipo:', typeof parsedCommand.paymentDate, ')')
    console.log('  - isInstallment:', parsedCommand.isInstallment, '(tipo:', typeof parsedCommand.isInstallment, ')')
    console.log('  - installmentCount:', parsedCommand.installmentCount, '(tipo:', typeof parsedCommand.installmentCount, ')')
    console.log('  - isRecurring:', parsedCommand.isRecurring, '(tipo:', typeof parsedCommand.isRecurring, ')')

    // Gerar texto de confirmação nativo
    const confirmationText = generateConfirmationText(parsedCommand, productMatches)
    console.log('🔵 API Route: Confirmation text gerado:', confirmationText)

    const responseData = {
      success: true,
      parsedCommand,
      confirmationText,
      usageInfo: {
        subscription_plan: 'free',
        commands_used: 1,
        commands_limit: 10,
        can_use_ai: true,
        reset_date: new Date().toLocaleDateString('en-CA')
      }
    }

    console.log('✅ API Route: Sucesso com sistema nativo!')
    
    // LOG: Antes de retornar resposta
    console.log('🚀 LOG - Retornando resposta da API:')
    console.log('  - responseData completo:', JSON.stringify(responseData, null, 2))
    console.log('  - parsedCommand na resposta:', JSON.stringify(responseData.parsedCommand, null, 2))
    
    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error('🔴 API Route: Erro capturado:', error)
    console.error('🔴 API Route: Stack trace:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
