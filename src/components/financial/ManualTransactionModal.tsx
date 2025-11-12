'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { X, DollarSign, Search, Plus, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Função auxiliar para converter Date para string local
function getLocalDateStringFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface ManualTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userProducts: any[]
  onTransactionCreated: () => void
}

export function ManualTransactionModal({
  isOpen, 
  onClose, 
  userId, 
  userProducts, 
  onTransactionCreated 
}: ManualTransactionModalProps) {
  const [formData, setFormData] = useState({
    type: 'receita',
    categoryId: '',
    productId: '',
    amount: '',
    description: '',
    date: getLocalDateString(),
    isInstallment: false,
    installmentCount: 1,
    installmentInterval: 'monthly',
    customTitle: '',
    isFuturePayment: false,
    futurePaymentDate: '',
    paymentMethod: 'pix', // 'pix' | 'card' | 'cash'
    hasFee: false,
    feePercentage: '',
    cashReceived: '' // Para calcular troco
  })
  const [productSearch, setProductSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userCategories, setUserCategories] = useState<any[]>([])
  const [showProductSelection, setShowProductSelection] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  // Estado para criação de recorrentes a partir deste modal
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false)
  const [recurringFormData, setRecurringFormData] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    category: '',
    interval: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
    startDate: getLocalDateString(),
    hasEndDate: false,
    endDate: ''
  })

  useEffect(() => {
    if (isOpen && userId) {
      loadUserCategories()
    }
  }, [isOpen, userId])

  // Log para investigar dark mode e classes CSS
  useEffect(() => {
    if (isOpen) {
      const html = document.documentElement
      const isDark = html.classList.contains('dark')
      console.log('🔍 [ManualTransactionModal] Modal aberto:', {
        isDark,
        htmlClasses: html.className,
        computedBackground: getComputedStyle(html).getPropertyValue('--background'),
        computedCard: getComputedStyle(html).getPropertyValue('--card'),
        computedBorder: getComputedStyle(html).getPropertyValue('--border'),
      })
      
      // Verificar elementos específicos após renderização
      setTimeout(() => {
        const selects = document.querySelectorAll('[data-radix-select-trigger]')
        const selectContents = document.querySelectorAll('[data-radix-select-content]')
        console.log('🔍 [ManualTransactionModal] Selects encontrados:', {
          triggers: selects.length,
          contents: selectContents.length,
          zIndexValues: Array.from(selects).map(el => {
            const computed = getComputedStyle(el as HTMLElement)
            return {
              zIndex: computed.zIndex,
              position: computed.position,
              display: computed.display,
            }
          })
        })
      }, 500)
    }
  }, [isOpen])

  const loadUserCategories = async () => {
    try {
      const supabase = createClient()
      
      // Primeiro, tentar carregar categorias existentes
      // @ts-ignore - user_categories table exists but not in types yet
      const { data, error } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) {
        console.log('🔍 Tabela user_categories não existe ainda, criando categorias padrão')
        
        // Se a tabela não existe, criar categorias padrão localmente
        const defaultCategories = [
          { id: 'default-venda', name: 'Venda', type: 'income', color: '#10B981' },
          { id: 'default-compra', name: 'Compra', type: 'expense', color: '#EF4444' },
          { id: 'default-impostos', name: 'Impostos', type: 'expense', color: '#F59E0B' },
          { id: 'default-taxas', name: 'Taxas', type: 'expense', color: '#8B5CF6' }
        ]
        
        setUserCategories(defaultCategories)
        return
      }
      
      // Se não há categorias, criar as padrão
      if (!data || data.length === 0) {
        console.log('🔍 Nenhuma categoria encontrada, criando categorias padrão')
        
        const defaultCategories = [
          { id: 'default-venda', name: 'Venda', type: 'income', color: '#10B981' },
          { id: 'default-compra', name: 'Compra', type: 'expense', color: '#EF4444' },
          { id: 'default-impostos', name: 'Impostos', type: 'expense', color: '#F59E0B' },
          { id: 'default-taxas', name: 'Taxas', type: 'expense', color: '#8B5CF6' }
        ]
        
        setUserCategories(defaultCategories)
        return
      }
      
      setUserCategories(data)
      console.log('🔍 Categorias carregadas:', data?.length || 0)
      
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      
      // Em caso de erro, usar categorias padrão
      const defaultCategories = [
        { id: 'default-venda', name: 'Venda', type: 'income', color: '#10B981' },
        { id: 'default-compra', name: 'Compra', type: 'expense', color: '#EF4444' },
        { id: 'default-impostos', name: 'Impostos', type: 'expense', color: '#F59E0B' },
        { id: 'default-taxas', name: 'Taxas', type: 'expense', color: '#8B5CF6' }
      ]
      
      setUserCategories(defaultCategories)
    }
  }

  const createNewCategory = async () => {
    if (!newCategoryName.trim()) return
    
    try {
      const supabase = createClient()
      
      // Mapear tipos para o formato correto
      const categoryType = formData.type === 'receita' ? 'income' : 'expense'
      
      // Tentar criar no banco primeiro
      // @ts-ignore - user_categories table exists but not in types yet
      const { data, error } = await supabase
        .from('user_categories')
        .insert({
          user_id: userId,
          name: newCategoryName.trim(),
          type: categoryType,
          color: '#3B82F6'
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar categoria:', error)
        toast.error(`Erro ao criar categoria: ${error.message}`)
        return
      }
      
      setUserCategories(prev => [...prev, data])
      setFormData(prev => ({ ...prev, categoryId: data.id }))
      setNewCategoryName('')
      setShowNewCategory(false)
      
      toast.success('Categoria criada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      toast.error('Erro ao criar categoria')
    }
  }

  const filteredProducts = useMemo(() => {
    let products = userProducts
    
    // Filtrar por busca se houver texto
    if (productSearch.trim()) {
      products = userProducts.filter(product => 
      product.name.toLowerCase().includes(productSearch.toLowerCase())
    )
    }
    
    // Ordenar: produtos com estoque primeiro (ordenados por quantidade decrescente), depois sem estoque
    return products.sort((a, b) => {
      const stockA = a.stock_quantity || 0
      const stockB = b.stock_quantity || 0
      
      // Se ambos têm estoque ou ambos não têm, ordenar por quantidade (maior primeiro)
      if ((stockA > 0 && stockB > 0) || (stockA === 0 && stockB === 0)) {
        return stockB - stockA
      }
      
      // Produtos com estoque vêm antes dos sem estoque
      if (stockA > 0 && stockB === 0) return -1
      if (stockA === 0 && stockB > 0) return 1
      
      return 0
    })
  }, [userProducts, productSearch])

  const handleProductSelect = (productId: string) => {
    const selectedProduct = userProducts.find(p => p.id === productId)
    if (selectedProduct) {
      // Verificar se estoque é zero
      if (selectedProduct.stock_quantity <= 0) {
        toast.error('Este produto está com estoque zerado! Verifique a contagem do estoque.')
        return
      }
      
      setFormData(prev => ({ 
        ...prev, 
        productId: productId,
        amount: selectedProduct.price.toString().replace('.', ',')
      }))
      
      // Fechar dropdown ao selecionar
      setProductSearch('')
    }
  }

  const selectedProduct = userProducts.find(p => p.id === formData.productId)
  const selectedCategory = userCategories.find(c => c.id === formData.categoryId)

  // Função auxiliar para gerar UUID (igual ao BOT IA)
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Função auxiliar para criar transação (igual ao BOT IA)
  const createTransaction = async (data: {
    user_id: string
    type: 'income' | 'expense'
    amount: number
    date: string
    description: string | null
    category: string | null
    category_id?: string | null
    product_id?: string | null
    is_paid?: boolean
    scheduled_date?: string | null
    is_installment?: boolean
    installment_count?: number | null
    installment_number?: number | null
    installment_interval?: string | null
    installment_group_id?: string | null
    payment_method?: string | null
    notes?: string | null
  }) => {
    const supabase = createClient()
    const { data: transaction, error } = await supabase
      .from('financial_transactions')
      .insert({
        user_id: data.user_id,
        type: data.type,
        amount: data.amount,
        date: data.date,
        description: data.description,
        category: data.category,
        category_id: data.category_id || null,
        product_id: data.product_id || null,
        is_paid: data.is_paid ?? true,
        scheduled_date: data.scheduled_date || null,
        is_installment: data.is_installment || false,
        installment_count: data.installment_count || null,
        installment_number: data.installment_number || null,
        installment_interval: data.installment_interval || null,
        installment_group_id: data.installment_group_id || null,
        payment_method: data.payment_method || null,
        notes: data.notes || null,
      })
      .select()
      .single()
    
    if (error) throw error
    return transaction
  }

  // Função auxiliar para atualizar estoque (igual ao BOT IA)
  const updateStock = async (productId: string, quantityChange: number) => {
    const supabase = createClient()
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .eq('user_id', userId)
      .single()
    
    if (fetchError || !product) throw new Error('Produto não encontrado')
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 ManualTransactionModal: Iniciando criação de transação (usando lógica do BOT IA)')
    console.log('🔵 ManualTransactionModal: Dados do formulário:', formData)

    if (!formData.categoryId) {
      toast.error('Selecione uma categoria')
      return
    }

    if (!formData.amount || parseFloat(formData.amount.replace(',', '.')) <= 0) {
      toast.error('Digite um valor válido')
      return
    }

    // Validar data de pagamento futuro
    if (formData.isFuturePayment && !formData.futurePaymentDate) {
      toast.error('Selecione a data do pagamento futuro')
      return
    }

    setIsLoading(true)
    
    try {
      const supabase = createClient()
      
      // Validar se categoryId é um UUID válido
      const isValidUUID = formData.categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.categoryId)
      
      // Preparar dados básicos
      const transactionType: 'income' | 'expense' = formData.type === 'receita' ? 'income' : 'expense'
      const originalAmount = parseFloat(formData.amount.replace(',', '.'))
      const today = getLocalDateString()
      let transactionDate = formData.date || today
      
      // Calcular taxa se aplicável
      let feeAmount = 0
      let feePercentage = 0
      const isCardMachine = formData.paymentMethod === 'card' && formData.hasFee && formData.feePercentage
      
      if (isCardMachine) {
        feePercentage = parseFloat(formData.feePercentage.replace(',', '.'))
        feeAmount = originalAmount * (feePercentage / 100)
      }
      
      // Descrição base
      const baseDescription = formData.description || 
        (selectedProduct ? selectedProduct.name : formData.customTitle || selectedCategory?.name || 'Transação')
      
      // Verificar se é venda parcelada por maquininha com taxa (CASO ESPECIAL)
      const isInstallment = formData.isInstallment && formData.installmentCount && formData.installmentCount > 1
      const isInstallmentWithFee = isInstallment && isCardMachine && feeAmount > 0 && transactionType === 'income'
      
      if (isInstallmentWithFee) {
        console.log('💰 VENDA PARCELADA POR MAQUININHA COM TAXA - Criando transação única com valor líquido')
        
        const netTotalAmount = originalAmount - feeAmount
        
        // Criar UMA ÚNICA transação com valor líquido total
        const transaction = await createTransaction({
          user_id: userId,
          type: 'income',
          amount: netTotalAmount,
          date: today,
          description: `${baseDescription} (produto vendido por maquininha)`,
          category: selectedCategory?.name || 'Vendas',
          category_id: isValidUUID ? formData.categoryId : null,
          product_id: selectedProduct?.id || null,
          is_paid: true,
          scheduled_date: null,
          is_installment: false,
          installment_count: null,
          installment_number: null,
          installment_interval: null,
          installment_group_id: null,
          payment_method: formData.paymentMethod
        })
        
        // Atualizar estoque
        if (selectedProduct && (selectedCategory?.name === 'Vendas' || selectedCategory?.name === 'Venda')) {
          await updateStock(selectedProduct.id, -1)
        }
        
        // Criar transação de taxa separadamente
        await createTransaction({
          user_id: userId,
          type: 'expense',
          amount: feeAmount,
          description: `Taxa cartão (${feePercentage}%) - ${baseDescription}`,
          category: 'Taxas',
          date: today,
          is_paid: true,
          payment_method: 'card'
        })
        
        toast.success(`Venda registrada! Valor líquido: R$ ${netTotalAmount.toFixed(2)} | Taxa: R$ ${feeAmount.toFixed(2)}`)
        onTransactionCreated()
        onClose()
        return
      }
      
      // Criar parcelas se necessário (sem taxa de maquininha)
      if (isInstallment) {
        console.log('🔵 ManualTransactionModal: Criando PARCELAS (lógica do BOT IA)')
        
        const groupId = generateUUID()
        const installmentAmount = originalAmount / formData.installmentCount!
        const baseDate = new Date(transactionDate)
        const intervalMonths = formData.installmentInterval === 'weekly' ? 0 : 
                              formData.installmentInterval === 'monthly' ? 1 : 3
        
        for (let i = 1; i <= formData.installmentCount!; i++) {
          const installmentDate = new Date(baseDate)
          
          if (intervalMonths > 0) {
            installmentDate.setMonth(baseDate.getMonth() + (intervalMonths * (i - 1)))
          } else {
            installmentDate.setDate(baseDate.getDate() + (7 * (i - 1)))
          }
          
          const isFirstInstallment = i === 1
          const firstInstallmentDate = isFirstInstallment ? today : getLocalDateStringFromDate(installmentDate)
          const firstInstallmentScheduledDate = isFirstInstallment ? null : getLocalDateStringFromDate(installmentDate)
          const firstInstallmentIsPaid = isFirstInstallment
          
          await createTransaction({
            user_id: userId,
            type: transactionType,
            amount: installmentAmount,
            date: firstInstallmentDate,
            description: `${baseDescription} (${i}/${formData.installmentCount})`,
            category: selectedCategory?.name || 'Outros',
            category_id: isValidUUID ? formData.categoryId : null,
            product_id: selectedProduct?.id || null,
            is_paid: firstInstallmentIsPaid,
            scheduled_date: firstInstallmentScheduledDate,
            is_installment: true,
            installment_count: formData.installmentCount,
            installment_number: i,
            installment_interval: formData.installmentInterval || 'monthly',
            installment_group_id: groupId,
            payment_method: formData.paymentMethod
          })
        }
        
        // Atualizar estoque apenas uma vez
        if (selectedProduct && (selectedCategory?.name === 'Vendas' || selectedCategory?.name === 'Venda') && transactionType === 'income') {
          await updateStock(selectedProduct.id, -1)
        }
        
        toast.success(`${formData.installmentCount}x parcelas criadas com sucesso!`)
        onTransactionCreated()
        onClose()
        return
      }
      
      // Criar transação única (sem parcelamento)
      console.log('🔵 ManualTransactionModal: Criando TRANSAÇÃO SIMPLES (lógica do BOT IA)')
      
      // Se for pagamento agendado, data da transação é hoje, scheduled_date é futuro
      let finalIsPaid = true
      let finalScheduledDate: string | null = null
      
      if (formData.isFuturePayment && formData.futurePaymentDate) {
        transactionDate = today
        finalIsPaid = false
        finalScheduledDate = formData.futurePaymentDate
      } else {
        const parsedDate = parseLocalDate(transactionDate)
        const todayDate = parseLocalDate(today)
        if (parsedDate <= todayDate) {
          transactionDate = getLocalDateString(parsedDate)
        } else {
          transactionDate = today
        }
      }
      
      // Se for venda com taxa de maquininha, usar valor líquido
      let finalAmount = originalAmount
      let finalDescription = baseDescription
      if (isCardMachine && feeAmount > 0 && transactionType === 'income') {
        finalAmount = originalAmount - feeAmount
        if (selectedProduct) {
          finalDescription = `${selectedProduct.name} (produto vendido por maquininha)`
        }
      }
      
      const transaction = await createTransaction({
        user_id: userId,
        type: transactionType,
        amount: finalAmount,
        date: transactionDate,
        description: finalDescription,
        category: selectedCategory?.name || 'Outros',
        category_id: isValidUUID ? formData.categoryId : null,
        product_id: selectedProduct?.id || null,
        is_paid: finalIsPaid,
        scheduled_date: finalScheduledDate,
        payment_method: formData.paymentMethod
      })
      
      // Atualizar estoque
      if (selectedProduct && (selectedCategory?.name === 'Vendas' || selectedCategory?.name === 'Venda') && transactionType === 'income') {
        await updateStock(selectedProduct.id, -1)
      }
      
      // Criar transação de taxa se aplicável
      if (isCardMachine && feeAmount > 0 && transactionType === 'income') {
        await createTransaction({
          user_id: userId,
          type: 'expense',
          amount: feeAmount,
          description: `Taxa cartão (${feePercentage}%) - ${baseDescription}`,
          category: 'Taxas',
          date: today,
          is_paid: true,
          payment_method: 'card'
        })
        
        toast.success(`Transação e taxa de ${feePercentage}% registradas!`)
      } else {
        if (finalScheduledDate) {
          toast.success(`Transação criada! Você receberá uma notificação em ${parseLocalDate(finalScheduledDate).toLocaleDateString('pt-BR')}`)
        } else {
          toast.success('Transação criada com sucesso!')
        }
      }
      
      // Log de troco para dinheiro (apenas informativo)
      if (formData.paymentMethod === 'cash' && formData.cashReceived) {
        const received = parseFloat(formData.cashReceived.replace(',', '.'))
        const total = parseFloat(formData.amount.replace(',', '.'))
        const change = received - total
        if (change > 0) {
          console.log(`💰 Troco calculado: R$ ${change.toFixed(2)}`)
        }
      }
      
      console.log('🔵 ManualTransactionModal: Chamando onTransactionCreated')
      onTransactionCreated()
      console.log('🔄 UI atualizada: Lista de transações recarregada')
      console.log('✨ Processo concluído: Transação criada e sincronizada com sucesso!')
      onClose()
      
      // Reset form
      setFormData({
        type: 'receita',
        categoryId: '',
        productId: '',
        amount: '',
        description: '',
        date: getLocalDateString(),
        isInstallment: false,
        installmentCount: 1,
        installmentInterval: 'monthly',
        customTitle: '',
        isFuturePayment: false,
        futurePaymentDate: '',
        paymentMethod: 'pix',
        hasFee: false,
        feePercentage: '',
        cashReceived: ''
      })
      setProductSearch('')
      setShowProductSelection(false)

    } catch (error) {
      console.error('Erro ao criar transação:', error)
      toast.error('Erro ao criar transação')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground border border-border"
        ref={(el) => {
          if (el) {
            const html = document.documentElement
            const isDark = html.classList.contains('dark')
            const computed = getComputedStyle(el)
            console.log('🔍 [ManualTransactionModal] DialogContent estilos:', {
              isDark,
              backgroundColor: computed.backgroundColor,
              color: computed.color,
              borderColor: computed.borderColor,
              zIndex: computed.zIndex,
              position: computed.position,
              overflow: computed.overflow,
              classes: el.className,
            })
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            <DollarSign className="w-5 h-5" />
            Nova Transação
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crie uma nova transação financeira
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-4 text-card-foreground">
            {/* Tipo de Transação */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
              <Label htmlFor="type">Tipo de Transação</Label>
                <Button type="button" variant="outline" size="sm" className="text-xs"
                  onClick={() => setIsRecurringModalOpen(true)}>
                  Recorrente
                </Button>
              </div>
              <Select 
                value={formData.type} 
                onValueChange={(value) => {
                  console.log('🔍 [ManualTransactionModal] Tipo alterado:', value)
                  setFormData(prev => ({ 
                    ...prev, 
                    type: value,
                    categoryId: '',
                    productId: '',
                    showProductSelection: false
                  }))
                }}
                onOpenChange={(open) => {
                  if (open) {
                    console.log('🔍 [ManualTransactionModal] Select (Tipo) aberto')
                    setTimeout(() => {
                      const selectContent = document.querySelector('[data-radix-select-content]')
                      if (selectContent) {
                        const html = document.documentElement
                        const isDark = html.classList.contains('dark')
                        const computed = getComputedStyle(selectContent as HTMLElement)
                        const dialogContent = document.querySelector('[data-radix-dialog-content]')
                        const dialogZIndex = dialogContent ? getComputedStyle(dialogContent as HTMLElement).zIndex : 'N/A'
                        console.log('🔍 [ManualTransactionModal] SelectContent (Tipo) estilos:', {
                          isDark,
                          backgroundColor: computed.backgroundColor,
                          color: computed.color,
                          borderColor: computed.borderColor,
                          zIndex: computed.zIndex,
                          dialogZIndex,
                          position: computed.position,
                        })
                      }
                    }, 100)
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger 
                  className="w-full"
                  onClick={() => {
                    console.log('🔍 [ManualTransactionModal] SelectTrigger (Tipo) clicado')
                    const html = document.documentElement
                    console.log('🔍 [ManualTransactionModal] Dark mode ativo?', html.classList.contains('dark'))
                  }}
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent 
                  className="z-[100001] bg-card text-card-foreground border border-border shadow-lg"
                  ref={(el) => {
                    if (el) {
                      const html = document.documentElement
                      const isDark = html.classList.contains('dark')
                      const computed = getComputedStyle(el)
                      const dialogContent = document.querySelector('[data-radix-dialog-content]')
                      const dialogZIndex = dialogContent ? getComputedStyle(dialogContent as HTMLElement).zIndex : 'N/A'
                      console.log('🔍 [ManualTransactionModal] SelectContent (Tipo) renderizado:', {
                        isDark,
                        backgroundColor: computed.backgroundColor,
                        color: computed.color,
                        borderColor: computed.borderColor,
                        zIndex: computed.zIndex,
                        dialogZIndex,
                        position: computed.position,
                      })
                    }
                  }}
                >
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Categoria</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Nova
                </Button>
              </div>
              
              {showNewCategory ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Nome da nova categoria"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={createNewCategory}
                      disabled={!newCategoryName.trim() || isLoading}
                    >
                      Criar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewCategory(false)
                        setNewCategoryName('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Select 
                  value={formData.categoryId} 
                onValueChange={(value) => {
                  console.log('🔍 [ManualTransactionModal] Categoria alterada:', value)
                  const selectedCategory = userCategories.find(c => c.id === value)
                  const isVenda = (selectedCategory?.name === 'Vendas' || selectedCategory?.name === 'Venda') && formData.type === 'receita'
                  
                  setFormData(prev => ({ 
                    ...prev, 
                    categoryId: value,
                    productId: '',
                  }))
                  
                  // Atualizar estado de seleção de produto
                  setShowProductSelection(isVenda || false)
                }}
                onOpenChange={(open) => {
                  if (open) {
                    console.log('🔍 [ManualTransactionModal] Select (Categoria) aberto')
                    setTimeout(() => {
                      const selectContents = document.querySelectorAll('[data-radix-select-content]')
                      const selectContent = Array.from(selectContents).find(el => {
                        const viewport = el.querySelector('[data-radix-select-viewport]')
                        return viewport && viewport.textContent?.includes('Venda')
                      }) || selectContents[selectContents.length - 1]
                      if (selectContent) {
                        const html = document.documentElement
                        const isDark = html.classList.contains('dark')
                        const computed = getComputedStyle(selectContent as HTMLElement)
                        const dialogContent = document.querySelector('[data-radix-dialog-content]')
                        const dialogZIndex = dialogContent ? getComputedStyle(dialogContent as HTMLElement).zIndex : 'N/A'
                        console.log('🔍 [ManualTransactionModal] SelectContent (Categoria) estilos:', {
                          isDark,
                          backgroundColor: computed.backgroundColor,
                          color: computed.color,
                          borderColor: computed.borderColor,
                          zIndex: computed.zIndex,
                          dialogZIndex,
                          position: computed.position,
                        })
                      }
                    }, 100)
                  }
                }}
                  disabled={isLoading}
                >
                  <SelectTrigger 
                    className="w-full"
                    onClick={() => {
                      console.log('🔍 [ManualTransactionModal] SelectTrigger (Categoria) clicado')
                    }}
                  >
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[100001] bg-card text-card-foreground border border-border shadow-lg"
                    ref={(el) => {
                      if (el) {
                        const html = document.documentElement
                        const isDark = html.classList.contains('dark')
                        const computed = getComputedStyle(el)
                        const dialogContent = document.querySelector('[data-radix-dialog-content]')
                        const dialogZIndex = dialogContent ? getComputedStyle(dialogContent as HTMLElement).zIndex : 'N/A'
                        console.log('🔍 [ManualTransactionModal] SelectContent (Categoria) renderizado:', {
                          isDark,
                          backgroundColor: computed.backgroundColor,
                          color: computed.color,
                          borderColor: computed.borderColor,
                          zIndex: computed.zIndex,
                          dialogZIndex,
                          position: computed.position,
                        })
                      }
                    }}
                  >
                    {userCategories
                      .filter(cat => {
                        // Mapear tipos: 'income' ou 'expense' vs 'receita' ou 'despesa'
                        const categoryType = cat.type === 'income' ? 'receita' : 'despesa'
                        return categoryType === formData.type
                      })
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Seleção de Produto - APENAS para categoria "Venda" */}
            {showProductSelection && (
              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <Input
                      placeholder="Buscar produto..."
                      value={productSearch}
                      onChange={(e) => {
                        const newValue = e.target.value
                        setProductSearch(newValue)
                        // Se o usuário começar a digitar algo diferente, limpar a seleção
                        if (selectedProduct && newValue !== selectedProduct.name) {
                          setFormData(prev => ({ ...prev, productId: '', amount: '' }))
                        }
                      }}
                      onFocus={() => {
                        // Se houver produto selecionado, mostrar o nome para edição
                        if (selectedProduct) {
                          setProductSearch(selectedProduct.name)
                        }
                      }}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    {selectedProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, productId: '', amount: '' }))
                          setProductSearch('')
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remover produto selecionado"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {productSearch && !selectedProduct && (
                    <div className="max-h-40 overflow-y-auto border rounded-lg bg-card text-card-foreground border-border">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className={`p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0 border-gray-200 dark:border-gray-700 ${
                              formData.productId === product.id ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : ''
                            }`}
                            onClick={() => handleProductSelect(product.id)}
                          >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{product.name}</span>
                            <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                R$ {product.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Estoque: {product.stock_quantity} | 
                              Categoria: {product.category?.name || 'Sem categoria'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          Nenhum produto encontrado
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedProduct && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg relative text-foreground dark:text-card-foreground">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, productId: '', amount: '' }))
                          setProductSearch('')
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remover produto selecionado"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <div className="flex justify-between items-center pr-6">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">{selectedProduct.name}</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                          R$ {selectedProduct.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Estoque: {selectedProduct.stock_quantity} | 
                        Categoria: {selectedProduct.category?.name || 'Sem categoria'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Título Personalizado - quando NÃO é categoria "Venda" */}
            {!showProductSelection && formData.categoryId && (
              <div className="space-y-2">
                <Label htmlFor="customTitle">Título da Transação (opcional)</Label>
                <Input
                  id="customTitle"
                  placeholder="Ex: Pagamento de conta de luz..."
                  value={formData.customTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, customTitle: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                disabled={isLoading}
              />
              {selectedProduct && (
                <p className="text-xs text-green-600">
                  Valor atualizado automaticamente do estoque
                </p>
              )}
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            {/* Pagamentos Agendados */}
            <div 
              className="space-y-3 p-3 bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFuturePayment"
                  checked={formData.isFuturePayment}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      isFuturePayment: e.target.checked,
                      isInstallment: e.target.checked ? false : prev.isInstallment // Desmarcar parcelamento se marcar pagamento agendado
                    }))
                  }}
                  disabled={isLoading}
                  className="rounded w-4 h-4 text-primary bg-background border-gray-300 dark:border-gray-600 focus:ring-primary"
                />
                <Label htmlFor="isFuturePayment" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Pagamentos Agendados
                </Label>
              </div>
              
              {formData.isFuturePayment && (
                <div className="space-y-2 pl-6">
                  <div>
                    <Label htmlFor="futurePaymentDate" className="text-xs text-gray-900 dark:text-gray-100">Data do Pagamento</Label>
                    <Input
                      id="futurePaymentDate"
                      type="date"
                      value={formData.futurePaymentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, futurePaymentDate: e.target.value }))}
                      disabled={isLoading}
                      min={getLocalDateString()}
                      className="text-sm"
                    />
                    <p className="text-xs text-blue-600 dark:text-gray-100 mt-1">
                      Esta transação ficará nas transações pendentes até a data escolhida
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Método de Pagamento */}
            <div 
              className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Método de Pagamento
              </Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value: 'pix' | 'card' | 'cash') => {
                  console.log('🔍 [ManualTransactionModal] Método de pagamento alterado:', value)
                  setFormData(prev => ({ ...prev, paymentMethod: value, hasFee: false, feePercentage: '', cashReceived: '' }))
                }}
                onOpenChange={(open) => {
                  if (open) {
                    console.log('🔍 [ManualTransactionModal] Select (Método de Pagamento) aberto')
                    setTimeout(() => {
                      const selectContents = document.querySelectorAll('[data-radix-select-content]')
                      const selectContent = Array.from(selectContents).find(el => {
                        const viewport = el.querySelector('[data-radix-select-viewport]')
                        return viewport && (viewport.textContent?.includes('PIX') || viewport.textContent?.includes('Cartão'))
                      }) || selectContents[selectContents.length - 1]
                      if (selectContent) {
                        const html = document.documentElement
                        const isDark = html.classList.contains('dark')
                        const computed = getComputedStyle(selectContent as HTMLElement)
                        const dialogContent = document.querySelector('[data-radix-dialog-content]')
                        const dialogZIndex = dialogContent ? getComputedStyle(dialogContent as HTMLElement).zIndex : 'N/A'
                        console.log('🔍 [ManualTransactionModal] SelectContent (Método) estilos:', {
                          isDark,
                          backgroundColor: computed.backgroundColor,
                          color: computed.color,
                          borderColor: computed.borderColor,
                          zIndex: computed.zIndex,
                          dialogZIndex,
                          position: computed.position,
                        })
                      }
                    }, 100)
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  onClick={() => {
                    console.log('🔍 [ManualTransactionModal] SelectTrigger (Método de Pagamento) clicado')
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100001]">
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Taxa para cartão */}
              {formData.paymentMethod === 'card' && (
                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasFee"
                      checked={formData.hasFee}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        hasFee: e.target.checked,
                        feePercentage: e.target.checked ? prev.feePercentage : ''
                      }))}
                      className="w-4 h-4 text-primary bg-background border-gray-300 dark:border-gray-600 focus:ring-primary rounded"
                    />
                      <Label htmlFor="hasFee" className="text-sm font-medium cursor-pointer text-gray-900 dark:text-gray-100">
                      Esta transação tem taxa da maquininha?
                    </Label>
                  </div>
                  
                  {formData.hasFee && (
                    <div>
                      <Label htmlFor="feePercentage" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Taxa (%)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        id="feePercentage"
                        value={formData.feePercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, feePercentage: e.target.value }))}
                        placeholder="0.00"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-100 mt-1">
                        {formData.feePercentage && formData.amount && (
                          <>
                            Valor da taxa: R$ {(
                              parseFloat(formData.amount.replace(',', '.')) * 
                              (parseFloat(formData.feePercentage.replace(',', '.')) / 100)
                            ).toFixed(2)}
                            <br />
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              Valor líquido a receber: R$ {(
                                parseFloat(formData.amount.replace(',', '.')) * 
                                (1 - parseFloat(formData.feePercentage.replace(',', '.')) / 100)
                              ).toFixed(2)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Campo de troco para dinheiro */}
              {formData.paymentMethod === 'cash' && (
                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <Label htmlFor="cashReceived" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Valor recebido (opcional)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    id="cashReceived"
                    value={formData.cashReceived}
                    onChange={(e) => setFormData(prev => ({ ...prev, cashReceived: e.target.value }))}
                    placeholder="0.00"
                    className="mt-1"
                  />
                  {formData.cashReceived && formData.amount && parseFloat(formData.cashReceived.replace(',', '.')) > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-100 mt-1">
                      {(() => {
                        const received = parseFloat(formData.cashReceived.replace(',', '.'))
                        const total = parseFloat(formData.amount.replace(',', '.'))
                        const change = received - total
                        if (change > 0) {
                          return <span className="font-semibold text-blue-600 dark:text-blue-400">Troco: R$ {change.toFixed(2)}</span>
                        } else if (change < 0) {
                          return <span className="font-semibold text-red-600 dark:text-red-400">Faltam: R$ {Math.abs(change).toFixed(2)}</span>
                        } else {
                          return <span className="font-semibold text-green-600 dark:text-green-400">Valor exato!</span>
                        }
                      })()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Parcelamento */}
            <div 
              className="space-y-3 p-3 bg-muted rounded-lg border border-border"
              ref={(el) => {
                if (el) {
                  const html = document.documentElement
                  const isDark = html.classList.contains('dark')
                  const computed = getComputedStyle(el)
                  console.log('🔍 [ManualTransactionModal] Parcelamento - estilos aplicados:', {
                    isDark,
                    backgroundColor: computed.backgroundColor,
                    borderColor: computed.borderColor,
                    color: computed.color,
                    classes: el.className,
                  })
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isInstallment"
                  checked={formData.isInstallment}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      isInstallment: e.target.checked,
                      isFuturePayment: e.target.checked ? false : prev.isFuturePayment // Desmarcar pagamento futuro se marcar parcelamento
                    }))
                  }}
                  disabled={isLoading}
                  className="rounded w-4 h-4 text-primary bg-background border-gray-300 focus:ring-primary"
                />
                <Label htmlFor="isInstallment" className="text-sm font-medium">
                  Parcelamento / Pagamento recorrente
                </Label>
              </div>
              
              {formData.isInstallment && formData.paymentMethod === 'pix' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  ℹ️ Vendas parceladas via PIX não têm taxa.
                </p>
              )}
              
              {formData.isInstallment && (
                <div className="space-y-2 pl-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="installmentCount" className="text-xs">Número de parcelas</Label>
                      <Input
                        id="installmentCount"
                        type="number"
                        min="1"
                        max="24"
                        value={formData.installmentCount}
                        onChange={(e) => setFormData(prev => ({ ...prev, installmentCount: parseInt(e.target.value) || 1 }))}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="installmentInterval" className="text-xs">Intervalo</Label>
                      <Select 
                        value={formData.installmentInterval} 
                        onValueChange={(value) => {
                          console.log('🔍 [ManualTransactionModal] Intervalo de parcelamento alterado:', value)
                          setFormData(prev => ({ ...prev, installmentInterval: value }))
                        }}
                        onOpenChange={(open) => {
                          if (open) {
                            console.log('🔍 [ManualTransactionModal] Select (Intervalo) aberto')
                            setTimeout(() => {
                              const selectContents = document.querySelectorAll('[data-radix-select-content]')
                              const selectContent = Array.from(selectContents).find(el => {
                                const viewport = el.querySelector('[data-radix-select-viewport]')
                                return viewport && (viewport.textContent?.includes('Semanal') || viewport.textContent?.includes('Mensal'))
                              }) || selectContents[selectContents.length - 1]
                              if (selectContent) {
                                const html = document.documentElement
                                const isDark = html.classList.contains('dark')
                                const computed = getComputedStyle(selectContent as HTMLElement)
                                const dialogContent = document.querySelector('[data-radix-dialog-content]')
                                const dialogZIndex = dialogContent ? getComputedStyle(dialogContent as HTMLElement).zIndex : 'N/A'
                                console.log('🔍 [ManualTransactionModal] SelectContent (Intervalo) estilos:', {
                                  isDark,
                                  backgroundColor: computed.backgroundColor,
                                  color: computed.color,
                                  borderColor: computed.borderColor,
                                  zIndex: computed.zIndex,
                                  dialogZIndex,
                                  position: computed.position,
                                })
                              }
                            }, 100)
                          }
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger 
                          className="text-sm"
                          onClick={() => {
                            console.log('🔍 [ManualTransactionModal] SelectTrigger (Intervalo) clicado')
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent 
                          className="z-[100001] bg-card text-card-foreground border border-border shadow-lg"
                          ref={(el) => {
                            if (el) {
                              const html = document.documentElement
                              const isDark = html.classList.contains('dark')
                              const computed = getComputedStyle(el)
                              const dialogContent = document.querySelector('[data-radix-dialog-content]')
                              const dialogZIndex = dialogContent ? getComputedStyle(dialogContent as HTMLElement).zIndex : 'N/A'
                              console.log('🔍 [ManualTransactionModal] SelectContent (Intervalo) renderizado:', {
                                isDark,
                                backgroundColor: computed.backgroundColor,
                                color: computed.color,
                                borderColor: computed.borderColor,
                                zIndex: computed.zIndex,
                                dialogZIndex,
                                position: computed.position,
                              })
                            }
                          }}
                        >
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor por parcela: R$ {(parseFloat(formData.amount.replace(',', '.')) / formData.installmentCount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição da transação..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
            </form>
        </div>
      </DialogContent>
      {/* Modal de Transação Recorrente (acessível a partir do botão junto ao tipo) */}
      <Dialog open={isRecurringModalOpen} onOpenChange={setIsRecurringModalOpen}>
        <DialogContent className="z-[100002] bg-card text-card-foreground border border-border">
          <DialogHeader>
            <DialogTitle>Criar Transação Recorrente</DialogTitle>
            <DialogDescription>
              Configure uma transação que se repete automaticamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Tipo</Label>
              <Select 
                value={recurringFormData.type} 
                onValueChange={(value: any) => setRecurringFormData(prev => ({ ...prev, type: value, category: '' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100003]">
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Descrição</Label>
              <Input 
                placeholder="Ex: Assinatura, Internet..."
                value={recurringFormData.description}
                onChange={(e) => setRecurringFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Valor (R$)</Label>
              <Input 
                placeholder="0,00"
                value={recurringFormData.amount}
                onChange={(e) => setRecurringFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Categoria</Label>
              <Select 
                value={recurringFormData.category} 
                onValueChange={(value: any) => setRecurringFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64 z-[100003]">
                  {userCategories
                    .filter(cat => {
                      const catType = cat.type === 'income' ? 'income' : 'expense'
                      return catType === recurringFormData.type
                    })
                    .map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Intervalo</Label>
              <Select 
                value={recurringFormData.interval} 
                onValueChange={(value: any) => setRecurringFormData(prev => ({ ...prev, interval: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100003]">
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Início</Label>
                <Input 
                  type="date"
                  value={recurringFormData.startDate}
                  onChange={(e) => setRecurringFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id="hasEndDate"
                    type="checkbox"
                    className="rounded w-4 h-4 text-primary bg-background border-gray-300 focus:ring-primary"
                    checked={recurringFormData.hasEndDate}
                    onChange={(e) => setRecurringFormData(prev => ({ ...prev, hasEndDate: e.target.checked }))}
                  />
                  <Label htmlFor="hasEndDate" className="text-sm font-medium">Tem data de término?</Label>
                </div>
              </div>
            </div>

            {recurringFormData.hasEndDate && (
              <div>
                <Label className="text-sm font-medium">Término</Label>
                <Input 
                  type="date"
                  value={recurringFormData.endDate}
                  onChange={(e) => setRecurringFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsRecurringModalOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                if (!recurringFormData.description || !recurringFormData.amount) {
                  toast.error('Preencha descrição e valor')
                  return
                }
                try {
                  const supabase = createClient()
                  const startDate = new Date(recurringFormData.startDate)
                  const interval = recurringFormData.interval
                  let notes = `Recorrente - ${interval}`
                  if (recurringFormData.hasEndDate && recurringFormData.endDate) {
                    notes += ` | EndDate: ${recurringFormData.endDate}`
                  }

                  const { data: transaction, error } = await supabase
                    .from('financial_transactions')
                    .insert({
                      user_id: userId,
                      type: recurringFormData.type,
                      amount: parseFloat(recurringFormData.amount.replace(',', '.')),
                      description: recurringFormData.description,
                      category: recurringFormData.category,
                      date: getLocalDateStringFromDate(startDate),
                      scheduled_date: getLocalDateStringFromDate(startDate),
                      is_paid: false,
                      is_recurring: true,
                      recurring_interval: interval,
                      recurring_end_date: recurringFormData.hasEndDate && recurringFormData.endDate ? recurringFormData.endDate : null,
                      notes
                    })
                    .select()
                    .single()

                  if (error) throw error
                  toast.success('Transação recorrente criada com sucesso!')
                  setIsRecurringModalOpen(false)
                  onTransactionCreated()
                } catch (err) {
                  console.error('Erro ao criar recorrente:', err)
                  toast.error('Erro ao criar transação recorrente')
                }
              }}>Criar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}