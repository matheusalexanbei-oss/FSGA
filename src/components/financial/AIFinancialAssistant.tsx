'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bot, Send, Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { AICommandResponse, ParsedCommand, AIUsageLimits } from '@/types/ai-chat'
import { useSupabase } from '@/hooks/useSupabase'

interface AIFinancialAssistantProps {
  userId: string
  userProducts?: any[]
  onTransactionCreated?: () => void
}

export function AIFinancialAssistant({ 
  userId, 
  userProducts = [], 
  onTransactionCreated 
}: AIFinancialAssistantProps) {
  const [command, setCommand] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<AICommandResponse | null>(null)
  const [usageInfo, setUsageInfo] = useState<AIUsageLimits | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { supabase, isLoading: supabaseLoading } = useSupabase()

  // Carregar informações de uso ao montar o componente
  useEffect(() => {
    if (!supabaseLoading && supabase && userId) {
      loadUsageInfo()
    }
  }, [userId, supabase, supabaseLoading])

  const loadUsageInfo = async () => {
    if (!supabase || !userId) return
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_ai_limits', { user_uuid: userId })

      if (error) throw error
      if (data && data.length > 0) {
        setUsageInfo(data[0])
      }
    } catch (err) {
      console.error('Erro ao carregar informações de uso:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setLastResponse(null)

    try {
      // Obter o token de sessão do Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Usuário não autenticado. Faça login novamente.')
        return
      }

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

      const data: AICommandResponse = await response.json()

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
      case 'sell': return 'bg-green-100 text-green-800'
      case 'buy': return 'bg-blue-100 text-blue-800'
      case 'expense': return 'bg-red-100 text-red-800'
      case 'income': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
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

  const handleConfirmTransaction = async (parsedCommand: ParsedCommand) => {
    if (!parsedCommand || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      // Aqui você pode implementar a lógica para registrar a transação
      // Por enquanto, vou apenas simular o sucesso
      
      if (parsedCommand.action === 'sell' && parsedCommand.productName) {
        // Atualizar estoque do produto
        const productToUpdate = userProducts.find(p => 
          p.name.toLowerCase().includes(parsedCommand.productName!.toLowerCase())
        )
        
        if (productToUpdate) {
          const { error } = await supabase
            .from('products')
            .update({ 
              stock_quantity: productToUpdate.stock_quantity - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', productToUpdate.id)

          if (error) throw error
        }
      }

      // Registrar transação financeira
      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: userId,
          type: parsedCommand.action === 'sell' ? 'income' : 
                parsedCommand.action === 'expense' ? 'expense' : 'income',
          amount: parsedCommand.amount || 0,
          description: `${parsedCommand.action === 'sell' ? 'Venda' : 'Transação'}: ${parsedCommand.productName || 'Produto'}`
        })

      if (transactionError) throw transactionError

      // Atualizar saldo em caixa
      if (parsedCommand.amount) {
        const { error: balanceError } = await supabase
          .from('users_profile')
          .update({
            cash_balance: parsedCommand.action === 'sell' ? 
              (await supabase.from('users_profile').select('cash_balance').eq('id', userId).single()).data?.cash_balance + parsedCommand.amount :
              (await supabase.from('users_profile').select('cash_balance').eq('id', userId).single()).data?.cash_balance - parsedCommand.amount
          })
          .eq('id', userId)

        if (balanceError) throw balanceError
      }

      // Limpar resposta e recarregar dados
      setLastResponse(null)
      await loadUsageInfo()
      if (onTransactionCreated) {
        onTransactionCreated()
      }

      // Mostrar sucesso
      setError(null)
      
    } catch (err) {
      console.error('Erro ao confirmar transação:', err)
      setError('Erro ao registrar transação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mostrar loading se Supabase ainda não estiver pronto */}
      {supabaseLoading && (
        <AnimatedCard delay={0} className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200/50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Carregando assistente...</p>
            </div>
          </CardContent>
        </AnimatedCard>
      )}

      {/* Conteúdo principal - só renderiza quando Supabase está pronto */}
      {!supabaseLoading && (
        <>
          {/* Informações de uso */}
          {usageInfo && (
        <AnimatedCard delay={0} className="bg-gradient-to-br from-blue-50 to-indigo-100/50 border-blue-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Limites de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-600">
                <span className="font-medium">{usageInfo.commands_used}</span> / {usageInfo.commands_limit} comandos usados
              </div>
              <Badge variant={usageInfo.can_use_ai ? "default" : "destructive"}>
                {usageInfo.subscription_plan === 'premium' ? 'Premium' : 'Gratuito'}
              </Badge>
            </div>
            {!usageInfo.can_use_ai && (
              <p className="text-xs text-red-600 mt-1">
                Limite atingido. Reset em: {new Date(usageInfo.reset_date).toLocaleDateString('pt-BR')}
              </p>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {/* Interface de comando */}
      <AnimatedCard delay={100} className="bg-gradient-to-br from-purple-50 to-pink-100/50 border-purple-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-purple-700 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Assistente Financeiro IA
          </CardTitle>
          <p className="text-sm text-purple-600">
            Digite comandos em português natural para registrar transações
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Ex: vendi um colar por 150 reais hoje"
                disabled={isLoading || (usageInfo && !usageInfo.can_use_ai)}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                Exemplos: "vendi produto X", "gastei 50 reais com compras", "recebi 200 reais"
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={!command.trim() || isLoading || (usageInfo && !usageInfo.can_use_ai)}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Comando
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </AnimatedCard>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resposta da IA */}
      {lastResponse && lastResponse.parsedCommand && (
        <AnimatedCard delay={200} className="bg-gradient-to-br from-green-50 to-emerald-100/50 border-green-200/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Comando Processado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getActionColor(lastResponse.parsedCommand.action)}>
                {getActionLabel(lastResponse.parsedCommand.action)}
              </Badge>
              <Badge variant="outline">
                Confiança: {Math.round((lastResponse.parsedCommand.confidence || 0) * 100)}%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lastResponse.parsedCommand.productName && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Produto</label>
                  <p className="text-sm">{lastResponse.parsedCommand.productName}</p>
                </div>
              )}

              {lastResponse.parsedCommand.amount && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Valor</label>
                  <p className="text-sm font-semibold">{formatCurrency(lastResponse.parsedCommand.amount)}</p>
                </div>
              )}

              {lastResponse.parsedCommand.date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Data</label>
                  <p className="text-sm">{new Date(lastResponse.parsedCommand.date).toLocaleDateString('pt-BR')}</p>
                </div>
              )}

              {lastResponse.parsedCommand.category && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Categoria</label>
                  <p className="text-sm">{lastResponse.parsedCommand.category}</p>
                </div>
              )}
            </div>

            {lastResponse.parsedCommand.paymentScheduled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pagamento agendado para: {lastResponse.parsedCommand.paymentDate}
                </AlertDescription>
              </Alert>
            )}

            {/* Produtos correspondentes */}
            {lastResponse.parsedCommand.productMatches && lastResponse.parsedCommand.productMatches.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Produtos Encontrados</label>
                <div className="space-y-2">
                  {lastResponse.parsedCommand.productMatches.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(product.price)} • Estoque: {product.stock_quantity}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {Math.round(product.confidence * 100)}% match
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Próximo passo:</strong> Confirme os dados acima para registrar a transação no sistema.
              </p>
              <Button 
                onClick={() => handleConfirmTransaction(lastResponse.parsedCommand!)}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar e Registrar Transação
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </AnimatedCard>
      )}
        </>
      )}
    </div>
  )
}
