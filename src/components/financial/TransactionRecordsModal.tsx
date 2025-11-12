'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Search, Filter, Download, Calendar, Edit2, Trash2, CheckSquare, Square, Trash } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { parseLocalDate, getLocalDateString } from '@/lib/utils'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string | null
  category: string | null
  category_id: string | null
  date: string
  created_at: string | null
  is_installment: boolean | null
  installment_count: number | null
  installment_number: number | null
  is_paid: boolean | null
}

interface TransactionRecordsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onTransactionUpdated?: () => void
  children?: React.ReactNode
}

export function TransactionRecordsModal({ isOpen, onClose, userId, onTransactionUpdated, children }: TransactionRecordsModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [userCategories, setUserCategories] = useState<any[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: ''
  })
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<{ open: boolean; transactionId: string | null }>({
    open: false,
    transactionId: null
  })

  // Utilitário: detectar se a transação é de venda possivelmente atrelada a produto
  const isSaleTransaction = (tx?: Transaction | null) => {
    if (!tx) return false
    const cat = (tx.category || '').toLowerCase()
    const desc = (tx.description || '').toLowerCase()
    return cat === 'venda' || cat === 'vendas' || desc.startsWith('venda -')
  }

  useEffect(() => {
    if (isOpen && userId) {
      Promise.all([loadTransactions(), loadCategories()])
    }
  }, [isOpen, userId])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, typeFilter, dateFilter, categoryFilter])

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
        
        // Usar categorias padrão se a tabela não existe
        const defaultCategories = [
          { id: 'default-venda', name: 'Venda', type: 'income', color: '#10B981' },
          { id: 'default-compra', name: 'Compra', type: 'expense', color: '#EF4444' },
          { id: 'default-impostos', name: 'Impostos', type: 'expense', color: '#F59E0B' },
          { id: 'default-taxas', name: 'Taxas', type: 'expense', color: '#8B5CF6' }
        ]
        
        setUserCategories(defaultCategories)
        return
      }
      
      setUserCategories(data || [])
      
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

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_paid', true) // Apenas transações pagas no histórico

      if (error) throw error
      
      // Ordenar por data de transação (mais recente primeiro)
      // IMPORTANTE: Parsear datas usando componentes locais para evitar problemas de UTC
      const sorted = (data || []).sort((a, b) => {
        const dateA = parseLocalDate(a.date).getTime()
        const dateB = parseLocalDate(b.date).getTime()
        // Se as datas forem iguais, ordenar por created_at (mais recente primeiro)
        if (dateA === dateB) {
          const createdA = new Date(b.created_at || b.date).getTime()
          const createdB = new Date(a.created_at || a.date).getTime()
          return createdB - createdA
        }
        return dateB - dateA // Mais recente primeiro
      })
      
      setTransactions(sorted)
      console.log('🔵 TransactionRecords: Transações carregadas:', data?.length || 0)
      
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      toast.error('Erro ao carregar histórico de transações')
    } finally {
      setIsLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Filtro por tipo de transação
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(t => 
        (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (t.category?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      )
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      const selectedCategory = userCategories.find(c => c.id === categoryFilter)
      if (selectedCategory) {
        filtered = filtered.filter(t => t.category === selectedCategory.name)
      }
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(t => {
        // Usar apenas a data sem hora para comparação
        // IMPORTANTE: Parsear data string YYYY-MM-DD usando componentes locais
        const [year, month, day] = t.date.split('-').map(Number)
        const transactionDate = new Date(year, month - 1, day) // Usar componentes locais, não UTC
        transactionDate.setHours(0, 0, 0, 0)
        
        switch (dateFilter) {
          case 'today':
            return transactionDate.getTime() === today.getTime()
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(today.getDate() - 7)
            return transactionDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(today.getMonth() - 1)
            return transactionDate >= monthAgo
          case 'year':
            const yearAgo = new Date(today)
            yearAgo.setFullYear(today.getFullYear() - 1)
            return transactionDate >= yearAgo
          default:
            return true
        }
      })
    }

    // Garantir ordenação por data mesmo após filtros (mais recente primeiro)
    // IMPORTANTE: Parsear datas usando componentes locais
    const parseDateString = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day) // Usar componentes locais
    }
    
    filtered.sort((a, b) => {
      const dateA = parseDateString(a.date).getTime()
      const dateB = parseDateString(b.date).getTime()
      // Se as datas forem iguais, ordenar por created_at (mais recente primeiro)
      if (dateA === dateB) {
        return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
      }
      return dateB - dateA // Mais recente primeiro
    })
    
    setFilteredTransactions(filtered)
  }

  const exportTransactions = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'],
      ...filteredTransactions.map(t => [
        parseLocalDate(t.date).toLocaleDateString('pt-BR'),
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.description,
        t.category,
        `R$ ${t.amount.toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transacoes_${getLocalDateString()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Transações exportadas com sucesso!')
  }

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  }

  const getTypeLabel = (type: string) => {
    return type === 'income' ? 'Receita' : 'Despesa'
  }

  const toggleTransactionSelection = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId)
    } else {
      newSelected.add(transactionId)
    }
    setSelectedTransactions(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) return
    setConfirmBulkDelete(true)
  }

  const confirmBulkDeleteAction = async () => {
    if (selectedTransactions.size === 0) return

    try {
      const supabase = createClient()
      
      // Calcular impacto no saldo
      let balanceImpact = 0
      for (const transactionId of selectedTransactions) {
        const transaction = filteredTransactions.find(t => t.id === transactionId)
        if (transaction) {
          balanceImpact += transaction.type === 'income' ? -transaction.amount : transaction.amount
        }
      }

      // Excluir transações
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .in('id', Array.from(selectedTransactions))

      if (error) throw error

      // Atualizar saldo
      if (balanceImpact !== 0) {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('cash_balance')
          .eq('id', userId)
          .single()

        if (profile && profile.cash_balance !== null) {
          const currentBalance = parseFloat(profile.cash_balance.toString())
          const newBalance = currentBalance + balanceImpact
          
          await supabase
            .from('users_profile')
            .update({ cash_balance: newBalance })
            .eq('id', userId)
        }
      }

      toast.success(`${selectedTransactions.size} transação(ões) excluída(s) com sucesso!`)
      setSelectedTransactions(new Set())
      setIsBulkMode(false)
      setConfirmBulkDelete(false)
      loadTransactions()
      if (onTransactionUpdated) {
        onTransactionUpdated()
      }
    } catch (error) {
      console.error('Erro ao excluir transações:', error)
      toast.error('Erro ao excluir transações')
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    console.log('🔧 Editando transação:', transaction)
    setEditingTransaction(transaction)
    setEditFormData({
      description: (transaction.description || '').replace(/^Venda - /i, ''),
      amount: transaction.amount.toString(),
      date: transaction.date,
      category: transaction.category || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingTransaction) return

    try {
      const supabase = createClient()
      
      // Buscar valor antigo
      const { data: oldTransaction } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('id', editingTransaction.id)
        .single()

      if (!oldTransaction) throw new Error('Transação não encontrada')

      // Calcular diferença
      const oldAmount = oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount
      const newAmount = editingTransaction.type === 'income' ? parseFloat(editFormData.amount) : -parseFloat(editFormData.amount)
      const difference = newAmount - oldAmount

      // Atualizar transação
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          description: editingTransaction.type === 'income' && editFormData.description ? `Venda - ${editFormData.description}` : editFormData.description,
          amount: parseFloat(editFormData.amount.replace(',', '.')),
          date: editFormData.date,
          category: editFormData.category
        })
        .eq('id', editingTransaction.id)

      if (error) throw error

      // Atualizar saldo em caixa manualmente
      if (Math.abs(difference) > 0.01) {
        // Buscar saldo atual
        const { data: profile } = await supabase
          .from('users_profile')
          .select('cash_balance')
          .eq('id', userId)
          .single()

        if (profile && profile.cash_balance !== null) {
          const newBalance = parseFloat(profile.cash_balance.toString()) + difference
          
          const { error: balanceError } = await supabase
            .from('users_profile')
            .update({ cash_balance: newBalance })
            .eq('id', userId)

          if (balanceError) console.error('Erro ao atualizar saldo:', balanceError)
        }
      }

      toast.success('Transação editada com sucesso!')
      setEditingTransaction(null)
      loadTransactions()
      if (onTransactionUpdated) {
        onTransactionUpdated()
      }
    } catch (error) {
      console.error('Erro ao editar transação:', error)
      toast.error('Erro ao editar transação')
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    setConfirmSingleDelete({ open: true, transactionId })
  }

  const confirmSingleDeleteAction = async () => {
    const { transactionId } = confirmSingleDelete
    if (!transactionId) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error

      toast.success('Transação excluída com sucesso!')
      setConfirmSingleDelete({ open: false, transactionId: null })
      loadTransactions()
      if (onTransactionUpdated) {
        onTransactionUpdated()
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      toast.error('Erro ao excluir transação')
    }
  }

    const cleanDescription = (description: string | null, category: string | null) => {
      // Remove a categoria da description se ela estiver duplicada
      let cleaned = description || ''
    
    // Se a description começa com "Venda -" e a categoria é "Vendas" ou "Venda", 
    // exibe apenas a parte depois de "Venda - "
    if ((category === 'Vendas' || category === 'Venda') && cleaned.startsWith('Venda -')) {
      cleaned = cleaned.replace(/^Venda - /, '')
    }
    
    // Remove parênteses para evitar duplicação
    cleaned = cleaned.split('(')[0].trim()
    
    return cleaned
  }

  if (!isOpen) return null

  const hasSaleInSelection = Array.from(selectedTransactions).some(id => {
    const tx = transactions.find(t => t.id === id)
    return isSaleTransaction(tx || null)
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="w-full max-w-[95vw] h-[90vh] flex gap-4">
        {/* Histórico de Transações */}
        <Card className="bg-card text-card-foreground shadow-xl relative z-[10000] flex-1 flex flex-col border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Histórico de Transações
            </CardTitle>
            <div className="flex items-center gap-2">
              {!isBulkMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkMode(true)}
                  disabled={isLoading}
                >
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Selecionar
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    disabled={isLoading}
                  >
                    {selectedTransactions.size === filteredTransactions.length ? (
                      <CheckSquare className="w-4 h-4 mr-1" />
                    ) : (
                      <Square className="w-4 h-4 mr-1" />
                    )}
                    {selectedTransactions.size === filteredTransactions.length ? 'Desmarcar' : 'Marcar'} Todas
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={selectedTransactions.size === 0 || isLoading}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Excluir ({selectedTransactions.size})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsBulkMode(false)
                      setSelectedTransactions(new Set())
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 overflow-y-auto flex-1">
          {/* Filtros */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <Input
                  placeholder="Buscar por descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background dark:bg-neutral-900 text-foreground dark:text-foreground border-border"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                <SelectItem value="all">Todas</SelectItem>
                {userCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">7 dias</SelectItem>
                <SelectItem value="month">30 dias</SelectItem>
                <SelectItem value="year">1 ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={exportTransactions} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Lista de Transações */}
          <div className="max-h-96 overflow-y-auto border border-border rounded-lg bg-card">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className={`p-4 hover:bg-muted/70 dark:hover:bg-muted bg-card ${
                      isBulkMode ? 'cursor-pointer' : ''
                    } ${selectedTransactions.has(transaction.id) ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 dark:border-blue-400' : ''}`}
                    onClick={() => isBulkMode && toggleTransactionSelection(transaction.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isBulkMode && (
                            <div className="flex items-center mr-2">
                              {selectedTransactions.has(transaction.id) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              )}
                            </div>
                          )}
                          <Badge className={getTypeColor(transaction.type)}>
                            {getTypeLabel(transaction.type)}
                          </Badge>
                          {transaction.is_installment && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                Parcela {transaction.installment_number}/{transaction.installment_count}
                              </Badge>
                              {!transaction.is_paid && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                                  Pendente
                                </Badge>
                              )}
                            </>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {parseLocalDate(transaction.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {cleanDescription(transaction.description, transaction.category)}
                          </p>
                        </div>
                        {transaction.is_installment && (transaction.installment_number || 0) > 1 && !transaction.is_paid && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            ⏰ Próximas parcelas agendadas
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                          </p>
                        </div>
                        {!isBulkMode && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTransaction(transaction)
                              }}
                              disabled={editingTransaction !== null}
                              title="Editar transação"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTransaction(transaction.id)
                              }}
                              disabled={editingTransaction !== null}
                              title="Excluir transação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p>Nenhuma transação encontrada</p>
                </div>
              </div>
            )}
          </div>

          {/* Resumo */}
          {filteredTransactions.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTransactions.length} transação(ões) encontrada(s)
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-green-600 dark:text-green-400">
                  Receitas: R$ {filteredTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </div>
                <div className="text-red-600 dark:text-red-400">
                  Despesas: R$ {filteredTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>
          )}
          </CardContent>
        </Card>

        {/* Transações Pendentes */}
        {children && (
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <Dialog open={editingTransaction !== null} onOpenChange={(open) => {
        console.log('🔧 Dialog onOpenChange:', open, 'editingTransaction:', editingTransaction)
        if (!open) setEditingTransaction(null)
      }}>
        <DialogContent className="z-[10002]">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Edite as informações da transação selecionada
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Descrição</Label>
                <Input
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da transação"
                />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Categoria"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingTransaction(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação - Exclusão Múltipla */}
      <Dialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <DialogContent className="sm:max-w-[425px] z-[10002]">
          <DialogHeader>
            <DialogTitle>Excluir Transações</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {selectedTransactions.size} transação(ões)?<br/><br/>
              Esta ação não pode ser desfeita.<br/>
              {hasSaleInSelection ? (
                <>
                  <br/>
                  <span className="text-amber-600 font-medium">Aviso:</span> transações de <strong>venda</strong> reduzem o estoque ao serem criadas, mas ao excluir a transação o estoque <strong>não</strong> é recomposto automaticamente.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmBulkDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDeleteAction}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação - Exclusão Individual */}
      <Dialog open={confirmSingleDelete.open} onOpenChange={(open) => setConfirmSingleDelete(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[425px] z-[10002]">
          <DialogHeader>
            <DialogTitle>Excluir Transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação?<br/><br/>
              Esta ação não pode ser desfeita.
              {(() => {
                const tx = transactions.find(t => t.id === confirmSingleDelete.transactionId)
                if (isSaleTransaction(tx || null)) {
                  return (
                    <>
                      <br/>
                      <span className="text-amber-600 font-medium">Aviso:</span> esta transação parece ser uma <strong>venda</strong>. Vendas reduzem o estoque ao serem criadas, mas ao excluir a transação o estoque <strong>não</strong> é recomposto automaticamente.
                    </>
                  )
                }
                return null
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmSingleDelete(prev => ({ ...prev, open: false }))}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmSingleDeleteAction}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
