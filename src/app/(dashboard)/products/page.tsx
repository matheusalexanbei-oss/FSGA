'use client'

import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { LoadingSpinner, ErrorDisplay, EmptyState } from '@/components/shared'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FolderGridLayout } from '@/components/products/FolderGridLayout'
import { Plus, Search, Filter, Package, FolderPlus, Trash2, Tag, Square, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Product } from '@/types/product'
import type { Category } from '@/lib/categories'
import { Skeleton } from '@/components/ui/skeleton'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { loadDataSmartly } from '@/lib/supabase/sync'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ProductEditDialog } from '@/components/products/ProductEditDialog'
import { MoveCategoryDialog } from '@/components/products/MoveCategoryDialog'
import { CategoryEditDialog } from '@/components/products/CategoryEditDialog'
import { DeleteCategoryDialog } from '@/components/products/DeleteCategoryDialog'
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog'
import { CreateCategoryDialog } from '@/components/products/CreateCategoryDialog'
import { moveProductsToCategory } from '@/lib/api/products'

export default function ProductsPage() {
  const { user, useSupabase } = useHybridAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [productToMove, setProductToMove] = useState<string | null>(null)
  const [categoryEditDialogOpen, setCategoryEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isBulkDelete, setIsBulkDelete] = useState(false)
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false)

  // Função para carregar dados
  const loadData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      if (useSupabase) {
        // Usar SmartLoader para carregar dados do Supabase
        const data = await loadDataSmartly(user.id)
        setProducts(data.products || [])
        setCategories(data.categories || [])
      } else {
        // Carregar do localStorage
        const storedProducts = localStorage.getItem(`products_${user.id}`)
        const storedCategories = localStorage.getItem(`categories_${user.id}`)
        
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts))
        }
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar dados dos produtos. Tente novamente.')
      toast.error('Erro ao carregar dados dos produtos')
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Escutar eventos de atualização do bot
  useEffect(() => {
    const handleProductUpdate = (event?: any) => {
      if (user?.id) {
        // Se o evento contém dados do produto atualizado, atualizar diretamente
        if (event?.detail?.product) {
          const updatedProduct = event.detail.product
          setProducts(prevProducts => {
            const existingIndex = prevProducts.findIndex(p => p.id === updatedProduct.id)
            if (existingIndex >= 0) {
              // Atualizar produto existente
              const newProducts = [...prevProducts]
              newProducts[existingIndex] = updatedProduct
              return newProducts
            } else {
              // Produto não encontrado, recarregar tudo
              loadData()
              return prevProducts
            }
          })
        } else {
          // Sem dados específicos, recarregar tudo
          loadData()
        }
      }
    }

    window.addEventListener('product-updated', handleProductUpdate)

    return () => {
      window.removeEventListener('product-updated', handleProductUpdate)
    }
  }, [user?.id, useSupabase])

  // Função para retry
  const handleRetry = () => {
    setError(null)
    setLoading(true)
    if (user?.id) {
      const loadData = async () => {
        try {
          if (useSupabase) {
            const data = await loadDataSmartly(user.id)
            setProducts(data.products || [])
            setCategories(data.categories || [])
          } else {
            const storedProducts = localStorage.getItem(`products_${user.id}`)
            const storedCategories = localStorage.getItem(`categories_${user.id}`)
            
            if (storedProducts) {
              setProducts(JSON.parse(storedProducts))
            }
            if (storedCategories) {
              setCategories(JSON.parse(storedCategories))
            }
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error)
          setError('Erro ao carregar dados dos produtos. Tente novamente.')
        } finally {
          setLoading(false)
        }
      }
      loadData()
    }
  }

  // Filtrar produtos
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtrar categorias que têm produtos correspondentes à pesquisa
  const filteredCategories = searchTerm.trim() ? categories.filter(category => {
    const categoryProducts = products.filter(product => product.category_id === category.id)
    return categoryProducts.some(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }) : categories

  // Toggle seleção de produto
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Toggle modo bulk
  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode)
    if (isBulkMode) {
      setSelectedProducts([])
    }
  }

  // Editar produto
  const handleProductEdit = (product: Product) => {
    setProductToEdit(product)
    setEditDialogOpen(true)
  }

  // Salvar edição do produto
  const handleProductEditSave = (updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    )
    setEditDialogOpen(false)
    setProductToEdit(null)
    toast.success('Produto atualizado com sucesso!')
  }

  // Deletar produto
  const handleProductDeleteClick = (productId: string) => {
    setProductToDelete(productId)
    setIsBulkDelete(false)
    setDeleteProductDialogOpen(true)
  }

  const handleProductDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      if (useSupabase) {
        const supabase = createClient()
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productToDelete)

        if (error) {
          console.error('Erro ao deletar produto:', error)
          toast.error('Erro ao deletar produto')
          return
        }
      } else {
        // Deletar do localStorage
        const updatedProducts = products.filter(p => p.id !== productToDelete)
        localStorage.setItem(`products_${user?.id}`, JSON.stringify(updatedProducts))
      }

      setProducts(prev => prev.filter(p => p.id !== productToDelete))
      toast.success('Produto deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      toast.error('Erro ao deletar produto')
    } finally {
      setDeleteProductDialogOpen(false)
      setProductToDelete(null)
    }
  }

  // Mover produto
  const handleProductMove = async (productId: string, categoryId: string | null) => {
    try {
      const result = await moveProductsToCategory([productId], categoryId, useSupabase)
      
      if (result.success) {
        setProducts(prev => 
          prev.map(p => 
            p.id === productId ? { ...p, category_id: categoryId } : p
          )
        )
        
        // Buscar nome da categoria e produto
        const category = categoryId ? categories.find(c => c.id === categoryId) : null
        const categoryName = category?.name || 'sem categoria'
        const product = products.find(p => p.id === productId)
        const productName = product?.name || 'Produto'
        
        toast.success(`"${productName}" movido para "${categoryName}" com sucesso!`)
      } else {
        toast.error(result.error || 'Erro ao mover produto')
      }
    } catch (error) {
      console.error('Erro ao mover produto:', error)
      toast.error('Erro ao mover produto')
    }
  }

  // Abrir dialog de seleção de categoria para mover produto
  const handleProductMoveDialog = (productId: string) => {
    setProductToMove(productId)
    setMoveDialogOpen(true)
  }

  // Confirmar movimento de produto
  const handleMoveConfirm = async (categoryId: string) => {
    if (selectedProducts.length > 0) {
      // Mover produtos selecionados
      await addCategoryToSelectedProducts(categoryId)
      // Toast já é mostrado dentro de addCategoryToSelectedProducts
    } else if (productToMove) {
      // Mover produto individual
      await handleProductMove(productToMove, categoryId)
      // Toast já é mostrado dentro de handleProductMove
    }
    
    setMoveDialogOpen(false)
    setProductToMove(null)
  }

  // Mover produtos selecionados em massa
  const handleBulkMove = () => {
    if (selectedProducts.length === 0) {
      toast.error('Selecione pelo menos um produto')
      return
    }
    setMoveDialogOpen(true)
  }

  // Deletar produtos selecionados
  const deleteSelectedProductsHandler = () => {
    if (selectedProducts.length === 0) return
    setIsBulkDelete(true)
    setDeleteProductDialogOpen(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedProducts.length === 0) return

    try {
      // Salvar quantidade antes de limpar
      const count = selectedProducts.length
      
      if (useSupabase) {
        const supabase = createClient()
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', selectedProducts)

        if (error) {
          console.error('Erro ao deletar produtos:', error)
          toast.error('Erro ao deletar produtos')
          return
        }
      } else {
        // Deletar do localStorage
        const updatedProducts = products.filter(p => !selectedProducts.includes(p.id))
        localStorage.setItem(`products_${user?.id}`, JSON.stringify(updatedProducts))
      }

      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)))
      setSelectedProducts([])
      setIsBulkMode(false)
      
      toast.success(`${count} produto(s) excluído(s) com sucesso!`)
    } catch (error) {
      console.error('Erro ao deletar produtos:', error)
      toast.error('Erro ao deletar produtos')
    } finally {
      setDeleteProductDialogOpen(false)
      setIsBulkDelete(false)
    }
  }

  // Adicionar categoria aos produtos selecionados
  const addCategoryToSelectedProducts = async (categoryId: string | null) => {
    if (selectedProducts.length === 0) return

    try {
      // Salvar quantidade antes de limpar
      const count = selectedProducts.length
      const result = await moveProductsToCategory(selectedProducts, categoryId, useSupabase)
      
      if (result.success) {
        setProducts(prev => 
          prev.map(p => 
            selectedProducts.includes(p.id) ? { ...p, category_id: categoryId } : p
          )
        )
        setSelectedProducts([])
        setIsBulkMode(false)
        
        // Buscar nome da categoria
        const category = categoryId ? categories.find(c => c.id === categoryId) : null
        const categoryName = category?.name || 'sem categoria'
        toast.success(`${count} produto(s) movido(s) para "${categoryName}" com sucesso!`)
      } else {
        toast.error(result.error || 'Erro ao mover produtos')
      }
    } catch (error) {
      console.error('Erro ao mover produtos:', error)
      toast.error('Erro ao mover produtos')
    }
  }

  // Selecionar categoria
  const handleCategorySelect = async (categoryId: string | null) => {
    await addCategoryToSelectedProducts(categoryId)
  }

  // Criar nova categoria
  const createNewCategoryHandler = async (categoryName: string): Promise<string | null> => {
    if (!categoryName.trim() || !user?.id) return null
    
    try {
      if (useSupabase) {
        // Criar categoria no Supabase
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: categoryName.trim(),
            description: null,
            user_id: user.id,
          } as any)
          .select()
          .single()

        if (error) {
          console.error('❌ Erro ao criar categoria no Supabase:', error)
          toast.error('Erro ao criar categoria: ' + error.message)
          return null
        }

        console.log('✅ Categoria criada no Supabase:', data)
        toast.success(`Categoria "${categoryName}" criada com sucesso!`)
        
        // Recarregar categorias para incluir a nova
        await loadDataSmartly(user.id).then(data => {
          setCategories(data.categories || [])
        })
        
        return (data as any)?.id
      } else {
        // Criar categoria no localStorage (modo offline)
        const newCategory: Category = {
          id: 'cat_' + Date.now(),
          name: categoryName.trim(),
          description: null,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const updatedCategories = [...categories, newCategory]
        localStorage.setItem(`categories_${user.id}`, JSON.stringify(updatedCategories))
        setCategories(updatedCategories)
        toast.success(`Categoria "${categoryName}" criada com sucesso!`)
        return newCategory.id
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Erro ao criar categoria')
      return null
    }
  }

  // Carregar categorias
  const loadCategories = async () => {
    if (!user?.id) return
    
    try {
      if (useSupabase) {
        // Carregar categorias do Supabase
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        if (error) {
          console.error('❌ Erro ao carregar categorias do Supabase:', error)
          return
        }

        setCategories((data || []) as Category[])
        console.log(`✅ ${data?.length || 0} categorias carregadas do Supabase`)
      } else {
        // Carregar categorias do localStorage
        const storedCategories = localStorage.getItem(`categories_${user.id}`)
        if (storedCategories) {
          const categoriesData: Category[] = JSON.parse(storedCategories)
          setCategories(categoriesData)
          console.log(`✅ ${categoriesData.length} categorias carregadas do localStorage`)
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  const handleCategoryEdit = (category: Category) => {
    setCategoryToEdit(category)
    setCategoryEditDialogOpen(true)
  }

  const handleCategoryEditConfirm = async (newName: string) => {
    if (!categoryToEdit) return
    
    try {
      if (useSupabase) {
        const supabase = createClient()
        const { error } = await supabase
          .from('categories')
          .update({ name: newName })
          .eq('id', categoryToEdit.id)
          .eq('user_id', user?.id || '')

        if (error) {
          console.error('Erro ao editar categoria:', error)
          toast.error('Erro ao editar categoria')
        } else {
          toast.success('Categoria editada com sucesso!')
          loadCategories()
        }
      }
    } catch (error) {
      console.error('Erro ao editar categoria:', error)
      toast.error('Erro ao editar categoria')
    }
  }

  const handleCategoryDeleteClick = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return
    setCategoryToDelete(category)
    setDeleteCategoryDialogOpen(true)
  }

  const handleCategoryDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      if (useSupabase) {
        const supabase = createClient()
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryToDelete.id)
          .eq('user_id', user?.id || '')

        if (error) {
          console.error('Erro ao excluir categoria:', error)
          toast.error('Erro ao excluir categoria')
        } else {
          toast.success('Categoria excluída com sucesso!')
          loadCategories()
        }
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      toast.error('Erro ao excluir categoria')
    } finally {
      setDeleteCategoryDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  // Criar nova categoria
  const handleCreateCategory = async (categoryName: string): Promise<string | null> => {
    try {
      if (useSupabase && user?.id) {
        const supabase = createClient()
        
        // Verificar se já existe uma categoria com esse nome
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName.trim())
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (existing) {
          toast.error('Já existe uma categoria com esse nome')
          return existing.id
        }
        
        // Criar nova categoria
        const { data, error } = await supabase
          .from('categories')
          .insert({ 
            name: categoryName.trim(),
            user_id: user.id 
          })
          .select()
          .single()
        
        if (error) {
          console.error('Erro ao criar categoria:', error)
          toast.error('Erro ao criar categoria')
          return null
        }
        
        // Recarregar categorias
        await loadCategories()
        
        toast.success(`Categoria "${categoryName}" criada com sucesso!`)
        return data.id
      }
      
      return null
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      toast.error('Erro ao criar categoria')
      return null
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Produtos
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie seu inventário completo com inteligência artificial
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/products/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 border-0">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => setCreateCategoryDialogOpen(true)}
              className="bg-blue-400 hover:bg-blue-500 text-white border-blue-400 hover:border-blue-500 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
            <Link href="/products/new?ai=true">
              <Button variant="outline" className="bg-linear-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 border-0 shadow-lg transition-all duration-200">
                <Sparkles className="h-4 w-4 mr-2" />
                Cadastrar com IA
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={toggleBulkMode}
              className={`transition-all duration-200 ${isBulkMode ? 'bg-primary/10 border-primary/50 text-primary' : ''}`}
            >
              <Square className="h-4 w-4 mr-2" />
              {isBulkMode ? 'Cancelar' : 'Selecionar'}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar produtos por nome, código ou categoria..."
              className="pl-10 bg-background dark:bg-gray-800 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="hover:bg-primary/10 transition-all duration-200">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Bulk Actions */}
        {isBulkMode && selectedProducts.length > 0 && (
          <AnimatedCard className="border-primary/20 bg-linear-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">
                      {selectedProducts.length} produto(s) selecionado(s)
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProducts([])}
                    className="hover:bg-primary/10 transition-all duration-200"
                  >
                    Desmarcar todos
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMove}
                    className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Mover
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedProductsHandler}
                    className="hover:bg-red-600 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="Carregando produtos..." />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorDisplay
            title="Erro ao carregar dados"
            message={error}
            onRetry={handleRetry}
          />
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && filteredCategories.length === 0 && (
          <EmptyState
            icon={Package}
            title="Nenhum produto encontrado"
            description="Comece adicionando seu primeiro produto ou importe de uma imagem com IA para começar a organizar seu inventário."
            actionLabel="Adicionar Produto"
            onAction={() => window.location.href = '/products/new'}
          />
        )}

        {/* Products Grid */}
        {!loading && !error && (filteredProducts.length > 0 || filteredCategories.length > 0) && (
          <FolderGridLayout
            products={filteredProducts}
            categories={filteredCategories}
            selectedProducts={new Set(selectedProducts)}
            toggleProductSelection={toggleProductSelection}
            isBulkMode={isBulkMode}
            onEdit={handleProductEdit}
            onDelete={handleProductDeleteClick}
            onMove={handleProductMoveDialog}
            onEditCategory={handleCategoryEdit}
            onDeleteCategory={handleCategoryDeleteClick}
            onToggleBulkMode={toggleBulkMode}
            onBulkEdit={() => {
              // Para edição em massa, abrir o primeiro produto selecionado
              if (selectedProducts.length > 0) {
                const firstProduct = products.find(p => selectedProducts.includes(p.id))
                if (firstProduct) {
                  handleProductEdit(firstProduct)
                }
              }
            }}
            onBulkDelete={deleteSelectedProductsHandler}
            onBulkMove={handleBulkMove}
          />
        )}

        {/* Legacy Empty State - manter como fallback */}
        {!loading && !error && false && (
          <div className="text-center p-12 border rounded-2xl bg-linear-to-br from-white to-gray-50/50 mt-6 shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Package className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Comece adicionando seu primeiro produto ou importe de uma imagem com IA para começar a organizar seu inventário.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/products/new">
                <Button className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </Link>
              <Link href="/products/new?ai=true">
                <Button variant="outline" className="bg-linear-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 border-0 shadow-lg transition-all duration-200">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Usar IA
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        {productToEdit && (
          <ProductEditDialog
            product={productToEdit}
            isOpen={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleProductEditSave}
          />
        )}

        {/* Move Category Dialog */}
        <MoveCategoryDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          onConfirm={handleMoveConfirm}
          categories={categories}
          selectedCount={selectedProducts.length > 0 ? selectedProducts.length : 1}
          onCreateCategory={handleCreateCategory}
        />

        {/* Category Edit Dialog */}
        {categoryToEdit && (
          <CategoryEditDialog
            key={categoryToEdit.id}
            open={categoryEditDialogOpen}
            onOpenChange={setCategoryEditDialogOpen}
            currentName={categoryToEdit.name}
            onConfirm={handleCategoryEditConfirm}
          />
        )}

        {/* Delete Category Dialog */}
        {categoryToDelete && (
          <DeleteCategoryDialog
            open={deleteCategoryDialogOpen}
            onOpenChange={setDeleteCategoryDialogOpen}
            categoryName={categoryToDelete.name}
            onConfirm={handleCategoryDeleteConfirm}
          />
        )}

        {/* Delete Product Dialog */}
        <DeleteProductDialog
          open={deleteProductDialogOpen}
          onOpenChange={setDeleteProductDialogOpen}
          productName={productToDelete ? products.find(p => p.id === productToDelete)?.name : undefined}
          isMultiple={isBulkDelete}
          count={isBulkDelete ? selectedProducts.length : 1}
          onConfirm={isBulkDelete ? handleBulkDeleteConfirm : handleProductDeleteConfirm}
        />

        {/* Create Category Dialog */}
        <CreateCategoryDialog
          open={createCategoryDialogOpen}
          onOpenChange={setCreateCategoryDialogOpen}
          onCreate={async (name: string) => {
            const categoryId = await handleCreateCategory(name)
            if (categoryId) {
              toast.success('Categoria criada com sucesso!')
            }
          }}
        />
      </div>
    </PageWrapper>
  )
}
