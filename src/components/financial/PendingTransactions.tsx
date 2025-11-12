'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Clock, Plus, Edit2, Trash2, Calendar, Trash, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'

// Função auxiliar para converter Date para string local
function getLocalDateStringFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface PendingTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  scheduled_date: string
  is_paid: boolean
  is_installment?: boolean
  installment_number?: number
  installment_count?: number
  date: string
  product_id?: string
  created_at?: string
  installment_group_id?: string | null
  notes?: string | null
}

interface PendingTransactionsProps {
  userId: string
  onTransactionUpdated?: () => void
}

export function PendingTransactions({ userId, onTransactionUpdated }: PendingTransactionsProps) {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false)
  const [userCategories, setUserCategories] = useState<any[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [confirmDeleteInstallment, setConfirmDeleteInstallment] = useState<{
    open: boolean
    groupIndex: number | null
    group: any | null
  }>({ open: false, groupIndex: null, group: null })
  const [confirmDeleteRecurring, setConfirmDeleteRecurring] = useState<{
    open: boolean
    transactionId: string | null
  }>({ open: false, transactionId: null })
  const [recurringFormData, setRecurringFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    interval: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: getLocalDateString(),
    endDate: '',
    hasEndDate: false
  })

  useEffect(() => {
    if (userId) {
      loadPendingTransactions()
      loadCategories()
    }
  }, [userId])

  const loadCategories = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('user_categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) {
        console.log('🔍 Tabela user_categories não existe, usando categorias padrão')
        
        const defaultCategories = [
          { id: 'default-venda', name: 'Vendas', type: 'income', color: '#10B981' },
          { id: 'default-compra', name: 'Compras', type: 'expense', color: '#EF4444' },
          { id: 'default-impostos', name: 'Impostos', type: 'expense', color: '#F59E0B' },
          { id: 'default-taxas', name: 'Taxas', type: 'expense', color: '#8B5CF6' }
        ]
        
        setUserCategories(defaultCategories)
      } else {
        setUserCategories(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      
      const defaultCategories = [
        { id: 'default-venda', name: 'Vendas', type: 'income', color: '#10B981' },
        { id: 'default-compra', name: 'Compras', type: 'expense', color: '#EF4444' },
        { id: 'default-impostos', name: 'Impostos', type: 'expense', color: '#F59E0B' },
        { id: 'default-taxas', name: 'Taxas', type: 'expense', color: '#8B5CF6' }
      ]
      
      setUserCategories(defaultCategories)
    }
  }

  const loadPendingTransactions = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', userId)
        .is('is_paid', false)
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      // Converter para o tipo esperado, garantindo que description não seja null
      const transactions = (data || []).map(t => ({
        ...t,
        description: t.description || 'Sem descrição'
      }))
      setPendingTransactions(transactions as PendingTransaction[])
    } catch (error) {
      console.error('Erro ao carregar transações pendentes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Agrupar transações usando installment_group_id
  // Parcelas da mesma venda (mesmo installment_group_id) ficam agrupadas
  // Transações sem installment_group_id ou com valores diferentes ficam separadas
  const groupedTransactions = useMemo(() => {
    const grouped = new Map()
    
    pendingTransactions.forEach((transaction) => {
      let key: string
      
      // Se for parcela E tiver installment_group_id, usar esse ID para agrupar
      if (transaction.is_installment && transaction.installment_group_id) {
        // Usar o installment_group_id como chave - isso garante que parcelas da mesma venda fiquem juntas
        key = `installment-group-${transaction.installment_group_id}`
      } else {
        // Para transações não parceladas ou sem group_id: cada uma é independente
        // Usar ID da transação como chave única
        key = `single-${transaction.id}`
      }
      
      if (!grouped.has(key)) {
      // Extrair nome base do produto (remover informações de parcela)
      const baseName = transaction.description
        .replace(/^Venda - /i, '')
        .replace(/\s*\(\d+\/\d+\)\s*$/i, '')
        .replace(/\s*-\s*\d+\/\d+\s*$/i, '')
        .trim()
      
        grouped.set(key, {
          description: baseName || transaction.description,
          category: transaction.category,
          transactions: [],
          totalAmount: 0,
          isInstallment: transaction.is_installment || false,
          installmentGroupId: transaction.installment_group_id || null,
          // Adicionar identificador único para garantir separação
          uniqueId: transaction.id
        })
      }
      
      const group = grouped.get(key)
      group.transactions.push(transaction)
      group.totalAmount += transaction.amount
    })
    
    return Array.from(grouped.values())
  }, [pendingTransactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleCreateRecurring = async () => {
    if (!recurringFormData.description || !recurringFormData.amount) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const supabase = createClient()
      
      // Calcular próxima data baseado no intervalo
      const startDate = new Date(recurringFormData.startDate)
      let nextDate = new Date(startDate)
      
      switch (recurringFormData.interval) {
        case 'daily':
          nextDate.setDate(startDate.getDate() + 1)
          break
        case 'weekly':
          nextDate.setDate(startDate.getDate() + 7)
          break
        case 'monthly':
          nextDate.setMonth(startDate.getMonth() + 1)
          break
        case 'yearly':
          nextDate.setFullYear(startDate.getFullYear() + 1)
          break
      }

      // Montar notes com data de término se houver
      let notes = `Recorrente - ${recurringFormData.interval}`
      if (recurringFormData.hasEndDate && recurringFormData.endDate) {
        notes += ` | EndDate: ${recurringFormData.endDate}`
      }

      const { error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: userId,
          type: recurringFormData.type,
          amount: parseFloat(recurringFormData.amount.replace(',', '.')),
          description: recurringFormData.description,
          category: recurringFormData.category,
          date: getLocalDateStringFromDate(new Date(recurringFormData.startDate)),
          scheduled_date: getLocalDateStringFromDate(nextDate),
          is_paid: false,
          notes: notes
        })

      if (error) throw error

      toast.success('Transação recorrente criada com sucesso!')
      setIsRecurringModalOpen(false)
      setRecurringFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        interval: 'monthly',
        startDate: getLocalDateString(),
        endDate: '',
        hasEndDate: false
      })
      loadPendingTransactions()
      if (onTransactionUpdated) {
        onTransactionUpdated()
      }
    } catch (error) {
      console.error('Erro ao criar transação recorrente:', error)
      toast.error('Erro ao criar transação recorrente')
    }
  }

  const handleDeleteInstallmentGroup = async (groupIndex: number) => {
    const group = groupedTransactions[groupIndex]
    if (!group || !group.isInstallment) {
      toast.error('Este grupo não é um parcelamento')
      return
    }

    setConfirmDeleteInstallment({ open: true, groupIndex, group })
  }

  const confirmDeleteInstallmentAction = async () => {
    const { groupIndex, group } = confirmDeleteInstallment
    if (groupIndex === null || !group) return

    try {
      const supabase = createClient()
      
      const transactionIds = group.transactions.map((t: PendingTransaction) => t.id)
      
      const { error: deleteError } = await supabase
        .from('financial_transactions')
        .delete()
        .in('id', transactionIds)

      if (deleteError) throw deleteError

      toast.success(`${group.transactions.length} parcela(s) excluída(s) com sucesso!`)
      loadPendingTransactions()
      if (onTransactionUpdated) {
        onTransactionUpdated()
      }
    } catch (error) {
      console.error('Erro ao excluir parcelas:', error)
      toast.error('Erro ao excluir parcelas')
    }
  }

  const handleDeleteSingleTransaction = async (transactionId: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transactionId)
      
      if (error) throw error
      
      toast.success('Transação excluída com sucesso!')
      loadPendingTransactions()
      if (onTransactionUpdated) {
        onTransactionUpdated()
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      toast.error('Erro ao excluir transação')
    }
  }

  const handleDeleteRecurring = async (transactionId: string) => {
    setConfirmDeleteRecurring({ open: true, transactionId })
  }

  const confirmDeleteRecurringAction = async () => {
    const { transactionId } = confirmDeleteRecurring
    if (!transactionId) return

    try {
      const supabase = createClient()
      
      // Buscar a transação para obter os dados da série recorrente
      const { data: transaction, error: fetchError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (fetchError) throw fetchError

      // Verificar se é realmente recorrente
      const isRecurring = transaction.notes?.includes('Recorrente')
      if (!isRecurring) {
        toast.error('Esta transação não é recorrente')
        return
      }

      // Extrair informações da série recorrente
      const baseDescription = transaction.description
      const baseCategory = transaction.category
      const baseType = transaction.type

      // Buscar e excluir todas as transações da série recorrente
      const { data: recurringTransactions, error: searchError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', baseType)
        .eq('category', baseCategory || '')
        .like('description', `%${baseDescription || ''}%`)
        .is('is_paid', false)

      if (searchError) throw searchError

      if (recurringTransactions && recurringTransactions.length > 0) {
        const transactionIds = recurringTransactions.map(t => t.id)
        
        const { error: deleteError } = await supabase
          .from('financial_transactions')
          .delete()
          .in('id', transactionIds)

        if (deleteError) throw deleteError

        toast.success(`${recurringTransactions.length} transação(ões) recorrente(s) excluída(s) com sucesso!`)
        loadPendingTransactions()
        if (onTransactionUpdated) {
          onTransactionUpdated()
        }
      } else {
        toast.error('Nenhuma transação recorrente encontrada')
      }
    } catch (error) {
      console.error('Erro ao excluir transações recorrentes:', error)
      toast.error('Erro ao excluir transações recorrentes')
    }
  }

  const handleMarkAsPaid = async (transactionId: string) => {
    try {
      const supabase = createClient()
      
      // Buscar a transação para obter os dados
      const { data: transaction, error: fetchError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (fetchError) throw fetchError

      // Verificar se é recorrente
      const isRecurring = transaction.notes?.includes('Recorrente')
      const intervalMatch = transaction.notes?.match(/Recorrente - (\w+)/)
      const interval = intervalMatch ? intervalMatch[1] : null
      const endDate = transaction.notes?.match(/EndDate: (\d{4}-\d{2}-\d{2})/)?.[1]

      // Determinar a data correta para a transação confirmada
      // SEMPRE usar a data de hoje quando confirmar uma transação pendente
      // Usar função utilitária para garantir data local sem problemas de timezone
      const paymentDate = getLocalDateString()
      
      // Logs detalhados para debug de data
      const debugInfo = {
        transactionId,
        originalDate: transaction.date,
        scheduledDate: transaction.scheduled_date,
        paymentDate,
        now: new Date().toString(),
        nowISO: new Date().toISOString(),
        nowLocal: getLocalDateString(),
        nowUTC: new Date().toUTCString(),
        timezoneOffset: new Date().getTimezoneOffset(),
        localYear: new Date().getFullYear(),
        localMonth: new Date().getMonth() + 1,
        localDay: new Date().getDate(),
        localHours: new Date().getHours()
      }
      console.log('🔍 Confirmando transação - DEBUG DATA:', debugInfo)

      // Criar cópia da transação como paga (historico)
      const transactionToInsert = {
        ...transaction,
        id: undefined,
        date: paymentDate, // Usar a data correta determinada acima
        is_paid: true,
        scheduled_date: null,
        notes: null
      }
      
      console.log('🔍 Dados que serão inseridos no banco:', {
        date: transactionToInsert.date,
        type: transactionToInsert.type,
        amount: transactionToInsert.amount,
        description: transactionToInsert.description
      })
      
      const { data: insertedData, error: insertError } = await supabase
        .from('financial_transactions')
        .insert(transactionToInsert)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao inserir transação:', insertError)
        throw insertError
      }
      
      console.log('✅ Transação inserida com sucesso:', {
        insertedId: insertedData?.id,
        insertedDate: insertedData?.date,
        insertedCreatedAt: insertedData?.created_at
      })

      // Deletar a transação pendente original
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error

      // Se for recorrente e não passou da data de término, criar próxima
      if (isRecurring && interval && (!endDate || new Date() < new Date(endDate))) {
        // Usar a data de hoje como base para calcular a próxima data
        const currentDate = new Date()
        let nextDate = new Date(currentDate)
        
        switch (interval) {
          case 'daily':
            nextDate.setDate(currentDate.getDate() + 1)
            break
          case 'weekly':
            nextDate.setDate(currentDate.getDate() + 7)
            break
          case 'monthly':
            nextDate.setMonth(currentDate.getMonth() + 1)
            break
          case 'yearly':
            nextDate.setFullYear(currentDate.getFullYear() + 1)
            break
        }

        // Só criar se a próxima data não passar do término
        if (!endDate || nextDate < new Date(endDate)) {
          await supabase
            .from('financial_transactions')
            .insert({
              user_id: userId,
              type: transaction.type,
              amount: transaction.amount,
              description: transaction.description,
              category: transaction.category,
              date: transaction.date,
              scheduled_date: getLocalDateStringFromDate(nextDate),
              is_paid: false,
              notes: transaction.notes
            })
        }
      }

      // Atualizar saldo
      const { data: profile } = await supabase
        .from('users_profile')
        .select('cash_balance')
        .eq('id', userId)
        .single()

      if (profile && profile.cash_balance !== null) {
        const currentBalance = parseFloat(profile.cash_balance.toString())
        const newBalance = transaction.type === 'income' 
          ? currentBalance + transaction.amount 
          : currentBalance - transaction.amount
        
        const { error: balanceError } = await supabase
          .from('users_profile')
          .update({ cash_balance: newBalance })
          .eq('id', userId)

        if (balanceError) console.error('Erro ao atualizar saldo:', balanceError)
      }

      toast.success('Transação confirmada e movida para o histórico!')
      loadPendingTransactions()
      if (onTransactionUpdated) {
        onTransactionUpdated()
      }
    } catch (error) {
      console.error('Erro ao confirmar transação:', error)
      toast.error('Erro ao confirmar transação')
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }

  const getTypeLabel = (type: string) => {
    return type === 'income' ? 'Receita' : 'Despesa'
  }

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Transações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="relative pr-12">
          <DialogClose className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Clock className="w-5 h-5 text-primary" />
                Transações Pendentes
              </CardTitle>
              <CardDescription className="dark:text-gray-300">Transações agendadas e parcelas a receber</CardDescription>
            </div>
            {/* Botão de criar recorrente movido para o modal de Nova Transação */}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          {groupedTransactions.length > 0 ? (
            <div className="space-y-4">
              {groupedTransactions.map((group, idx) => {
                const isExpanded = expandedGroups.has(idx)
                return (
                  <div key={idx} className="border rounded-lg p-4 space-y-2 bg-card dark:bg-gray-800 dark:border-gray-700">
                    <div 
                      className="flex items-center justify-between mb-2 cursor-pointer hover:bg-muted/70 dark:hover:bg-muted -m-4 p-4 rounded-lg"
                      onClick={() => {
                        const newExpanded = new Set(expandedGroups)
                        if (isExpanded) {
                          newExpanded.delete(idx)
                        } else {
                          newExpanded.add(idx)
                        }
                        setExpandedGroups(newExpanded)
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg w-8 text-center">{isExpanded ? '−' : '+'}</span>
                        <div className="flex-1">
                          <p className="font-medium">{group.description}</p>
                          <p className="text-sm text-muted-foreground">{group.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatCurrency(group.totalAmount)}
                          </p>
                          <Badge variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                            {group.transactions.length} {group.transactions.length === 1 ? 'parcela' : 'parcelas'}
                          </Badge>
                        </div>
                        {group.isInstallment && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteInstallmentGroup(idx)
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            title="Excluir todas as parcelas pendentes"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="space-y-2">
                    {group.transactions.map((transaction: PendingTransaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/70 dark:bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-3 flex-1">
                          {transaction.is_installment && (
                            <Badge variant="outline" className="text-xs border-border bg-card">
                              Parcela {transaction.installment_number}/{transaction.installment_count}
                            </Badge>
                          )}
                          <Badge className={getTypeColor(transaction.type)}>
                            {getTypeLabel(transaction.type)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {transaction.scheduled_date && parseLocalDate(transaction.scheduled_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                               <div className="flex items-center gap-2">
                                 <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                   {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                 </span>
                                 <div className="flex items-center gap-1">
                                   <Button
                                     variant="default"
                                     size="sm"
                                     onClick={() => handleMarkAsPaid(transaction.id)}
                                     className="bg-green-600 hover:bg-green-700 text-white"
                                   >
                                     Confirmar
                                   </Button>
                                   {transaction.notes?.includes('Recorrente') && (
                                     <Button
                                       variant="destructive"
                                       size="sm"
                                       onClick={() => handleDeleteRecurring(transaction.id)}
                                       className="bg-red-600 hover:bg-red-700 text-white"
                                       title="Excluir série recorrente"
                                     >
                                       <Trash className="w-4 h-4" />
                                     </Button>
                                   )}
                                   {/* Botão de excluir para transações agendadas não parceladas */}
                                   {!transaction.is_installment && !transaction.notes?.includes('Recorrente') && (
                                     <Button
                                       variant="destructive"
                                       size="sm"
                                       onClick={() => handleDeleteSingleTransaction(transaction.id)}
                                       className="bg-red-600 hover:bg-red-700 text-white"
                                       title="Excluir transação agendada"
                                     >
                                       <Trash className="w-4 h-4" />
                                     </Button>
                                   )}
                                 </div>
                               </div>
                      </div>
                    ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mb-4 opacity-50" />
              <p>Nenhuma transação pendente</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Crie transações recorrentes ou parceladas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Transação Recorrente */}
      <Dialog open={isRecurringModalOpen} onOpenChange={setIsRecurringModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Transação Recorrente</DialogTitle>
            <DialogDescription>
              Configure uma transação que se repete automaticamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Tipo</Label>
              <Select 
                value={recurringFormData.type} 
                onValueChange={(value: any) => setRecurringFormData(prev => ({ ...prev, type: value, category: '' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                value={recurringFormData.description}
                onChange={(e) => setRecurringFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da transação"
              />
            </div>

            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={recurringFormData.amount}
                onChange={(e) => setRecurringFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <Select 
                value={recurringFormData.category} 
                onValueChange={(value: any) => setRecurringFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {userCategories
                    .filter(cat => {
                      const typeMatches = 
                        (cat.type === 'income' && recurringFormData.type === 'income') ||
                        (cat.type === 'expense' && recurringFormData.type === 'expense')
                      return typeMatches
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
              <Label>Intervalo</Label>
              <Select 
                value={recurringFormData.interval} 
                onValueChange={(value: any) => setRecurringFormData(prev => ({ ...prev, interval: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={recurringFormData.startDate}
                onChange={(e) => setRecurringFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasEndDate"
                checked={recurringFormData.hasEndDate}
                onChange={(e) => setRecurringFormData(prev => ({ ...prev, hasEndDate: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="hasEndDate" className="text-sm font-medium cursor-pointer">
                Definir data de término
              </Label>
            </div>

            {recurringFormData.hasEndDate && (
              <div>
                <Label>Data de Término</Label>
                <Input
                  type="date"
                  value={recurringFormData.endDate}
                  onChange={(e) => setRecurringFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsRecurringModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateRecurring}>
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação - Excluir Parcelas */}
      {confirmDeleteInstallment.group && (
        <ConfirmDialog
          open={confirmDeleteInstallment.open}
          onOpenChange={(open) => setConfirmDeleteInstallment(prev => ({ ...prev, open }))}
          title="Excluir Parcelas"
          description={`Tem certeza que deseja excluir TODAS as parcelas pendentes de "${confirmDeleteInstallment.group.description}"?\n\nTotal: ${formatCurrency(confirmDeleteInstallment.group.totalAmount)}\nParcelas: ${confirmDeleteInstallment.group.transactions.length}\n\nEsta ação não pode ser desfeita.`}
          confirmText="Excluir Parcelas"
          cancelText="Cancelar"
          variant="destructive"
          onConfirm={confirmDeleteInstallmentAction}
        />
      )}

      {/* Dialog de Confirmação - Excluir Recorrente */}
      <ConfirmDialog
        open={confirmDeleteRecurring.open}
        onOpenChange={(open) => setConfirmDeleteRecurring(prev => ({ ...prev, open }))}
        title="Excluir Transações Recorrentes"
        description="Tem certeza que deseja excluir TODAS as transações recorrentes desta série?\n\nEsta ação não pode ser desfeita."
        confirmText="Excluir Série"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteRecurringAction}
      />
    </>
  )
}
