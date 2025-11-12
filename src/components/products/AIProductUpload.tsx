'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sparkles, Upload, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Image from 'next/image'
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

interface AIProductUploadProps {
  onDataExtracted: (data: AIProductData) => void
  onDataExtractedList?: (products: ProductListItem[]) => void
  onListExtracted?: (products: ProductListItem[]) => void
  onCancel: () => void
}

export function AIProductUpload({ onDataExtracted, onDataExtractedList, onListExtracted, onCancel }: AIProductUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<AIProductData | null>(null)
  const [listResult, setListResult] = useState<ListProcessingResult | null>(null)
  const [profitMargin, setProfitMargin] = useState<number>(30) // Margem padrão de 30%
  const [editableData, setEditableData] = useState<AIProductData | null>(null)
  const { storeContext } = useStoreContext()

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      setUploadedFile(null)
      setPreview(null)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.')
      return
    }

    // Validate file size (max 10MB for AI processing)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 10MB para processamento com IA.')
      return
    }

    setUploadedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }, [handleFileChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const processWithAI = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    
    try {
      console.log('🤖 Processando imagem com Claude Vision...')
      
      // Criar FormData para enviar para a API
      const formData = new FormData()
      formData.append('image', uploadedFile)
      formData.append('storeContext', JSON.stringify(storeContext))
      
      // Chamar nossa API route que usa Claude
      const response = await fetch('/api/ai/process-image', {
        method: 'POST',
        body: formData
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
      toast.error(`Erro ao processar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      
      // Fallback para dados de erro
      setExtractedData({
        name: 'Erro no processamento',
        description: 'Não foi possível processar a imagem com Claude',
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
      // Adicionar a imagem ao produto único
      const productWithImage = {
        ...dataToUse,
        image_url: preview // Adicionar a URL da imagem
      }
      onDataExtracted(productWithImage)
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

  const removeFile = () => {
    setUploadedFile(null)
    setPreview(null)
    setExtractedData(null)
    setListResult(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Cadastro Inteligente com IA
          </CardTitle>
          <CardDescription>
            Faça upload de uma imagem do produto e nossa IA irá extrair automaticamente as informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedFile ? (
            <motion.div
              key="upload-area"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Formatos suportados: JPG, PNG, WEBP (máx. 10MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload-input"
              />
              <Button 
                variant="outline" 
                className="relative z-10"
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                Selecionar Imagem
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="preview-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white z-10"
                  onClick={removeFile}
                >
                  ×
                </Button>
                {preview && (
                  <Image
                    src={preview}
                    alt="Preview"
                    width={400}
                    height={400}
                    className="w-full max-w-md mx-auto rounded-lg border object-contain aspect-square"
                  />
                )}
              </div>

              <div className="space-y-4">
                {/* Configuração de Preço */}
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
                    disabled={isProcessing}
                    className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
            <h3 className="text-xl font-semibold mb-2">Analisando Imagem com IA</h3>
            <p className="text-gray-600 mb-4">
              Nossa inteligência artificial está processando sua imagem...
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
