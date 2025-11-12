'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bot, Send, Loader2, CheckCircle, AlertCircle, Zap, MessageCircle, X } from 'lucide-react'
import { AICommandResponse, ParsedCommand, AIUsageLimits } from '@/types/ai-chat'
import { useSupabase } from '@/hooks/useSupabase'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'

interface FloatingAIChatProps {
  userId: string
  userProducts?: any[]
  onTransactionCreated?: () => void
}

export function FloatingAIChat({ 
  userId, 
  userProducts = [], 
  onTransactionCreated 
}: FloatingAIChatProps) {
  // LOG: Componente montado
  console.log('🚀 LOG - FloatingAIChat COMPONENTE MONTADO')
  console.log('  - userId:', userId)
  console.log('  - userProducts.length:', userProducts.length)
  
  const [isOpen, setIsOpen] = useState(false)
  const [command, setCommand] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<AICommandResponse | null>(null)
  const [usageInfo, setUsageInfo] = useState<AIUsageLimits | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [transactionData, setTransactionData] = useState<any>(null)
  const [editableAmount, setEditableAmount] = useState<number>(0)
  const { supabase, isLoading: supabaseLoading } = useSupabase()
  
  // LOG: Hook useSupabase inicializado
  console.log('🚀 LOG - useSupabase inicializado:', !!supabase, 'Loading:', supabaseLoading)

  // Carregar informações de uso ao montar o componente
  useEffect(() => {
    console.log('🚀 LOG - useEffect executado')
    console.log('  - supabaseLoading:', supabaseLoading)
    console.log('  - supabase existe:', !!supabase)
    console.log('  - userId:', userId)
    
    if (!supabaseLoading && supabase && userId) {
      console.log('🚀 LOG - Carregando informações de uso...')
      loadUsageInfo()
    } else {
      console.log('🚀 LOG - useEffect: Condições não atendidas, não carregando usageInfo')
    }
  }, [userId, supabase, supabaseLoading])

  const loadUsageInfo = async () => {
    console.log('🚀 LOG - loadUsageInfo chamado')
    if (!supabase || !userId) {
      console.log('🚀 LOG - loadUsageInfo ABORTADO (supabase ou userId faltando)')
      return
    }
    
    try {
      console.log('🚀 LOG - Chamando RPC get_user_ai_limits...')
      const { data, error } = await supabase
        .rpc('get_user_ai_limits', { user_uuid: userId })

      if (error) {
        console.log('🚀 LOG - Erro no RPC:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        console.log('🚀 LOG - UsageInfo carregado:', data[0])
        setUsageInfo(data[0])
      } else {
        console.log('🚀 LOG - Nenhum dado retornado do RPC')
      }
    } catch (err) {
      console.error('🚀 LOG - Erro ao carregar informações de uso:', err)
      console.error('Erro ao carregar informações de uso:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // LOG: Início da função handleSubmit
    console.log('🚀 LOG - handleSubmit INICIADO')
    console.log('  - command:', command)
    console.log('  - isLoading:', isLoading)
    
    if (!command.trim() || isLoading) {
      console.log('🚀 LOG - handleSubmit ABORTADO (comando vazio ou carregando)')
      return
    }

    // Verificar se é um número (seleção de produto)
    const commandNumber = parseInt(command.trim())
    console.log('🚀 LOG - commandNumber extraído:', commandNumber)
    
    // Se há resposta anterior com produtos, verifica se é seleção de produto
    if (!isNaN(commandNumber) && lastResponse && lastResponse.parsedCommand?.productMatches && lastResponse.parsedCommand.productMatches.length > 0) {
      // Processar seleção de produto por número
      const selectedIndex = commandNumber - 1
      if (selectedIndex >= 0 && selectedIndex < lastResponse.parsedCommand.productMatches.length) {
        const selectedProduct = lastResponse.parsedCommand.productMatches[selectedIndex]
        
        // Definir transactionData antes de selecionar produto (incluindo parcelamento e recorrência)
        const newTransactionData = {
          action: lastResponse.parsedCommand.action,
          amount: lastResponse.parsedCommand.amount || selectedProduct.price || 0,
          date: lastResponse.parsedCommand.date || getLocalDateString(),
          category: lastResponse.parsedCommand.category || 'Vendas',
          paymentScheduled: lastResponse.parsedCommand.paymentScheduled || false,
          paymentDate: lastResponse.parsedCommand.paymentDate || null,
          // Parcelamento
          isInstallment: lastResponse.parsedCommand.isInstallment || false,
          installmentCount: lastResponse.parsedCommand.installmentCount || 1,
          installmentInterval: lastResponse.parsedCommand.installmentInterval || 'monthly',
          // Recorrência
          isRecurring: lastResponse.parsedCommand.isRecurring || false,
          recurringInterval: lastResponse.parsedCommand.recurringInterval || 'monthly',
          recurringEndDate: lastResponse.parsedCommand.recurringEndDate || null
        }
        
        // LOG: Verificar transactionData que será definido (seleção por número)
        console.log('🔍 LOG - TransactionData definido (seleção por número):')
        console.log('  - parsedCommand original:', JSON.stringify(lastResponse.parsedCommand, null, 2))
        console.log('  - transactionData completo:', JSON.stringify(newTransactionData, null, 2))
        console.log('  - paymentScheduled:', newTransactionData.paymentScheduled, '(tipo:', typeof newTransactionData.paymentScheduled, ')')
        console.log('  - paymentDate:', newTransactionData.paymentDate)
        console.log('  - isInstallment:', newTransactionData.isInstallment, '(tipo:', typeof newTransactionData.isInstallment, ')')
        console.log('  - installmentCount:', newTransactionData.installmentCount)
        console.log('  - isRecurring:', newTransactionData.isRecurring, '(tipo:', typeof newTransactionData.isRecurring, ')')
        
        setTransactionData(newTransactionData)
        handleProductSelect(selectedProduct)
        setShowConfirmation(true)
        setCommand('')
        setError(null) // Limpar erros anteriores
        return
      } else {
        setError('Número inválido. Digite um número da lista de produtos.')
        setCommand('') // Limpar comando inválido
        return
      }
    }
    
    // Se a resposta anterior era uma despesa sem valor (BOT perguntou o valor)
    // e o comando atual parece ser um valor, trata como resposta ao valor
    if (lastResponse && lastResponse.parsedCommand?.action === 'despesa' && 
        (!lastResponse.parsedCommand.amount || lastResponse.parsedCommand.amount === 0)) {
      console.log('🔍 LOG - Verificando se é resposta de valor para despesa')
      console.log('  - Comando:', command)
      console.log('  - lastResponse.parsedCommand:', lastResponse.parsedCommand)
      
      // Verifica se o comando é apenas um valor numérico (melhorado para aceitar "80,00")
      // Aceita: "80,00", "80.00", "R$ 80,00", "80", etc.
      const valuePattern = /^[\s]*r\$\s*[\d.,]+|^[\d.,]+[\s]*$/i
      const isValueOnly = valuePattern.test(command.trim())
      
      console.log('  - isValueOnly:', isValueOnly)
      
      if (isValueOnly) {
        // Extrai o valor do comando (remove R$, espaços, e converte vírgula para ponto)
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
        console.log('  - cleanValue:', cleanValue)
        console.log('  - parsedValue:', parsedValue)
        
        if (!isNaN(parsedValue) && parsedValue > 0) {
          console.log('✅ LOG - Valor reconhecido! Processando resposta de valor...')
          
          // Cria um novo parsedCommand com o valor preenchido
          const updatedCommand = {
            ...lastResponse.parsedCommand,
            amount: parsedValue
          }
          
          // Atualiza o texto de confirmação
          const updatedConfirmationText = `✅ Perfeito! Registrei sua despesa de **R$ ${parsedValue.toFixed(2)}** na categoria "${updatedCommand.category || 'Despesas'}".\n\n📝 **Descrição:** ${updatedCommand.productName || 'Despesa'}\n📅 **Data:** ${new Date(updatedCommand.date || getLocalDateString()).toLocaleDateString('pt-BR')}${updatedCommand.paymentScheduled && updatedCommand.paymentDate ? `\n\n📅 **Pagamento Agendado:** Esta transação será marcada como pendente até ${new Date(updatedCommand.paymentDate).toLocaleDateString('pt-BR')}.` : '\n\n✅ A transação será registrada e o valor será deduzido do seu caixa.'}`
          
          // Atualiza a resposta com o valor
          setLastResponse({
            ...lastResponse,
            parsedCommand: updatedCommand,
            confirmationText: updatedConfirmationText
          })
          
          // Prepara transactionData para confirmação direta (sem produto)
          const newTransactionData = {
            action: updatedCommand.action,
            amount: parsedValue,
            date: updatedCommand.date || getLocalDateString(),
            category: updatedCommand.category || 'Despesas',
            paymentScheduled: updatedCommand.paymentScheduled || false,
            paymentDate: updatedCommand.paymentDate || null,
            description: updatedCommand.productName || 'Despesa',
            isInstallment: updatedCommand.isInstallment || false,
            installmentCount: updatedCommand.installmentCount || 1,
            installmentInterval: updatedCommand.installmentInterval || 'monthly',
            isRecurring: updatedCommand.isRecurring || false,
            recurringInterval: updatedCommand.recurringInterval || 'monthly',
            recurringEndDate: updatedCommand.recurringEndDate || null
          }
          
          console.log('  - newTransactionData:', newTransactionData)
          
          setTransactionData(newTransactionData)
          setEditableAmount(parsedValue)
          setShowConfirmation(true)
          setCommand('')
          setError(null)
          setIsLoading(false)
          return
        } else {
          console.log('❌ LOG - Valor não pôde ser parseado:', cleanValue)
        }
      } else {
        console.log('❌ LOG - Comando não parece ser apenas um valor')
      }
    }

    setIsLoading(true)
    setError(null)
    setLastResponse(null)

    // LOG: Antes de fazer requisição
    console.log('🚀 LOG - Antes de fazer requisição à API')
    console.log('  - command:', command)
    console.log('  - userId:', userId)
    console.log('  - userProducts.length:', userProducts.length)

    try {
      // Obter o token de sessão do Supabase
      console.log('🚀 LOG - Obtendo sessão do Supabase...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🚀 LOG - Sessão obtida:', !!session, 'Token existe:', !!session?.access_token)
      
      // DEBUG: Verificar se a sessão existe
      console.log('🔍 DEBUG - Sessão completa:', session)
      console.log('🔍 DEBUG - Token de acesso:', session?.access_token)
      console.log('🔍 DEBUG - Token válido?', !!session?.access_token)
      
      if (!session || !session.access_token) {
        setError('Usuário não autenticado. Faça login novamente.')
        setIsLoading(false)
        return
      }

      // LOG: Antes de fazer fetch
      console.log('🚀 LOG - Fazendo requisição fetch...')
      console.log('  - URL:', '/api/ai/financial')
      console.log('  - command sendo enviado:', command.trim())
      console.log('  - userId sendo enviado:', userId)

      const response = await fetch('/api/ai/financial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          command: command.trim(),
          userId,
          userProducts
        })
      })

      console.log('🚀 LOG - Response recebido:')
      console.log('  - status:', response.status)
      console.log('  - ok:', response.ok)

      const data: AICommandResponse = await response.json()
      
      console.log('🚀 LOG - Data parseada da resposta:')
      console.log('  - success:', data.success)
      console.log('  - parsedCommand:', data.parsedCommand)

      if (!response.ok) {
        if (response.status === 429) {
          setError('Limite de comandos de IA atingido. Tente novamente amanhã ou faça upgrade para premium.')
        } else if (response.status === 401) {
          setError('Usuário não autenticado. Faça login novamente.')
        } else {
          setError(data.error || 'Erro ao processar comando')
        }
        return
      }

      setLastResponse(data)
      setUsageInfo(data.usageInfo || null)
      
      // LOG: Verificar dados recebidos da API
      console.log('🔍 LOG - Dados recebidos da API:')
      console.log('  - parsedCommand:', JSON.stringify(data.parsedCommand, null, 2))
      console.log('  - paymentScheduled:', data.parsedCommand?.paymentScheduled)
      console.log('  - paymentDate:', data.parsedCommand?.paymentDate)
      console.log('  - isInstallment:', data.parsedCommand?.isInstallment)
      console.log('  - installmentCount:', data.parsedCommand?.installmentCount)
      console.log('  - installmentInterval:', data.parsedCommand?.installmentInterval)
      console.log('  - isRecurring:', data.parsedCommand?.isRecurring)
      console.log('  - recurringInterval:', data.parsedCommand?.recurringInterval)
      console.log('  - recurringEndDate:', data.parsedCommand?.recurringEndDate)
      
      // Se há apenas 1 produto encontrado, selecionar automaticamente
      if (data.parsedCommand?.productMatches && data.parsedCommand.productMatches.length === 1) {
        const selectedProduct = data.parsedCommand.productMatches[0]
        
        // Definir transactionData antes de selecionar produto (incluindo parcelamento e recorrência)
        const newTransactionData = {
          action: data.parsedCommand.action,
          amount: data.parsedCommand.amount || selectedProduct.price || 0,
          date: data.parsedCommand.date || getLocalDateString(),
          category: data.parsedCommand.category || 'Vendas',
          paymentScheduled: data.parsedCommand.paymentScheduled || false,
          paymentDate: data.parsedCommand.paymentDate || null,
          // Parcelamento
          isInstallment: data.parsedCommand.isInstallment || false,
          installmentCount: data.parsedCommand.installmentCount || 1,
          installmentInterval: data.parsedCommand.installmentInterval || 'monthly',
          // Recorrência
          isRecurring: data.parsedCommand.isRecurring || false,
          recurringInterval: data.parsedCommand.recurringInterval || 'monthly',
          recurringEndDate: data.parsedCommand.recurringEndDate || null
        }
        
        // LOG: Verificar transactionData que será definido
        console.log('🔍 LOG - TransactionData definido (auto-seleção):')
        console.log('  - transactionData completo:', JSON.stringify(newTransactionData, null, 2))
        console.log('  - paymentScheduled:', newTransactionData.paymentScheduled, '(tipo:', typeof newTransactionData.paymentScheduled, ')')
        console.log('  - paymentDate:', newTransactionData.paymentDate)
        console.log('  - isInstallment:', newTransactionData.isInstallment, '(tipo:', typeof newTransactionData.isInstallment, ')')
        console.log('  - installmentCount:', newTransactionData.installmentCount)
        console.log('  - isRecurring:', newTransactionData.isRecurring, '(tipo:', typeof newTransactionData.isRecurring, ')')
        
        setTransactionData(newTransactionData)
        handleProductSelect(selectedProduct)
        setShowConfirmation(true)
      }
      
      // Limpar comando após sucesso
      setCommand('')
      
      // Recarregar informações de uso
      await loadUsageInfo()

    } catch (err) {
      console.error('Erro na requisição:', err)
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'receita': return 'bg-green-100 text-green-800'
      case 'despesa': return 'bg-red-100 text-red-800'
      case 'sell': return 'bg-green-100 text-green-800'
      case 'buy': return 'bg-blue-100 text-blue-800'
      case 'expense': return 'bg-red-100 text-red-800'
      case 'income': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'receita': return 'Receita'
      case 'despesa': return 'Despesa'
      case 'sell': return 'Venda'
      case 'buy': return 'Compra'
      case 'expense': return 'Despesa'
      case 'income': return 'Receita'
      default: return 'Desconhecido'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product)
    setEditableAmount(product.price || 0)
    
    // Definir transactionData com os dados do parsedCommand (incluindo parcelamento e recorrência)
    if (lastResponse?.parsedCommand) {
      const newTransactionData = {
        action: lastResponse.parsedCommand.action,
        amount: lastResponse.parsedCommand.amount || product.price || 0,
        date: lastResponse.parsedCommand.date || getLocalDateString(),
        category: lastResponse.parsedCommand.category || 'Vendas',
        paymentScheduled: lastResponse.parsedCommand.paymentScheduled || false,
        paymentDate: lastResponse.parsedCommand.paymentDate || null,
        // Parcelamento
        isInstallment: lastResponse.parsedCommand.isInstallment || false,
        installmentCount: lastResponse.parsedCommand.installmentCount || 1,
        installmentInterval: lastResponse.parsedCommand.installmentInterval || 'monthly',
        // Recorrência
        isRecurring: lastResponse.parsedCommand.isRecurring || false,
        recurringInterval: lastResponse.parsedCommand.recurringInterval || 'monthly',
        recurringEndDate: lastResponse.parsedCommand.recurringEndDate || null
      }
      
      // LOG: Verificar transactionData que será definido (handleProductSelect)
      console.log('🔍 LOG - TransactionData definido (handleProductSelect):')
      console.log('  - parsedCommand original:', JSON.stringify(lastResponse.parsedCommand, null, 2))
      console.log('  - transactionData completo:', JSON.stringify(newTransactionData, null, 2))
      console.log('  - paymentScheduled:', newTransactionData.paymentScheduled, '(tipo:', typeof newTransactionData.paymentScheduled, ')')
      console.log('  - paymentDate:', newTransactionData.paymentDate)
      console.log('  - isInstallment:', newTransactionData.isInstallment, '(tipo:', typeof newTransactionData.isInstallment, ')')
      console.log('  - installmentCount:', newTransactionData.installmentCount)
      console.log('  - isRecurring:', newTransactionData.isRecurring, '(tipo:', typeof newTransactionData.isRecurring, ')')
      
      setTransactionData(newTransactionData)
    }
  }

  const handleConfirmTransaction = async () => {
    console.log('🔵 FloatingAIChat: handleConfirmTransaction chamado')
    console.log('🔵 FloatingAIChat: selectedProduct:', selectedProduct)
    console.log('🔵 FloatingAIChat: transactionData:', transactionData)
    console.log('🔵 FloatingAIChat: lastResponse:', lastResponse)
    console.log('🔵 FloatingAIChat: supabase:', !!supabase)
    
    if (!transactionData || !supabase) {
      console.log('🔴 FloatingAIChat: Dados faltando para confirmação')
      return
    }
    
    // Para despesas sem produtos, não precisa de selectedProduct
    if (transactionData.action === 'receita' && !selectedProduct) {
      console.log('🔴 FloatingAIChat: Produto necessário para receita')
      return
    }

    try {
      setIsLoading(true)
      console.log('🔵 FloatingAIChat: Iniciando criação da transação...')
      
      // LOG: Verificar dados antes de processar
      console.log('🔍 LOG - Dados antes de processar transação:')
      console.log('  - lastResponse?.parsedCommand:', JSON.stringify(lastResponse?.parsedCommand, null, 2))
      console.log('  - transactionData:', JSON.stringify(transactionData, null, 2))
      console.log('  - transactionData.paymentScheduled:', transactionData.paymentScheduled, '(tipo:', typeof transactionData.paymentScheduled, ')')
      console.log('  - transactionData.isInstallment:', transactionData.isInstallment, '(tipo:', typeof transactionData.isInstallment, ')')
      console.log('  - transactionData.isRecurring:', transactionData.isRecurring, '(tipo:', typeof transactionData.isRecurring, ')')
      
      // Obter informações do parsedCommand (pode ter dados de parcelamento/recorrência)
      const parsedCommand = lastResponse?.parsedCommand
      const isInstallment = parsedCommand?.isInstallment || transactionData.isInstallment || false
      const installmentCount = parsedCommand?.installmentCount || transactionData.installmentCount || 1
      const installmentInterval = parsedCommand?.installmentInterval || transactionData.installmentInterval || 'monthly'
      const isRecurring = parsedCommand?.isRecurring || transactionData.isRecurring || false
      const recurringInterval = parsedCommand?.recurringInterval || transactionData.recurringInterval || 'monthly'
      const recurringEndDate = parsedCommand?.recurringEndDate || transactionData.recurringEndDate || null
      const isScheduled = transactionData.paymentScheduled || false
      const scheduledDate = transactionData.paymentDate || null
      
      // LOG: Valores finais extraídos
      console.log('🔍 LOG - Valores finais extraídos:')
      console.log('  - isScheduled:', isScheduled, '(tipo:', typeof isScheduled, ')')
      console.log('  - scheduledDate:', scheduledDate)
      console.log('  - isInstallment:', isInstallment, '(tipo:', typeof isInstallment, ')')
      console.log('  - installmentCount:', installmentCount)
      console.log('  - installmentInterval:', installmentInterval)
      console.log('  - isRecurring:', isRecurring, '(tipo:', typeof isRecurring, ')')
      console.log('  - recurringInterval:', recurringInterval)
      console.log('  - recurringEndDate:', recurringEndDate)
      
      const transactionAmount = editableAmount || selectedProduct.price || transactionData.amount || 0
      const transactionDate = transactionData.date || getLocalDateString()
      const baseDate = parseLocalDate(transactionDate)
      
      // Função auxiliar para converter Date para string local
      const getLocalDateStringFromDate = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // LOG: Verificar condições de decisão
      console.log('🔍 LOG - Condições de decisão:')
      console.log('  - isInstallment:', isInstallment, '&& installmentCount:', installmentCount, '> 1?', isInstallment && installmentCount > 1)
      console.log('  - isRecurring:', isRecurring, '&& recurringInterval:', recurringInterval, '?', isRecurring && recurringInterval)
      console.log('  - isScheduled:', isScheduled, '?', isScheduled)
      console.log('  - DECISÃO: Parcelamento?', isInstallment && installmentCount > 1)
      console.log('  - DECISÃO: Recorrência?', isRecurring && recurringInterval)
      console.log('  - DECISÃO: Simples?', !(isInstallment && installmentCount > 1) && !(isRecurring && recurringInterval))
      
      // PARCELAMENTO: Criar múltiplas transações
      if (isInstallment && installmentCount > 1) {
        console.log('🔵 FloatingAIChat: Criando transação PARCELADA')
        console.log('🔍 LOG - Iniciando criação de parcelas:')
        console.log('  - Valor total:', transactionAmount)
        console.log('  - Número de parcelas:', installmentCount)
        console.log('  - Intervalo:', installmentInterval)
        const installmentAmount = transactionAmount / installmentCount
        const intervalMonths = installmentInterval === 'weekly' ? 0 : 
                              installmentInterval === 'monthly' ? 1 : 3
        
        const createdTransactions = []
        
        for (let i = 1; i <= installmentCount; i++) {
          const installmentDate = new Date(baseDate)
          
          if (intervalMonths > 0) {
            installmentDate.setMonth(baseDate.getMonth() + (intervalMonths * (i - 1)))
          } else {
            installmentDate.setDate(baseDate.getDate() + (7 * (i - 1)))
          }
          
          const isFirstInstallment = i === 1
          
          const installmentRecord = {
            user_id: userId,
            type: transactionData.action === 'receita' ? 'income' : 'expense',
            amount: installmentAmount,
            description: `${transactionData.action === 'receita' ? 'Venda' : 'Compra'} - ${selectedProduct.name} (${i}/${installmentCount})`,
            category: transactionData.category || 'Vendas',
            date: getLocalDateStringFromDate(installmentDate),
            is_paid: isFirstInstallment, // Primeira parcela paga, demais pendentes
            scheduled_date: isFirstInstallment ? null : getLocalDateStringFromDate(installmentDate),
            is_installment: true,
            installment_count: installmentCount,
            installment_number: i,
            installment_interval: installmentInterval
          }
          
          const { data: installmentData, error: installmentError } = await supabase
            .from('financial_transactions')
            .insert([installmentRecord])
            .select()
            .single()
          
          if (installmentError) {
            console.error('🔴 FloatingAIChat: Erro ao criar parcela:', installmentError)
            throw installmentError
          }
          
          createdTransactions.push(installmentData)
          console.log(`✅ FloatingAIChat: Parcela ${i}/${installmentCount} criada`)
        }
        
        // Atualizar estoque apenas uma vez
        if (transactionData.action === 'receita') {
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              stock_quantity: selectedProduct.stock_quantity - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedProduct.id)
          
          if (stockError) {
            console.error('🔴 FloatingAIChat: Erro ao atualizar estoque:', stockError)
          }
        }
        
        console.log(`✅ FloatingAIChat: ${installmentCount} parcelas criadas com sucesso!`)
      }
      // RECORRÊNCIA: Criar transação recorrente
      else if (isRecurring && recurringInterval) {
        console.log('🔵 FloatingAIChat: Criando transação RECORRENTE')
        
        let notes = `Recorrente - ${recurringInterval}`
        if (recurringEndDate) {
          notes += ` | EndDate: ${recurringEndDate}`
        }
        
        const recurringRecord = {
          user_id: userId,
          type: transactionData.action === 'receita' ? 'income' : 'expense',
          amount: transactionAmount,
          description: `${transactionData.action === 'receita' ? 'Venda' : 'Compra'} - ${selectedProduct.name}`,
          category: transactionData.category || 'Vendas',
          date: transactionDate,
          is_paid: false,
          scheduled_date: transactionDate,
          notes
        }
        
        const { data: recurringData, error: recurringError } = await supabase
          .from('financial_transactions')
          .insert([recurringRecord])
          .select()
          .single()
        
        if (recurringError) {
          console.error('🔴 FloatingAIChat: Erro ao criar transação recorrente:', recurringError)
          throw recurringError
        }
        
        // Atualizar estoque
        if (transactionData.action === 'receita') {
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              stock_quantity: selectedProduct.stock_quantity - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedProduct.id)
          
          if (stockError) {
            console.error('🔴 FloatingAIChat: Erro ao atualizar estoque:', stockError)
          }
        }
        
        console.log('✅ FloatingAIChat: Transação recorrente criada com sucesso!')
      }
      // TRANSAÇÃO SIMPLES: Agendada ou imediata
      else {
        console.log('🔵 FloatingAIChat: Criando transação SIMPLES')
        console.log('🔍 LOG - Criando transação simples:')
        console.log('  - isScheduled:', isScheduled)
        console.log('  - scheduledDate:', scheduledDate)
        console.log('  - is_paid será:', !isScheduled)
        console.log('  - scheduled_date será:', isScheduled ? scheduledDate : null)
        
        // Descrição da transação
        let transactionDescription = ''
        if (transactionData.action === 'receita' && selectedProduct) {
          transactionDescription = `Venda - ${selectedProduct.name}`
        } else if (transactionData.action === 'despesa') {
          transactionDescription = transactionData.description || 'Despesa'
        } else {
          transactionDescription = `${transactionData.action === 'receita' ? 'Venda' : 'Despesa'}`
        }
      
      const transactionRecord: any = {
        user_id: userId,
        type: transactionData.action === 'receita' ? 'income' : 'expense',
        amount: transactionAmount,
        description: transactionDescription,
        category: transactionData.category || (transactionData.action === 'receita' ? 'Vendas' : 'Despesas'),
          date: transactionDate,
        is_paid: !isScheduled, // Se for agendado, is_paid = false
          scheduled_date: isScheduled ? scheduledDate : null,
          installment_number: 1
      }

      console.log('🔵 FloatingAIChat: Criando transação:', transactionRecord)
        console.log('🔍 LOG - TransactionRecord completo:', JSON.stringify(transactionRecord, null, 2))
      console.log('🔵 FloatingAIChat: É agendado?', isScheduled, 'Data:', scheduledDate)
        console.log('🔍 LOG - is_paid no record:', transactionRecord.is_paid, '(tipo:', typeof transactionRecord.is_paid, ')')
        console.log('🔍 LOG - scheduled_date no record:', transactionRecord.scheduled_date)

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transactionRecord])
        .select()
          .single()

      if (error) {
        console.error('🔴 FloatingAIChat: Erro ao criar transação:', error)
        setError('Erro ao salvar transação. Tente novamente.')
        return
      }

      console.log('✅ FloatingAIChat: Transação criada com sucesso:', data)

      // Atualizar estoque do produto se for receita E houver produto selecionado
      if (transactionData.action === 'receita' && selectedProduct) {
        console.log('🔵 FloatingAIChat: Atualizando estoque...')
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock_quantity: selectedProduct.stock_quantity - 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedProduct.id)

        if (stockError) {
          console.error('🔴 FloatingAIChat: Erro ao atualizar estoque:', stockError)
        } else {
          console.log('✅ FloatingAIChat: Estoque atualizado com sucesso')
          }
        }
      }

      // Limpar estados e fechar confirmação
      setShowConfirmation(false)
      setSelectedProduct(null)
      setTransactionData(null)
      setEditableAmount(0)
      setCommand('')
      setLastResponse(null)
      
      console.log('✅ FloatingAIChat: Estados limpos, chamando callback...')
      
      // Chamar callback para atualizar dados
      if (onTransactionCreated) {
        onTransactionCreated()
        console.log('✅ FloatingAIChat: Callback executado')
      }

    } catch (err) {
      console.error('🔴 FloatingAIChat: Erro ao confirmar transação:', err)
      setError('Erro ao salvar transação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelTransaction = () => {
    setShowConfirmation(false)
    setSelectedProduct(null)
    setTransactionData(null)
    setEditableAmount(0)
    setCommand('')
  }

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Bot className="w-6 h-6" />
        </Button>
        </div>
      )}

      {/* Chat expandido */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-300 dark:from-blue-700 dark:to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">Assistente IA</h3>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 dark:hover:bg-white/30"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Conteúdo */}
          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {/* Informações de uso */}
            {usageInfo && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">
                    {usageInfo.commands_used}/{usageInfo.commands_limit} comandos
                  </span>
                  <Badge variant={usageInfo.can_use_ai ? "default" : "destructive"} className="text-xs">
                    {usageInfo.subscription_plan === 'premium' ? 'Premium' : 'Gratuito'}
                  </Badge>
                </div>
                {!usageInfo.can_use_ai && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Limite atingido
                  </p>
                )}
              </div>
            )}


            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Resposta da IA */}
            {lastResponse && lastResponse.parsedCommand && !showConfirmation && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Comando Processado</span>
                </div>

                {/* Texto de confirmação nativo */}
                {lastResponse.confirmationText && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {lastResponse.confirmationText.split('\n').map((line, index) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <div key={index} className="font-semibold text-gray-800 dark:text-gray-200 mt-2">{line.replace(/\*\*/g, '')}</div>
                        }
                        if (line.match(/^\d+-/)) {
                          return <div key={index} className="text-blue-600 dark:text-blue-400 font-medium">{line}</div>
                        }
                        return <div key={index} className="text-gray-900 dark:text-gray-100">{line}</div>
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge className={getActionColor(lastResponse.parsedCommand.action)}>
                    {getActionLabel(lastResponse.parsedCommand.action)}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {Math.round((lastResponse.parsedCommand.confidence || 0) * 100)}%
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {lastResponse.parsedCommand.productName && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Produto:</span>
                      <span className="ml-1">{lastResponse.parsedCommand.productName}</span>
                    </div>
                  )}

                  {lastResponse.parsedCommand.amount && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Valor:</span>
                      <span className="ml-1 font-semibold">{formatCurrency(lastResponse.parsedCommand.amount)}</span>
                    </div>
                  )}

                  {lastResponse.parsedCommand.date && (
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Data:</span>
                      <span className="ml-1">{parseLocalDate(lastResponse.parsedCommand.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}

                  {lastResponse.parsedCommand.paymentScheduled && lastResponse.parsedCommand.paymentDate && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">📅 Pagamento Agendado:</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {parseLocalDate(lastResponse.parsedCommand.paymentDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                        Esta transação ficará nas pendentes até a data do pagamento
                      </p>
                    </div>
                  )}
                </div>

                {/* Botão de confirmação se há produtos encontrados */}
                {lastResponse.parsedCommand.productMatches && lastResponse.parsedCommand.productMatches.length > 0 && (
                  <div className="space-y-2">
                    {lastResponse.parsedCommand.productMatches.length > 1 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        Digite o número do produto acima para selecionar
                      </p>
                    )}
                    {selectedProduct && (
                      <Button 
                        onClick={() => setShowConfirmation(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400 text-white"
                        size="sm"
                        disabled={isLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar Transação
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Botão de confirmação para despesas sem produtos (quando tem valor) */}
                {lastResponse.parsedCommand && 
                 lastResponse.parsedCommand.action === 'despesa' && 
                 (!lastResponse.parsedCommand.productMatches || lastResponse.parsedCommand.productMatches.length === 0) &&
                 lastResponse.parsedCommand.amount && lastResponse.parsedCommand.amount > 0 && (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        if (!lastResponse.parsedCommand) return
                        const newTransactionData = {
                          action: lastResponse.parsedCommand.action,
                          amount: lastResponse.parsedCommand.amount || 0,
                          date: lastResponse.parsedCommand.date || getLocalDateString(),
                          category: lastResponse.parsedCommand.category || 'Despesas',
                          paymentScheduled: lastResponse.parsedCommand.paymentScheduled || false,
                          paymentDate: lastResponse.parsedCommand.paymentDate || null,
                          description: lastResponse.parsedCommand.productName || 'Despesa',
                          isInstallment: lastResponse.parsedCommand.isInstallment || false,
                          installmentCount: lastResponse.parsedCommand.installmentCount || 1,
                          installmentInterval: lastResponse.parsedCommand.installmentInterval || 'monthly',
                          isRecurring: lastResponse.parsedCommand.isRecurring || false,
                          recurringInterval: lastResponse.parsedCommand.recurringInterval || 'monthly',
                          recurringEndDate: lastResponse.parsedCommand.recurringEndDate || null
                        }
                        setTransactionData(newTransactionData)
                        setEditableAmount(lastResponse.parsedCommand.amount || 0)
                        setShowConfirmation(true)
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-green-300 hover:from-green-600 hover:to-green-400 text-white"
                      size="sm"
                      disabled={isLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Despesa
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Confirmação de Transação */}
            {showConfirmation && transactionData && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Confirmar Transação</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Tipo:</span>
                      <span className="ml-1">{getActionLabel(transactionData.action)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Categoria:</span>
                      <span className="ml-1">{transactionData.category}</span>
                    </div>
                  </div>

                  {selectedProduct && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                      <p className="font-medium text-gray-800 dark:text-gray-200">Produto Selecionado:</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProduct.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProduct.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(selectedProduct.price)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Estoque: {selectedProduct.stock_quantity}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!selectedProduct && transactionData.description && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                      <p className="font-medium text-gray-800 dark:text-gray-200">Descrição:</p>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">{transactionData.description}</p>
                    </div>
                  )}

                    <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Data:</span>
                        <span className="ml-1 text-gray-900 dark:text-gray-100">{parseLocalDate(transactionData.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Valor da Transação:</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">R$</span>
                        <input
                          type="number"
                          value={editableAmount}
                          onChange={(e) => setEditableAmount(Number(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0,00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      {selectedProduct && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Preço original: {formatCurrency(selectedProduct.price)}
                        </p>
                      )}
                    </div>
                  </div>

                  {transactionData.paymentScheduled && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-2">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        💳 Pagamento agendado para: {parseLocalDate(transactionData.paymentDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {transactionData.isInstallment && transactionData.installmentCount > 1 && (
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-2">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        📦 Parcelado em {transactionData.installmentCount}x de {formatCurrency((transactionData.amount || 0) / transactionData.installmentCount)}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        {transactionData.installmentInterval === 'weekly' ? 'Semanal' : 
                         transactionData.installmentInterval === 'quarterly' ? 'Trimestral' : 'Mensal'}
                      </p>
                    </div>
                  )}

                  {transactionData.isRecurring && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-2">
                      <p className="text-sm text-indigo-800 dark:text-indigo-200">
                        🔄 Transação recorrente: {transactionData.recurringInterval === 'weekly' ? 'Semanal' : 
                                                   transactionData.recurringInterval === 'quarterly' ? 'Trimestral' : 'Mensal'}
                      </p>
                      {transactionData.recurringEndDate && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                          Até: {parseLocalDate(transactionData.recurringEndDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleConfirmTransaction}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-300 hover:from-green-600 hover:to-green-400 text-white"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleCancelTransaction}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Campo de entrada sempre visível */}
            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={(lastResponse?.parsedCommand?.productMatches?.length ?? 0) > 1 ? "Digite o número do produto" : "Ex: vendi um colar por 150 reais"}
                disabled={isLoading || !!(usageInfo && !usageInfo.can_use_ai)}
                className="w-full text-sm"
              />
              
              <Button 
                type="submit" 
                disabled={!command.trim() || isLoading || !!(usageInfo && !usageInfo.can_use_ai)}
                className="w-full"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
