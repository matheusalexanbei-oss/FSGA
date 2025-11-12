import { BotResponse, ParsedCommand, ConfirmationData } from '../types'
import { Product } from '@/types/product'
import { createClient } from '@/lib/supabase/client'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'
import { formatDateString } from '../date-patterns'
import { searchProducts } from '../product-search'

// Função para gerar UUID no browser
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback para browsers mais antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const supabase = createClient()

/**
 * Busca um produto por ID
 */
async function getProduct(productId: string, userId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('user_id', userId)
    .single()
  
  if (error || !data) return null
  return data as Product
}

/**
 * Atualiza o estoque de um produto
 */
async function updateStock(productId: string, userId: string, quantityChange: number): Promise<void> {
  const product = await getProduct(productId, userId)
  if (!product) throw new Error('Produto não encontrado')
  
  const newStock = Math.max(0, product.stock_quantity + quantityChange)
  
  const { error } = await supabase
    .from('products')
    .update({ 
      stock_quantity: newStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * Cria uma transação financeira
 */
async function createTransaction(data: {
  user_id: string
  type: 'income' | 'expense'
  amount: number
  date: string
  description: string | null
  category: string | null
  product_id?: string
  is_paid?: boolean
  scheduled_date?: string | null
  is_installment?: boolean
  installment_count?: number
  installment_number?: number
  installment_interval?: string
  installment_group_id?: string | null
  notes?: string | null
}): Promise<any> {
  const { data: transaction, error } = await supabase
    .from('financial_transactions')
    .insert({
      user_id: data.user_id,
      type: data.type,
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      is_paid: data.is_paid ?? true,
      scheduled_date: data.scheduled_date || null,
      is_installment: data.is_installment || false,
      installment_count: data.installment_count || null,
      installment_number: data.installment_number || null,
      installment_interval: data.installment_interval || null,
      installment_group_id: data.installment_group_id || null,
      notes: data.notes || null,
    })
    .select()
    .single()
  
  if (error) throw error
  return transaction
}

/**
 * Handler para venda de produto
 */
export async function handleSellProduct(
  command: ParsedCommand,
  userId: string,
  products: Product[]
): Promise<BotResponse> {
  // LOG: Início do handleSellProduct
  console.log('🚀 LOG - handleSellProduct INICIADO')
  console.log('  - command.entities completo:', JSON.stringify(command.entities, null, 2))
  
  const { 
    productName, 
    amount, 
    date, 
    quantity, 
    paymentScheduled, 
    paymentDate,
    isInstallment,
    installmentCount,
    installmentInterval,
    isRecurring,
    recurringInterval,
    recurringEndDate
  } = command.entities
  
  // LOG: Valores extraídos
  console.log('🚀 LOG - handleSellProduct - Valores extraídos:')
  console.log('  - productName:', productName)
  console.log('  - paymentScheduled:', paymentScheduled, '(tipo:', typeof paymentScheduled, ')')
  console.log('  - paymentDate:', paymentDate)
  console.log('  - isInstallment:', isInstallment, '(tipo:', typeof isInstallment, ')')
  console.log('  - installmentCount:', installmentCount)
  console.log('  - isRecurring:', isRecurring, '(tipo:', typeof isRecurring, ')')
  
  // Verificar se tem nome do produto
  if (!productName) {
    return {
      message: "Não consegui identificar qual produto você vendeu. Pode repetir?\n\nExemplo: \"vendi o colar de pérolas\"",
      type: 'error',
      suggestions: ['vendi o colar de pérolas', 'vendi um produto']
    }
  }
  
  // Buscar produtos usando busca flexível
  const matches = searchProducts(products, productName)
  
  if (matches.length === 0) {
    return {
      message: `Não encontrei nenhum produto com o nome "${productName}".\n\nQuer que eu liste os produtos disponíveis?`,
      type: 'question',
      data: { 
        contextType: 'list_products',
        question: 'Quer que eu liste os produtos disponíveis?'
      },
      suggestions: ['sim', 'não', 'listar produtos']
    }
  }
  
  if (matches.length === 1) {
    // Produto único - preparar confirmação
    const product = matches[0]
    const saleQuantity = quantity || 1
    const saleAmount = amount || product.price
    const saleDate = date || getLocalDateString()
    const isScheduled = paymentScheduled || false
    const scheduledDate = paymentDate || null
    
    if (product.stock_quantity < saleQuantity) {
      return {
        message: `⚠️ Estoque insuficiente!\n\nProduto: ${product.name}\nEstoque disponível: ${product.stock_quantity}\nQuantidade solicitada: ${saleQuantity}`,
        type: 'error'
      }
    }
    
    const totalAmount = saleAmount * saleQuantity
    
    // LOG: Valores calculados para confirmação
    console.log('🚀 LOG - handleSellProduct - Valores calculados:')
    console.log('  - saleQuantity:', saleQuantity)
    console.log('  - saleAmount:', saleAmount)
    console.log('  - totalAmount:', totalAmount)
    console.log('  - isScheduled:', isScheduled)
    console.log('  - scheduledDate:', scheduledDate)
    console.log('  - isInstallment:', isInstallment)
    console.log('  - installmentCount:', installmentCount)
    console.log('  - isRecurring:', isRecurring)
    
    let confirmationMessage = `Confirmar venda?\n\n`
    confirmationMessage += `📦 Produto: ${product.name}\n`
    confirmationMessage += `💰 Valor unitário: R$ ${saleAmount.toFixed(2)}\n`
    confirmationMessage += `📊 Quantidade: ${saleQuantity}\n`
    confirmationMessage += `💵 Total: R$ ${totalAmount.toFixed(2)}\n`
    confirmationMessage += `📅 Data: ${formatDateString(saleDate)}\n`
    
    if (isInstallment && installmentCount) {
      const installmentAmount = totalAmount / installmentCount
      const intervalText = installmentInterval === 'weekly' ? 'semanal' : 
                          installmentInterval === 'quarterly' ? 'trimestral' : 'mensal'
      confirmationMessage += `\n📦 Parcelamento: ${installmentCount}x de R$ ${installmentAmount.toFixed(2)} (${intervalText})`
      console.log('🚀 LOG - Parcelamento adicionado à mensagem')
    } else if (isRecurring && recurringInterval) {
      const intervalText = recurringInterval === 'weekly' ? 'semanal' : 
                          recurringInterval === 'quarterly' ? 'trimestral' : 'mensal'
      confirmationMessage += `\n🔄 Recorrente: ${intervalText}`
      if (recurringEndDate) {
        confirmationMessage += ` até ${formatDateString(recurringEndDate)}`
      }
      console.log('🚀 LOG - Recorrência adicionada à mensagem')
    } else if (isScheduled && scheduledDate) {
      confirmationMessage += `\n⏰ Pagamento agendado para: ${formatDateString(scheduledDate)}`
      console.log('🚀 LOG - Pagamento agendado adicionado à mensagem')
    }
    
    const confirmationData = {
        action: 'sell_product',
        productId: product.id,
        productName: product.name,
        amount: saleAmount,
        quantity: saleQuantity,
        totalAmount,
        date: saleDate,
        isScheduled,
        scheduledDate,
        isPaid: !isScheduled && !isInstallment && !isRecurring,
        isInstallment,
        installmentCount,
        installmentInterval,
        isRecurring,
        recurringInterval,
        recurringEndDate
      }
    
    // LOG: confirmationData que será retornado
    console.log('🚀 LOG - handleSellProduct - confirmationData:')
    console.log(JSON.stringify(confirmationData, null, 2))
    console.log('🚀 LOG - confirmationData.isScheduled:', confirmationData.isScheduled)
    console.log('🚀 LOG - confirmationData.isInstallment:', confirmationData.isInstallment)
    console.log('🚀 LOG - confirmationData.isRecurring:', confirmationData.isRecurring)
    console.log('🚀 LOG - confirmationData.isPaid:', confirmationData.isPaid)
    
    return {
      message: confirmationMessage,
      type: 'confirmation',
      requiresConfirmation: true,
      confirmationData
    }
  }
  
  // Múltiplos produtos - listar opções
  const options = matches.map((p, i) => 
    `${i + 1}. ${p.name} - R$ ${p.price.toFixed(2)} (Estoque: ${p.stock_quantity})`
  ).join('\n')
  
  return {
    message: `Encontrei ${matches.length} produtos. Qual deles você quer vender?\n\n${options}\n\nDigite o número do produto.`,
    type: 'question',
    data: { productMatches: matches },
    suggestions: matches.map((_, i) => (i + 1).toString())
  }
}

/**
 * Executa a venda de produto (após confirmação)
 */
export async function executeSellProduct(
  data: ConfirmationData,
  userId: string
): Promise<BotResponse> {
  // LOG: Início do executeSellProduct
  console.log('🚀 LOG - executeSellProduct INICIADO')
  console.log('  - data:', data)
  console.log('  - data completo:', JSON.stringify(data, null, 2))
  
  // Validar se data existe
  if (!data) {
    console.error('❌ ERRO - executeSellProduct: data é undefined ou null')
    return {
      message: '❌ Erro: Dados da transação não encontrados.',
      type: 'error'
    }
  }
  
  console.log('  - data.isScheduled:', data.isScheduled, '(tipo:', typeof data.isScheduled, ')')
  console.log('  - data.isInstallment:', data.isInstallment, '(tipo:', typeof data.isInstallment, ')')
  console.log('  - data.isRecurring:', data.isRecurring, '(tipo:', typeof data.isRecurring, ')')
  console.log('  - data.isPaid:', data.isPaid, '(tipo:', typeof data.isPaid, ')')
  
  try {
    // Verificar estoque novamente
    const product = await getProduct(data.productId, userId)
    if (!product) {
      return {
        message: "❌ Produto não encontrado.",
        type: 'error'
      }
    }
    
    if (product.stock_quantity < data.quantity) {
      return {
        message: `⚠️ Estoque insuficiente! Você tem apenas ${product.stock_quantity} unidades disponíveis.`,
        type: 'error'
      }
    }
    
    const today = getLocalDateString()
    let transactionDate = data.date || today
    
    // LOG: Antes de verificar tipo de transação
    console.log('🚀 LOG - executeSellProduct - Verificando tipo de transação:')
    console.log('  - data.isInstallment:', data.isInstallment)
    console.log('  - data.installmentCount:', data.installmentCount)
    console.log('  - data.isRecurring:', data.isRecurring)
    console.log('  - data.recurringInterval:', data.recurringInterval)
    
    // Criar parcelas se necessário
    if (data.isInstallment && data.installmentCount && data.installmentCount > 1) {
      console.log('🚀 LOG - executeSellProduct: Criando PARCELAS')
      console.log('  - data.isCardMachine:', data.isCardMachine)
      console.log('  - data.feePercentage:', data.feePercentage)
      
      // Verificar se é venda por maquininha (com taxa)
      const isCardMachine = data.isCardMachine || false
      const feePercentage = data.feePercentage || 0
      
      // CASO ESPECIAL: Venda parcelada por maquininha com taxa
      // Deve criar uma única transação com valor líquido total imediatamente
      if (isCardMachine && feePercentage > 0) {
        console.log('💰 VENDA POR MAQUININHA COM TAXA - Criando transação única com valor líquido')
        
        // Calcular valor líquido (com desconto de taxa)
        const feeAmount = data.totalAmount * (feePercentage / 100)
        const netTotalAmount = data.totalAmount - feeAmount
        
        console.log(`  - Valor total: R$ ${data.totalAmount.toFixed(2)}`)
        console.log(`  - Taxa (${feePercentage}%): R$ ${feeAmount.toFixed(2)}`)
        console.log(`  - Valor líquido: R$ ${netTotalAmount.toFixed(2)}`)
        
        // Criar UMA ÚNICA transação com valor líquido total
        const transaction = await createTransaction({
          user_id: userId,
          type: 'income',
          amount: netTotalAmount, // Valor líquido total (já com desconto)
          date: getLocalDateString(), // Data de hoje
          description: `${data.productName} (produto vendido por maquininha)`, // Sem referência a parcelas
          category: 'Vendas',
          product_id: data.productId,
          is_paid: true, // Entra imediatamente no caixa
          scheduled_date: null, // Não agendada
          is_installment: false, // NÃO é parcela
          installment_count: undefined,
          installment_number: undefined,
          installment_interval: undefined,
          installment_group_id: null
        })
        
        console.log('✅ Transação única criada:')
        console.log(`  - id: ${transaction.id}`)
        console.log(`  - amount: R$ ${netTotalAmount.toFixed(2)}`)
        console.log(`  - is_paid: ${transaction.is_paid}`)
        console.log(`  - description: ${transaction.description}`)
        
        // Atualizar estoque
        await updateStock(data.productId, userId, -data.quantity)
        
        // Montar mensagem de sucesso
        const successMessage = `✅ Venda registrada com sucesso!\n\n📦 ${data.productName} x${data.quantity}\n💵 Valor total: R$ ${data.totalAmount.toFixed(2)}\n📉 Taxa (${feePercentage}%): R$ ${feeAmount.toFixed(2)}\n💰 Valor líquido: R$ ${netTotalAmount.toFixed(2)}\n\n✅ Valor líquido adicionado ao caixa imediatamente`
        
        return {
          message: successMessage,
          type: 'success',
          data: { 
            transaction: transaction
          }
        }
      }
      
      // VENDA PARCELADA NORMAL (sem maquininha ou sem taxa)
      // Calcular valor líquido (sem desconto se não for maquininha)
      let netTotalAmount = data.totalAmount
      
      // Gerar UUID único para este grupo de parcelas
      const groupId = generateUUID()
      console.log('🚀 LOG - executeSellProduct - Grupo de parcelas criado:', groupId)
      
      // Dividir valor total pelo número de parcelas
      const installmentAmount = netTotalAmount / data.installmentCount
      const baseDate = new Date(transactionDate)
      const intervalMonths = data.installmentInterval === 'weekly' ? 0 : 
                            data.installmentInterval === 'monthly' ? 1 : 3
      
      const createdTransactions = []
      
      for (let i = 1; i <= data.installmentCount; i++) {
        const installmentDate = new Date(baseDate)
        
        if (intervalMonths > 0) {
          installmentDate.setMonth(baseDate.getMonth() + (intervalMonths * (i - 1)))
        } else {
          installmentDate.setDate(baseDate.getDate() + (7 * (i - 1)))
        }
        
        const isFirstInstallment = i === 1
        
        // Primeira parcela entra hoje, demais agendadas
        const firstInstallmentDate = isFirstInstallment ? getLocalDateString() : getLocalDateString(installmentDate)
        const firstInstallmentScheduledDate = isFirstInstallment ? null : getLocalDateString(installmentDate)
        const firstInstallmentIsPaid = isFirstInstallment
        
        // Montar descrição (sem texto adicional para maquininha em vendas normais)
        const description = `${data.productName} (${i}/${data.installmentCount})`
        
        const installmentTransaction = await createTransaction({
          user_id: userId,
          type: 'income',
          amount: installmentAmount,
          date: firstInstallmentDate,
          description: description,
          category: 'Vendas',
          product_id: data.productId,
          is_paid: firstInstallmentIsPaid,
          scheduled_date: firstInstallmentScheduledDate,
          is_installment: true,
          installment_count: data.installmentCount,
          installment_number: i,
          installment_interval: data.installmentInterval || 'monthly',
          installment_group_id: groupId
        })
        
        console.log(`🚀 LOG - executeSellProduct - Parcela ${i}/${data.installmentCount} criada:`)
        console.log(`  - id: ${installmentTransaction.id}`)
        console.log(`  - amount: R$ ${installmentAmount.toFixed(2)}`)
        console.log(`  - is_paid: ${installmentTransaction.is_paid}`)
        console.log(`  - scheduled_date: ${installmentTransaction.scheduled_date}`)
        console.log(`  - description: ${installmentTransaction.description}`)
        
        createdTransactions.push(installmentTransaction)
      }
      
      // Atualizar estoque apenas uma vez (na primeira parcela)
      await updateStock(data.productId, userId, -data.quantity)
      
      const intervalText = data.installmentInterval === 'weekly' ? 'semanal' : 
                          data.installmentInterval === 'quarterly' ? 'trimestral' : 'mensal'
      
      // Montar mensagem de sucesso
      const successMessage = `✅ Venda parcelada registrada com sucesso!\n\n📦 ${data.productName} x${data.quantity}\n💵 Total: R$ ${data.totalAmount.toFixed(2)}\n📦 ${data.installmentCount}x de R$ ${installmentAmount.toFixed(2)} (${intervalText})\n\n✅ Primeira parcela já está em caixa`
      
      return {
        message: successMessage,
        type: 'success',
        data: { 
          transactions: createdTransactions
        }
      }
    }
    
    // Criar transação recorrente se necessário
    if (data.isRecurring && data.recurringInterval) {
      console.log('🚀 LOG - executeSellProduct: Criando RECORRÊNCIA')
      const recurringDate = parseLocalDate(transactionDate)
      const intervalText = data.recurringInterval === 'weekly' ? 'semanal' : 
                          data.recurringInterval === 'quarterly' ? 'trimestral' : 'mensal'
      
      let notes = `Recorrente - ${data.recurringInterval}`
      if (data.recurringEndDate) {
        notes += ` | EndDate: ${data.recurringEndDate}`
      }
      
      const recurringTransaction = await createTransaction({
        user_id: userId,
        type: 'income',
        amount: data.totalAmount,
        date: transactionDate,
        description: data.productName,
        category: 'Vendas',
        product_id: data.productId,
        is_paid: false,
        scheduled_date: transactionDate,
        notes
      })
      
      // Atualizar estoque
      await updateStock(data.productId, userId, -data.quantity)
      
      console.log('🚀 LOG - executeSellProduct - Transação recorrente criada:')
      console.log('  - transaction.is_paid:', recurringTransaction.is_paid)
      console.log('  - transaction.scheduled_date:', recurringTransaction.scheduled_date)
      console.log('  - transaction.notes:', recurringTransaction.notes)
      
      return {
        message: `✅ Transação recorrente criada com sucesso!\n\n📦 ${data.productName} x${data.quantity}\n💵 Valor: R$ ${data.totalAmount.toFixed(2)}\n🔄 Intervalo: ${intervalText}\n\n⏰ Próxima ocorrência: ${formatDateString(transactionDate)}`,
        type: 'success',
        data: { transaction: recurringTransaction }
      }
    }
    
    // Criar transação única com pagamento futuro ou imediato
    console.log('🚀 LOG - executeSellProduct: Criando TRANSAÇÃO SIMPLES')
    
    // Se for agendado, data da transação é hoje, scheduled_date é futuro
    if (data.isScheduled && data.scheduledDate) {
      // Data da transação = hoje, scheduled_date = data futura
      transactionDate = today
      console.log('🚀 LOG - executeSellProduct - Transação agendada detectada')
      console.log('  - transactionDate (hoje):', transactionDate)
      console.log('  - scheduledDate (futuro):', data.scheduledDate)
    } else if (data.date) {
      const parsedDate = parseLocalDate(data.date)
      const todayDate = parseLocalDate(today)
      if (parsedDate <= todayDate) {
        transactionDate = getLocalDateString(parsedDate)
      } else {
        // Se data futura mas não marcado como agendado, usar hoje
        transactionDate = today
      }
    }
    
    const finalIsPaid = data.isScheduled ? false : (data.isPaid ?? true)
    const finalScheduledDate = data.isScheduled && data.scheduledDate ? data.scheduledDate : null
    
    console.log('🚀 LOG - executeSellProduct - Valores para transação simples:')
    console.log('  - transactionDate:', transactionDate)
    console.log('  - finalIsPaid:', finalIsPaid, '(tipo:', typeof finalIsPaid, ')')
    console.log('  - finalScheduledDate:', finalScheduledDate)
    
    const transaction = await createTransaction({
      user_id: userId,
      type: 'income',
      amount: data.totalAmount,
      date: transactionDate,
      description: data.productName,
      category: 'Vendas',
      product_id: data.productId,
      is_paid: finalIsPaid,
      scheduled_date: finalScheduledDate
    })
    
    console.log('🚀 LOG - executeSellProduct - Transação criada:')
    console.log('  - transaction:', JSON.stringify(transaction, null, 2))
    console.log('  - transaction.is_paid:', transaction.is_paid)
    console.log('  - transaction.scheduled_date:', transaction.scheduled_date)
    
    // Atualizar estoque
    await updateStock(data.productId, userId, -data.quantity)
    
    // Mensagem de sucesso
    let successMessage = `✅ Venda registrada com sucesso!\n\n`
    successMessage += `📦 ${data.productName} x${data.quantity}\n`
    successMessage += `💵 Total: R$ ${data.totalAmount.toFixed(2)}\n`
    
    if (data.isScheduled && data.scheduledDate) {
      successMessage += `⏰ Pagamento agendado para: ${formatDateString(data.scheduledDate)}`
    } else {
      successMessage += `💰 Valor adicionado ao caixa`
    }
    
    return {
      message: successMessage,
      type: 'success',
      data: { transaction, product }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao registrar venda: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

/**
 * Handler para busca de produto
 */
export async function handleSearchProduct(
  command: ParsedCommand,
  products: Product[]
): Promise<BotResponse> {
  const { productName } = command.entities
  
  if (!productName) {
    return {
      message: "Qual produto você está procurando?",
      type: 'question',
      suggestions: ['listar produtos']
    }
  }
  
  // Usar busca flexível
  const matches = searchProducts(products, productName)
  
  if (matches.length === 0) {
    return {
      message: `Não encontrei nenhum produto com o nome "${productName}".`,
      type: 'info',
      suggestions: ['listar produtos']
    }
  }
  
  if (matches.length === 1) {
    const product = matches[0]
    return {
      message: `📦 ${product.name}\n💰 Preço: R$ ${product.price.toFixed(2)}\n📊 Estoque: ${product.stock_quantity} unidades${product.description ? `\n📝 ${product.description}` : ''}`,
      type: 'info',
      data: { product }
    }
  }
  
  const list = matches.map(p => 
    `• ${p.name} - R$ ${p.price.toFixed(2)} (Estoque: ${p.stock_quantity})`
  ).join('\n')
  
  return {
    message: `Encontrei ${matches.length} produtos:\n\n${list}`,
    type: 'info',
    data: { productMatches: matches }
  }
}

