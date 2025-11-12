'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput, ChatInputRef } from './ChatInput'
import { CommandSuggestions } from './CommandSuggestions'
import { processCommand, executeConfirmedAction } from '@/lib/chat-bot'
import { ChatMessage as ChatMessageType, ConfirmationData } from '@/lib/chat-bot/types'
import { clearConversationContext, setConversationContext, getConversationContext, isAffirmativeResponse, isNegativeResponse } from '@/lib/chat-bot/context'
import { isNumericSelection, extractSelectionIndex, textToNumber } from '@/lib/chat-bot/number-selection'
import { analyzeConversationContext, processWithContext } from '@/lib/chat-bot/intelligent-context'
import type { Product } from '@/types/product'
import { Loader2 } from 'lucide-react'
import { getLocalDateString } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ChatBotProps {
  userId: string
  products?: Product[]
  onTransactionCreated?: () => void
}

// Gerador de IDs únicos para mensagens
let messageIdCounter = 0
function generateMessageId(): string {
  return `${Date.now()}-${++messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`
}

export function ChatBot({ userId, products = [], onTransactionCreated }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationData | null>(null)
  const [pendingProductMatches, setPendingProductMatches] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<ChatInputRef>(null)
  
  useEffect(() => {
    // Mensagem de boas-vindas
    setMessages([{
      id: 'welcome',
      role: 'bot',
      content: '👋 Olá! Como posso ajudar?\n\nVocê pode:\n• Registrar vendas\n• Registrar despesas\n• Consultar estoque\n• Listar produtos\n\nDigite "ajuda" para ver todos os comandos.',
      timestamp: new Date(),
      type: 'info'
    }])
  }, [])
  
  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSendMessage = async (content: string) => {
    // Verificar se é confirmação (usando função melhorada que tolera erros de digitação)
    if (pendingConfirmation) {
      // Usar função melhorada que remove caracteres especiais e tolera erros
      if (isAffirmativeResponse(content)) {
        await handleConfirmation(true)
        return
      } else if (isNegativeResponse(content)) {
        await handleConfirmation(false)
        return
      }
    }
    
    // Verificar se é resposta sobre taxa
    const context = getConversationContext()
    if (context?.type === 'fee_question') {
      await handleFeeResponse(content, context)
      return
    }
    
    // Verificar se é valor da taxa
    if (context?.type === 'fee_amount') {
      console.log('🚀 LOG - handleSendMessage - Contexto fee_amount encontrado:')
      console.log('  - context:', context)
      console.log('  - context.pendingTransaction:', context.pendingTransaction)
      await handleFeeAmount(content, context)
      return
    }
    
    // ANÁLISE INTELIGENTE DE CONTEXTO (ANTES DE PROCESSAR COMANDO)
    const contextAnalysis = analyzeConversationContext(messages, pendingProductMatches, pendingConfirmation)
    
    // Processar com contexto robusto
    const contextResult = processWithContext(content, contextAnalysis)
    
    if (contextResult.isNumericSelection) {
      if (contextResult.isValid && contextResult.selectedIndex !== null) {
        // Adicionar mensagem do usuário antes de processar seleção
        const userMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'user',
          content,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        
        // Atualizar matches antes de processar
        setPendingProductMatches(contextAnalysis.productMatches)
        
        // Processar seleção
        await handleProductSelection(contextResult.selectedIndex)
        return
      } else {
        // Número inválido - manter contexto
        const userMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'user',
          content,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        
        const errorMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'bot',
          content: `❌ Número inválido. Digite um número entre 1 e ${contextAnalysis.maxNumber || 0}.`,
          timestamp: new Date(),
          type: 'error',
          data: { productMatches: contextAnalysis.productMatches }
        }
        setMessages(prev => [...prev, errorMessage])
        setPendingProductMatches(contextAnalysis.productMatches)
        // Focar o input após erro
        setTimeout(() => {
          chatInputRef.current?.focus()
        }, 100)
        return
      }
    }
    
    // Adicionar mensagem do usuário
    const userMessage: ChatMessageType = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    // Processar comando
    setIsLoading(true)
    try {
      // Verificar contexto antes de processar
      const contextBefore = getConversationContext()
      console.log('🔍 LOG - ChatBot: Contexto antes de processCommand:', contextBefore)
      
      const response = await processCommand(content, userId, products)
      
      // Verificar contexto depois de processar
      const contextAfter = getConversationContext()
      console.log('🔍 LOG - ChatBot: Contexto depois de processCommand:', contextAfter)
      console.log('🔍 LOG - ChatBot: Response:', {
        message: response.message,
        type: response.type,
        requiresInput: response.requiresInput
      })
      
      const botMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
        type: response.type === 'success' ? 'success' : response.type === 'error' ? 'error' : 'info',
        data: response.data
      }
      
      setMessages(prev => [...prev, botMessage])
      
      if (response.requiresConfirmation && response.confirmationData) {
        setPendingConfirmation(response.confirmationData)
      } else {
        setPendingConfirmation(null)
      }
      
      // Focar o input após receber resposta
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
      
      // IMPORTANTE: Sempre atualizar productMatches se presente na resposta
      if (response.data?.productMatches && Array.isArray(response.data.productMatches)) {
        setPendingProductMatches(response.data.productMatches)
        // Guardar no contexto global também
        if (response.data.productMatches.length > 0) {
          setConversationContext({
            type: 'select_product',
            matches: response.data.productMatches,
            question: response.message,
            timestamp: Date.now()
          })
        }
      } else if (!response.requiresConfirmation && !response.requiresInput) {
        // Limpar apenas se não há confirmação pendente E não há input pendente (pergunta de valor)
        // Se requiresInput é true, significa que o BOT está esperando uma resposta (ex: valor)
        // e o contexto já foi salvo pelo processCommand, então NÃO devemos limpar
        setPendingProductMatches([])
        clearConversationContext()
      }
      
      // Callback se transação foi criada
      if (response.type === 'success' && response.data?.transaction) {
        onTransactionCreated?.()
        // Limpar contexto após sucesso
        clearConversationContext()
        setPendingProductMatches([])
      }
      
      // Disparar evento se produto foi atualizado (reposição direta)
      if (response.type === 'success' && response.data?.product) {
        window.dispatchEvent(new CustomEvent('product-updated', {
          detail: { product: response.data.product }
        }))
      }
    } catch (error: any) {
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: `❌ Erro: ${error.message || 'Erro desconhecido'}`,
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Focar o input após erro
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleConfirmation = async (confirmed: boolean) => {
    if (!pendingConfirmation) return
    
    if (!confirmed) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'bot',
        content: 'Operação cancelada.',
        timestamp: new Date(),
        type: 'info'
      }])
      setPendingConfirmation(null)
      setPendingProductMatches([])
      // Focar o input após cancelamento
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
      return
    }
    
    // Verificar se é venda parcelada ANTES de executar
    // Se for venda parcelada, perguntar sobre taxa primeiro
    if (pendingConfirmation.action === 'sell_product' && 
        pendingConfirmation.isInstallment && 
        pendingConfirmation.installmentCount && 
        pendingConfirmation.installmentCount > 1) {
      
      // NÃO executar ainda - apenas perguntar sobre taxa
      const feeQuestion: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: 'A venda tem alguma taxa relacionada? (ex: taxa da maquininha)',
        timestamp: new Date(),
        type: 'question',
        data: { 
          requiresFeeInput: true
        }
      }
      setMessages(prev => [...prev, feeQuestion])
      
      // Guardar contexto com dados da transação pendente
      setConversationContext({
        type: 'fee_question',
        pendingTransaction: pendingConfirmation,
        timestamp: Date.now()
      })
      
      setIsLoading(false)
      setPendingConfirmation(null)
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
      return
    }
    
    // Executar ação confirmada (apenas se não for venda parcelada)
    setIsLoading(true)
    try {
      const response = await executeConfirmedAction(pendingConfirmation, userId, products)
      
      const botMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
        type: response.type === 'success' ? 'success' : response.type === 'error' ? 'error' : 'info',
        data: response.data
      }
      setMessages(prev => [...prev, botMessage])
      
      if (response.data?.transaction || response.data?.transactions) {
        onTransactionCreated?.()
      }
      clearConversationContext()
      
      // Focar o input após confirmação
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    } catch (error: any) {
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: `❌ Erro ao executar ação: ${error.message || 'Erro desconhecido'}`,
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
      clearConversationContext()
    } finally {
      setIsLoading(false)
      setPendingConfirmation(null)
      setPendingProductMatches([])
      // Focar o input após processar
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    }
  }
  
  const handleFeeResponse = async (content: string, context: any) => {
    // Usar funções melhoradas que toleram erros de digitação
    const hasFee = isAffirmativeResponse(content) || content.toLowerCase().includes('taxa') || content.toLowerCase().includes('tem')
    const noFee = isNegativeResponse(content) || content.toLowerCase().includes('não tem') || content.toLowerCase().includes('nao tem') || content.toLowerCase().includes('sem taxa')
    
    // Adicionar mensagem do usuário
    const userMessage: ChatMessageType = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    if (hasFee) {
      // Perguntar o valor da taxa
      const feeAmountQuestion: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: 'Qual a porcentagem da taxa? (ex: 2.5 ou 2,5 ou 2.5%)',
        timestamp: new Date(),
        type: 'question',
        data: { requiresFeeAmount: true }
      }
      setMessages(prev => [...prev, feeAmountQuestion])
      
      // Atualizar contexto para esperar valor da taxa (mantendo pendingTransaction)
      console.log('🚀 LOG - handleFeeResponse - Atualizando contexto para fee_amount:')
      console.log('  - context atual:', context)
      console.log('  - context.pendingTransaction:', context.pendingTransaction)
      
      if (!context.pendingTransaction) {
        const errorMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'bot',
          content: '❌ Erro: Dados da transação não encontrados. Por favor, tente novamente.',
          timestamp: new Date(),
          type: 'error'
        }
        setMessages(prev => [...prev, errorMessage])
        clearConversationContext()
        setTimeout(() => {
          chatInputRef.current?.focus()
        }, 100)
        return
      }
      
      // Marcar que é venda por maquininha
      const pendingTransactionWithCard = {
        ...context.pendingTransaction,
        isCardMachine: true // Marca que é venda por maquininha
      }
      
      setConversationContext({
        type: 'fee_amount',
        transactionId: '', // Será preenchido após criar transação
        pendingTransaction: pendingTransactionWithCard,
        timestamp: Date.now()
      })
      
      console.log('✅ Contexto atualizado com pendingTransaction preservado e isCardMachine = true')
    } else if (noFee) {
      // Sem taxa - AGORA executar a transação
      setIsLoading(true)
      try {
        const { executeSellProduct } = await import('@/lib/chat-bot/commands/products')
        const response = await executeSellProduct(context.pendingTransaction, userId)
        
        const botMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'bot',
          content: response.message,
          timestamp: new Date(),
          type: response.type === 'success' ? 'success' : response.type === 'error' ? 'error' : 'info',
          data: response.data
        }
        setMessages(prev => [...prev, botMessage])
        
        if (response.data?.transaction || response.data?.transactions) {
          onTransactionCreated?.()
        }
        clearConversationContext()
      } catch (error: any) {
        const errorMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'bot',
          content: `❌ Erro ao registrar venda: ${error.message || 'Erro desconhecido'}`,
          timestamp: new Date(),
          type: 'error'
        }
        setMessages(prev => [...prev, errorMessage])
        clearConversationContext()
      } finally {
        setIsLoading(false)
      }
    } else {
      // Resposta não reconhecida, pedir clarificação
      const botMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: 'Por favor, responda "sim" se houver taxa ou "não" se não houver taxa.',
        timestamp: new Date(),
        type: 'question'
      }
      setMessages(prev => [...prev, botMessage])
    }
    
    setTimeout(() => {
      chatInputRef.current?.focus()
    }, 100)
  }
  
  const handleFeeAmount = async (amountText: string, context: any) => {
    // Validar se pendingTransaction existe
    if (!context?.pendingTransaction) {
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: '❌ Erro: Dados da transação não encontrados. Por favor, tente novamente.',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, {
        id: generateMessageId(),
        role: 'user',
        content: amountText,
        timestamp: new Date()
      }, errorMessage])
      clearConversationContext()
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
      return
    }
    
    // Extrair valor numérico da porcentagem (aceitar 2.5 ou 2,5 ou 2,66 ou 2.66)
    // Remover todos os caracteres não numéricos exceto vírgula e ponto
    let percentageStr = amountText.replace(/[^\d,.-]/g, '')
    // Se tiver vírgula, substituir por ponto (formato brasileiro)
    if (percentageStr.includes(',')) {
      percentageStr = percentageStr.replace(',', '.')
    }
    const percentage = parseFloat(percentageStr)
    
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: '❌ Porcentagem inválida. Digite um valor entre 0 e 100 (ex: 2.5 ou 2,5 ou 2.66 ou 2,66)',
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, {
        id: generateMessageId(),
        role: 'user',
        content: amountText,
        timestamp: new Date()
      }, errorMessage])
      
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
      return
    }
    
    try {
      setIsLoading(true)
      
      console.log('🚀 LOG - handleFeeAmount - Executando transação com pendingTransaction:')
      console.log('  - pendingTransaction:', JSON.stringify(context.pendingTransaction, null, 2))
      console.log('  - percentage:', percentage)
      
      // Adicionar porcentagem da taxa ao pendingTransaction
      const transactionData = {
        ...context.pendingTransaction,
        feePercentage: percentage // Adicionar porcentagem da taxa
      }
      
      // Executar a transação (venda parcelada por maquininha)
      // A taxa será aplicada diretamente no valor dentro de executeSellProduct
      const { executeSellProduct } = await import('@/lib/chat-bot/commands/products')
      const response = await executeSellProduct(transactionData, userId)
      
      // Adicionar mensagem do usuário
      const userMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'user',
        content: amountText,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      
      // Mostrar mensagem de sucesso da venda (já inclui informações sobre taxa)
      const botMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
        type: response.type === 'success' ? 'success' : response.type === 'error' ? 'error' : 'info',
        data: response.data
      }
      setMessages(prev => [...prev, botMessage])
      
      clearConversationContext()
      onTransactionCreated?.()
    } catch (error: any) {
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: `❌ Erro ao registrar transação: ${error.message || 'Erro desconhecido'}`,
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
      clearConversationContext()
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    }
  }
  
  const handleProductSelection = async (index: number) => {
    // LOG: Início do handleProductSelection
    console.log('🚀 LOG - handleProductSelection INICIADO')
    console.log('  - index:', index)
    console.log('  - pendingProductMatches.length:', pendingProductMatches.length)
    
    const availableMatches = pendingProductMatches.length > 0 
      ? pendingProductMatches 
      : messages.filter(m => m.role === 'bot').pop()?.data?.productMatches || []
    
    console.log('🚀 LOG - availableMatches.length:', availableMatches.length)
    
      if (availableMatches.length === 0 || index < 0 || index >= availableMatches.length) {
        const errorMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'bot',
          content: '❌ Produto selecionado não encontrado. Tente novamente.',
          timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }
    
    const selectedProduct = availableMatches[index]
    console.log('🚀 LOG - Produto selecionado:', selectedProduct.name)
    
    // IMPORTANTE: Processar diretamente sem buscar produtos novamente
    // Já temos o produto selecionado da lista original
    setIsLoading(true)
    try {
      // Verificar se é reposição de estoque ou venda
      const lastBotMessage = messages.filter(m => m.role === 'bot').pop()
      const isRestock = lastBotMessage?.data?.restockQuantity !== undefined
      
      console.log('🚀 LOG - isRestock:', isRestock)
      console.log('🚀 LOG - lastBotMessage.data:', lastBotMessage?.data)
      
      if (isRestock) {
        // Reposição de estoque
        const { executeRestockProduct } = await import('@/lib/chat-bot/commands/restock')
        const restockQuantity = lastBotMessage.data.restockQuantity
        
        const response = await executeRestockProduct(selectedProduct.id, userId, restockQuantity)
        
        const botMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'bot',
          content: response.message,
          timestamp: new Date(),
          type: response.type === 'success' ? 'success' : response.type === 'error' ? 'error' : 'info',
          data: response.data
        }
        
        setMessages(prev => [...prev, botMessage])
        setPendingProductMatches([])
        clearConversationContext()
        
        // Disparar evento para atualizar a página de produtos
        if (response.data?.product) {
          window.dispatchEvent(new CustomEvent('product-updated', {
            detail: { product: response.data.product }
          }))
        } else {
          window.dispatchEvent(new CustomEvent('product-updated'))
        }
        onTransactionCreated?.()
        
        setIsLoading(false)
        return
      }
      
      // Venda de produto - BUSCAR INFORMAÇÕES DO CONTEXTO/ÚLTIMA MENSAGEM DO USUÁRIO
      const { executeSellProduct } = await import('@/lib/chat-bot/commands/products')
      const { getLocalDateString } = await import('@/lib/utils')
      const { parseCommand } = await import('@/lib/chat-bot/command-parser')
      
      // Buscar a última mensagem do usuário para extrair informações de parcelamento/agendamento
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content
      console.log('🚀 LOG - Última mensagem do usuário:', lastUserMessage)
      
      // Parsear a última mensagem do usuário para extrair informações
      let parsedEntities: any = {}
      if (lastUserMessage) {
        // Tentar encontrar mensagem que menciona venda antes da seleção
        const sellMessages = messages
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .filter(content => /vendi|venda/i.test(content))
        
        if (sellMessages.length > 0) {
          const lastSellCommand = sellMessages[sellMessages.length - 1]
          console.log('🚀 LOG - Último comando de venda encontrado:', lastSellCommand)
          const parsed = parseCommand(lastSellCommand)
          parsedEntities = parsed.entities
          console.log('🚀 LOG - Entities extraídas do comando:', JSON.stringify(parsedEntities, null, 2))
        }
      }
      
      // Preparar dados de confirmação usando informações do comando original
      const saleQuantity = parsedEntities.quantity || 1
      const saleAmount = parsedEntities.amount || selectedProduct.price
      const totalAmount = saleAmount * saleQuantity
      const saleDate = parsedEntities.date || getLocalDateString()
      const isScheduled = parsedEntities.paymentScheduled || false
      const scheduledDate = parsedEntities.paymentDate || null
      const isInstallment = parsedEntities.isInstallment || false
      const installmentCount = parsedEntities.installmentCount || 1
      const installmentInterval = parsedEntities.installmentInterval || 'monthly'
      const isRecurring = parsedEntities.isRecurring || false
      const recurringInterval = parsedEntities.recurringInterval || 'monthly'
      const recurringEndDate = parsedEntities.recurringEndDate || null
      
      console.log('🚀 LOG - Dados extraídos para confirmação:')
      console.log('  - isScheduled:', isScheduled)
      console.log('  - scheduledDate:', scheduledDate)
      console.log('  - isInstallment:', isInstallment)
      console.log('  - installmentCount:', installmentCount)
      console.log('  - isRecurring:', isRecurring)
      
      // Verificar estoque
      if (selectedProduct.stock_quantity < saleQuantity) {
        const errorMessage: ChatMessageType = {
          id: generateMessageId(),
          role: 'bot',
          content: `⚠️ Estoque insuficiente! Você tem apenas ${selectedProduct.stock_quantity} unidades disponíveis.`,
          timestamp: new Date(),
          type: 'error'
        }
        setMessages(prev => [...prev, errorMessage])
        setIsLoading(false)
        return
      }
      
      // Preparar dados de confirmação COM informações de parcelamento/agendamento/recorrência
      const confirmationData = {
        action: 'sell_product' as const,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        amount: saleAmount,
        quantity: saleQuantity,
        totalAmount,
        date: saleDate,
        isScheduled,
        scheduledDate,
        isPaid: !isScheduled && !isInstallment && !isRecurring,
        // Parcelamento
        isInstallment,
        installmentCount,
        installmentInterval,
        // Recorrência
        isRecurring,
        recurringInterval,
        recurringEndDate
      }
      
      console.log('🚀 LOG - confirmationData completo:', JSON.stringify(confirmationData, null, 2))
      console.log('🚀 LOG - confirmationData.isScheduled:', confirmationData.isScheduled)
      console.log('🚀 LOG - confirmationData.isInstallment:', confirmationData.isInstallment)
      console.log('🚀 LOG - confirmationData.isRecurring:', confirmationData.isRecurring)
      
      // Verificar se é venda parcelada ANTES de executar
      // Se for venda parcelada, perguntar sobre taxa primeiro
      if (confirmationData.isInstallment && 
          confirmationData.installmentCount && 
          confirmationData.installmentCount > 1) {
        
        // NÃO executar ainda - apenas perguntar sobre taxa
        const feeQuestion: ChatMessageType = {
          id: generateMessageId(),
          role: 'bot',
          content: 'A venda tem alguma taxa relacionada? (ex: taxa da maquininha)',
          timestamp: new Date(),
          type: 'question',
          data: { 
            requiresFeeInput: true
          }
        }
        setMessages(prev => [...prev, feeQuestion])
        
        // Guardar contexto com dados da transação pendente
        setConversationContext({
          type: 'fee_question',
          pendingTransaction: confirmationData,
          timestamp: Date.now()
        })
        
        setIsLoading(false)
        setPendingProductMatches([])
        setTimeout(() => {
          chatInputRef.current?.focus()
        }, 100)
        return
      }
      
      // Executar venda diretamente (apenas se não for venda parcelada)
      const response = await executeSellProduct(confirmationData, userId)
      
      console.log('🚀 LOG - executeSellProduct retornou:')
      console.log('  - message:', response.message)
      console.log('  - type:', response.type)
      console.log('  - data:', response.data)
      
      // Mostrar mensagem normalmente
      const botMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
        type: response.type === 'success' ? 'success' : response.type === 'error' ? 'error' : 'info',
        data: response.data
      }
      setMessages(prev => [...prev, botMessage])
      
      // Limpar matches após processamento
      setPendingProductMatches([])
      
      // Callback se transação foi criada
      if (response.type === 'success' && (response.data?.transaction || response.data?.transactions)) {
        onTransactionCreated?.()
      }
      
      // Limpar contexto após execução bem-sucedida (exceto se for pergunta de taxa)
      if (!response.data?.requiresFeeQuestion) {
        clearConversationContext()
      }
      
      // Focar o input após processar seleção
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    } catch (error: any) {
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        content: `❌ Erro ao processar seleção: ${error.message || 'Erro desconhecido'}`,
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Focar o input após erro
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Sugestões de comandos */}
      {!isLoading && messages.length > 1 && messages[messages.length - 1]?.data?.suggestions && (
        <CommandSuggestions 
          onSelect={handleSendMessage}
          suggestions={messages[messages.length - 1]?.data?.suggestions}
          lastIntent={messages[messages.length - 1]?.data?.intent}
        />
      )}
      
      {/* Input */}
      <ChatInput 
        ref={chatInputRef}
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder={pendingConfirmation 
          ? "Digite 'sim' para confirmar ou 'não' para cancelar" 
          : "Digite um comando..."}
      />
    </div>
  )
}

