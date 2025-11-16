'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ProductForm } from '@/components/products/ProductForm'
import { AIProductUpload } from '@/components/products/AIProductUpload'
import { AITextInput } from '@/components/products/AITextInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Package, Loader2, Image as ImageIcon, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { StoreContextConfig } from '@/components/products/StoreContextConfig'
import { createOrGetCategory } from '@/lib/categories'
import type { ProductListItem } from '@/lib/ai/listProcessor'
import { saveProductToSupabase, findOrCreateCategory } from '@/lib/supabase/sync'
import { checkForDuplicateProduct } from '@/lib/products/duplicate-check'
import { DuplicateProductDialog } from '@/components/products/DuplicateProductDialog'
import { createClient } from '@/lib/supabase/client'

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, useSupabase } = useHybridAuth()
  
  const [isProcessingList, setIsProcessingList] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'manual')
  const [activeAITab, setActiveAITab] = useState<'image' | 'text'>('image')
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  interface NewProductData {
    name: string
    description: string | null
    code: string | null
    price: number
    cost: number | null
    stock_quantity: number
    category_id: string | null
    user_id: string
    image_url: string | null
    ai_processed: boolean
  }
  const [duplicateProduct, setDuplicateProduct] = useState<import('@/types/product').Product | null>(null)
  const [pendingProductData, setPendingProductData] = useState<NewProductData | null>(null)
  const [pendingProductsQueue, setPendingProductsQueue] = useState<ProductListItem[]>([])
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  
  // Refs para garantir que o estado seja verificado corretamente
  const showDuplicateDialogRef = useRef(false)
  const pendingProductsQueueRef = useRef<ProductListItem[]>([])
  
  // Sincronizar refs com estado
  const updateShowDuplicateDialog = (value: boolean) => {
    showDuplicateDialogRef.current = value
    setShowDuplicateDialog(value)
  }
  
  const updatePendingProductsQueue = (value: ProductListItem[]) => {
    pendingProductsQueueRef.current = value
    setPendingProductsQueue(value)
  }

  const handleProductCreated = () => {
    toast.success('Produto cadastrado com sucesso!')
    router.push('/products')
  }

  const handleAIListExtracted = async (products: ProductListItem[], isResuming: boolean = false) => {
    setIsProcessingList(true)
    try {
      console.log('📋 Cadastrando lista de produtos:', products)
      if (!user?.id) {
        toast.error('Usuário não autenticado')
        return
      }

      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        console.log(`🔄 Cadastrando produto ${i + 1}/${products.length}:`, product.name)

        // Processar categorias se existirem
        let categoryId = null
        if (product.categories && product.categories.length > 0) {
          // Usar a primeira categoria encontrada
          const categoryName = product.categories[0]
          if (useSupabase) {
            // Buscar ou criar categoria no Supabase (evita duplicatas)
            const categoryResult = await findOrCreateCategory({
              user_id: user.id,
              name: categoryName,
              description: null
            })
            if (categoryResult.success && categoryResult.data) {
              categoryId = categoryResult.data.id
            }
          } else {
            categoryId = createOrGetCategory(categoryName, user.id)
          }
        } else if (product.category) {
          if (useSupabase) {
            // Buscar ou criar categoria no Supabase (evita duplicatas)
            const categoryResult = await findOrCreateCategory({
              user_id: user.id,
              name: product.category,
              description: null
            })
            if (categoryResult.success && categoryResult.data) {
              categoryId = categoryResult.data.id
            }
          } else {
            categoryId = createOrGetCategory(product.category, user.id)
          }
        }

        const productData = {
          name: product.name,
          description: product.description || null,
          code: null,
          price: product.price || 0,
          cost: null,
          stock_quantity: product.quantity || 1,
          category_id: categoryId,
          user_id: user.id,
          image_url: product.image_url || null,
          ai_processed: true
        }

        // Verificar duplicata ANTES de salvar
        const duplicate = await checkForDuplicateProduct(
          productData.name,
          productData.code,
          user.id,
          useSupabase
        )

        if (duplicate) {
          // Produto duplicado - pausar processamento e mostrar dialog
          console.log(`⚠️ Produto duplicado encontrado: ${product.name}`)
          console.log(`📦 Produtos restantes na fila: ${products.slice(i + 1).length}`)
          setDuplicateProduct(duplicate)
          setPendingProductData({ ...productData, categoryId, originalProduct: product })
          updatePendingProductsQueue(products.slice(i + 1))
          setCurrentProductIndex(i)
          updateShowDuplicateDialog(true)
          setIsProcessingList(false)
          return
        }

        // Não é duplicata - salvar normalmente
        await saveProduct(productData)
        
        // Pequeno delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Só mostrar mensagem de sucesso e redirecionar quando todos os produtos forem processados
      // Se não estiver retomando e não há diálogo de duplicata aberto, significa que todos foram processados
      // IMPORTANTE: Não redirecionar se há diálogo aberto ou produtos pendentes
      if (!isResuming && !showDuplicateDialogRef.current && pendingProductsQueueRef.current.length === 0) {
        // Verificar novamente após um pequeno delay para garantir que o estado seja atualizado
        setTimeout(() => {
          // Se ainda não há diálogo aberto e não há produtos pendentes, finalizar
          if (!showDuplicateDialogRef.current && pendingProductsQueueRef.current.length === 0) {
            toast.success(`${products.length} produto(s) cadastrado(s) com sucesso!`)
            setTimeout(() => {
              router.push('/products')
            }, 1000)
          }
        }, 500)
      }
    } catch (error) {
      console.error('❌ Erro ao cadastrar lista:', error)
      toast.error('Erro ao cadastrar produtos da lista')
    } finally {
      setIsProcessingList(false)
    }
  }

  // Função auxiliar para salvar produto
  const saveProduct = async (productData: NewProductData) => {
    if (useSupabase) {
      const result = await saveProductToSupabase(productData)
      if (result.success && result.data) {
        console.log(`✅ Produto "${productData.name}" salvo no Supabase`)
      } else {
        console.error(`❌ Erro ao salvar produto "${productData.name}" no Supabase:`, result.error)
        const errorMessage = result.error instanceof Error ? result.error.message : String(result.error) || 'Erro ao salvar produto'
        throw new Error(errorMessage)
      }
    } else {
      const storedProducts = localStorage.getItem(`products_${user!.id}`)
      const existingProducts = storedProducts ? JSON.parse(storedProducts) : []
      
      const newProduct = {
        ...productData,
        id: 'prod_' + Date.now() + '_' + Math.random(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      existingProducts.push(newProduct)
      localStorage.setItem(`products_${user!.id}`, JSON.stringify(existingProducts))
      console.log(`✅ Produto "${productData.name}" salvo no localStorage`)
    }
  }

  // Handler para opções do dialog de duplicata (cadastro por IA)
  const handleAIDuplicateOption = async (
    option: 'change-name' | 'add-code' | 'merge-stock',
    data?: { name?: string; code?: string }
  ) => {
    if (!pendingProductData || !duplicateProduct || !user) return

    updateShowDuplicateDialog(false)
    
    // Não definir isProcessingList como true aqui para evitar mostrar o loader
    // O estado será gerenciado dentro de handleAIListExtracted quando necessário

    try {
      let finalProductData = { ...pendingProductData }
      delete finalProductData.originalProduct
      delete finalProductData.categoryId

      if (option === 'change-name' && data?.name) {
        // Opção 1: Mudar nome
        finalProductData.name = data.name
        await saveProduct(finalProductData)
        toast.success(`Produto "${data.name}" cadastrado com sucesso!`)
      } else if (option === 'add-code' && data?.code) {
        // Opção 2: Adicionar código
        finalProductData.code = data.code
        await saveProduct(finalProductData)
        toast.success(`Produto "${finalProductData.name}" cadastrado com sucesso!`)
      } else if (option === 'merge-stock') {
        // Opção 3: Adicionar ao produto existente
        const newStock = duplicateProduct.stock_quantity + finalProductData.stock_quantity
        
        if (useSupabase) {
          const supabase = createClient()
          const { error } = await supabase
            .from('products')
            .update({
              stock_quantity: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', duplicateProduct.id)
            .eq('user_id', user.id)

          if (error) throw error
        } else {
          const storedProducts = localStorage.getItem(`products_${user.id}`)
          if (storedProducts) {
          const products = JSON.parse(storedProducts)
            const updatedProducts = products.map((p: import('@/types/product').Product) =>
              p.id === duplicateProduct.id
                ? { ...p, stock_quantity: newStock, updated_at: new Date().toISOString() }
                : p
            )
            localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
          }
        }
        
        toast.success(`${finalProductData.stock_quantity} unidade(s) adicionada(s) ao produto existente!`)
      }

      // Limpar os dados do produto atual que acabamos de processar
      const remainingQueue = [...pendingProductsQueueRef.current]
      setPendingProductData(null)
      setDuplicateProduct(null)

      // Continuar processando a fila de produtos pendentes
      if (remainingQueue.length > 0) {
        console.log(`🔄 Continuando processamento da fila com ${remainingQueue.length} produtos restantes`)
        // Limpar a fila antes de processar para evitar conflitos
        updatePendingProductsQueue([])
        // Continuar processamento - se encontrar duplicata, vai mostrar o diálogo novamente
        await handleAIListExtracted(remainingQueue, true)
        
        // Verificar se ainda há produtos pendentes ou diálogo aberto após processar
        // Usar um pequeno delay para garantir que o estado seja atualizado
        setTimeout(() => {
          // Se não há diálogo aberto e não há produtos pendentes, finalizar
          if (!showDuplicateDialogRef.current && pendingProductsQueueRef.current.length === 0) {
            toast.success('Todos os produtos foram processados!')
            setTimeout(() => {
              router.push('/products')
            }, 1000)
          }
          // Se há diálogo aberto, ele vai continuar o processamento quando o usuário escolher uma opção
        }, 500)
      } else {
        // Só quando realmente não houver mais produtos, redirecionar
        updatePendingProductsQueue([])
        toast.success('Todos os produtos foram processados!')
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/products')
      }
    } catch (error) {
      console.error('Error handling duplicate option:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar')
      // Limpar estado em caso de erro
      setPendingProductData(null)
      setDuplicateProduct(null)
      updatePendingProductsQueue([])
      updateShowDuplicateDialog(false)
      setIsProcessingList(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <PageWrapper>
        <div className="text-center p-10">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">Você precisa estar logado para adicionar produtos.</p>
          <Button onClick={() => router.push('/login')}>
            Fazer Login
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <>
      {duplicateProduct && (
        <DuplicateProductDialog
          isOpen={showDuplicateDialog}
          existingProduct={duplicateProduct}
          newProductName={pendingProductData?.name || ''}
          newProductStock={pendingProductData?.stock_quantity || 0}
          newProductPrice={pendingProductData?.price}
          onOptionSelected={handleAIDuplicateOption}
          onCancel={() => {
            setShowDuplicateDialog(false)
            updateShowDuplicateDialog(false)
            setPendingProductData(null)
            setDuplicateProduct(null)
            updatePendingProductsQueue([])
            setIsProcessingList(false)
            toast.info('Cadastro de produtos cancelado')
          }}
        />
      )}
      
      <PageWrapper>
        <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Novo Produto</h1>
          <p className="text-muted-foreground">
            Adicione um novo produto ao seu inventário
          </p>
        </motion.div>
      </div>

      {/* Configuração do Contexto da Loja - Topo Horizontal */}
      <div className="mb-8">
        <StoreContextConfig />
      </div>

      {/* Formulário Principal - Abaixo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Cadastro Manual
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Cadastro com IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro Manual</CardTitle>
              <CardDescription>
                Preencha os dados do produto manualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm onSuccess={handleProductCreated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Cadastro com Inteligência Artificial
              </CardTitle>
              <CardDescription>
                Escolha entre imagem ou texto para cadastrar produtos automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProcessingList ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Processando produtos...</h3>
                  <p className="text-muted-foreground">
                    Aguarde enquanto cadastramos os produtos extraídos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Tabs value={activeAITab} onValueChange={(value) => setActiveAITab(value as 'image' | 'text')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="image" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Por Imagem
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Por Texto
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="image" className="mt-4">
                      <AIProductUpload 
                        onListExtracted={handleAIListExtracted}
                        onDataExtracted={(data) => {
                          // Para produtos únicos, converter para lista
                          const product: ProductListItem = {
                            name: data.name,
                            description: data.description || '',
                            category: data.category || '',
                            price: data.price || 0,
                            quantity: 1,
                            confidence: data.confidence || 0.8
                          }
                          handleAIListExtracted([product])
                        }}
                        onCancel={() => {
                          toast.info('Cadastro com IA cancelado')
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="text" className="mt-4">
                      <AITextInput 
                        onListExtracted={handleAIListExtracted}
                        onDataExtracted={(data) => {
                          // Para produtos únicos, converter para lista
                          const product: ProductListItem = {
                            name: data.name,
                            description: data.description || '',
                            category: data.category || '',
                            price: data.price || 0,
                            quantity: 1,
                            confidence: data.confidence || 0.8
                          }
                          handleAIListExtracted([product])
                        }}
                        onCancel={() => {
                          toast.info('Cadastro com IA cancelado')
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </PageWrapper>
    </>
  )
}