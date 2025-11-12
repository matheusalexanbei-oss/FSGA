'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, FileText, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ProductListManager } from './ProductListManager'
import { ProductListItem, ListProcessingResult } from '@/lib/ai/listProcessor'
import { useStoreContext } from '@/hooks/useStoreContext'
import { CategoryInput } from './CategoryInput'

interface AIProductData {
  name: string
  description?: string
  category?: string
  price?: number
  confidence: number
}

interface AITextInputProps {
  onDataExtracted: (data: AIProductData) => void
  onDataExtractedList?: (products: ProductListItem[]) => void
  onListExtracted?: (products: ProductListItem[]) => void
  onCancel: () => void
}

export function AITextInput({ onDataExtracted, onDataExtractedList, onListExtracted, onCancel }: AITextInputProps) {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<AIProductData | null>(null)
  const [listResult, setListResult] = useState<ListProcessingResult | null>(null)
  const [profitMargin, setProfitMargin] = useState<number>(30) // Margem padrão de 30%
  const [editableData, setEditableData] = useState<AIProductData | null>(null)
  const { storeContext } = useStoreContext()

  const processWithAI = async () => {
    if (!inputText.trim()) {
      toast.error('Por favor, insira um texto para processar')
      return
    }

    setIsProcessing(true)
    
    try {
      console.log('🤖 Processando texto com Claude...')
      
      // Chamar nossa API route que usa Claude
      const response = await fetch('/api/ai/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          storeContext: storeContext
        })
      })
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido')
      }
      
      // Verificar se é uma lista ou produto único
      if (result.isList && result.data.products.length > 1) {
        console.log('📋 Lista de produtos detectada!')
        
        // Aplicar margem de lucro aos produtos da lista
        const productsWithMargin = result.data.products.map((product: { price: number; [key: string]: unknown }) => ({
          ...product,
          originalPrice: product.price,
          price: product.price ? product.price * (1 + profitMargin / 100) : 0
        }))
        
        const updatedListResult = {
          ...result.data,
          products: productsWithMargin
        }
        
        setListResult(updatedListResult)
        toast.success(`Lista detectada com ${result.data.totalItems} produtos!`)
      } else {
        console.log('🔍 Produto único detectado')
        
        // Aplicar margem de lucro ao produto único
        const productWithMargin = {
          ...result.data,
          originalPrice: result.data.price,
          price: result.data.price ? result.data.price * (1 + profitMargin / 100) : 0
        }
        
        setExtractedData(productWithMargin)
        setEditableData(productWithMargin) // Inicializar dados editáveis
        const confidencePercent = Math.round(result.data.confidence * 100)
        toast.success(`Dados extraídos com Claude! (${confidencePercent}% de confiança)`)
      }
      
      console.log('✅ Resultado:', result)
      
    } catch (error) {
      console.error('❌ Erro ao processar com Claude:', error)
      toast.error(`Erro ao processar texto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      
      // Fallback para dados de erro
      setExtractedData({
        name: 'Erro no processamento',
        description: 'Não foi possível processar o texto com Claude',
        category: 'Erro',
        price: 0,
        confidence: 0.1
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = () => {
    const dataToUse = editableData || extractedData
    if (dataToUse) {
      onDataExtracted(dataToUse)
    }
  }

  const handleConfirmList = (products: ProductListItem[]) => {
    console.log('🎯 handleConfirmList chamado com:', products)
    if (onListExtracted) {
      console.log('✅ Usando onListExtracted')
      onListExtracted(products)
    } else if (onDataExtractedList) {
      console.log('✅ Usando onDataExtractedList')
      onDataExtractedList(products)
    } else {
      console.log('❌ Nenhuma função de callback disponível!')
    }
  }

  const clearText = () => {
    setInputText('')
    setExtractedData(null)
    setListResult(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Cadastro Inteligente por Texto
          </CardTitle>
          <CardDescription>
            Cole ou digite informações sobre o produto e nossa IA irá extrair automaticamente os dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!extractedData && !listResult ? (
            <motion.div
              key="input-area"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Texto do Produto ou Lista
                </label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Exemplo: Anel de prata circular cravejado com pedras, R$ 150,00&#10;&#10;Ou uma lista:&#10;1. Pulseira trançada - R$ 80&#10;2. Brinco pendente dourado - R$ 120&#10;3. Corrente prateada - R$ 200"
                  className="min-h-[200px] resize-y"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Você pode colar uma lista de produtos, descrição de um produto, ou informações de uma nota fiscal
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4 border border-border">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Configuração de Preço
                </label>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Valor de custos + margem = valor de venda</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Number(e.target.value))}
                      min="0"
                      max="1000"
                      placeholder="0"
                      className="w-16 px-2 py-1 border border-border rounded text-xs text-center bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    />
                    <span className="text-xs text-muted-foreground">% margem</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={processWithAI}
                  disabled={isProcessing || !inputText.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      <span className="animate-pulse">Analisando com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Processar com IA
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Texto processado</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearText}
                >
                  Processar outro texto
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{inputText}</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Overlay de Loading */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-16 h-16 mb-4 text-purple-600"
            >
              <Sparkles className="h-16 w-16" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Analisando Texto com IA</h3>
            <p className="text-gray-600 mb-4">
              Nossa inteligência artificial está processando seu texto...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {listResult && listResult.isList ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProductListManager
              listResult={listResult}
              onConfirmAll={handleConfirmList}
              onCancel={onCancel}
            />
          </motion.div>
        ) : extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Dados Extraídos pela IA
                  <Badge variant="secondary" className="ml-auto">
                    {Math.round(extractedData.confidence * 100)}% confiança
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Revise os dados extraídos e confirme para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome do Produto</label>
                    <Input
                      value={editableData?.name || ''}
                      onChange={(e) => setEditableData(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Categoria</label>
                    <CategoryInput
                      value={editableData?.category || ''}
                      onChange={(categoryName) => setEditableData(prev => prev ? { ...prev, category: categoryName } : null)}
                      placeholder="Digite ou selecione uma categoria"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preço</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editableData?.price || 0}
                      onChange={(e) => setEditableData(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Confiança da IA</label>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${extractedData.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(extractedData.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Descrição</label>
                  <Input
                    value={editableData?.description || ''}
                    onChange={(e) => setEditableData(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="mt-1"
                    placeholder="Descrição do produto..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar e Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

