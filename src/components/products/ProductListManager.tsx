'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Check, X, Plus, Edit3, Trash2, Tag, Image as ImageIcon } from 'lucide-react'
import { ProductListItem, ListProcessingResult } from '@/lib/ai/listProcessor'
import { createOrGetCategory, associateProductToCategory, getProductCategories, createHierarchicalCategory } from '@/lib/categories'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { ImageUpload } from './ImageUpload'

interface ProductListManagerProps {
  listResult: ListProcessingResult
  onConfirmAll: (products: ProductListItem[]) => void
  onCancel: () => void
}

export function ProductListManager({ listResult, onConfirmAll, onCancel }: ProductListManagerProps) {
  const [products, setProducts] = useState<ProductListItem[]>(listResult.products)
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState<string>('')
  const [productImages, setProductImages] = useState<Map<number, string>>(new Map())
  const { user } = useHybridAuth()

  const toggleProductSelection = (index: number) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedProducts(newSelected)
  }

  const updateProduct = (index: number, field: keyof ProductListItem, value: string | number) => {
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], [field]: value }
    setProducts(updatedProducts)
  }

  const startEditing = (index: number, field: string) => {
    setEditingIndex(index)
    setEditingField(field)
  }

  const finishEditing = () => {
    setEditingIndex(null)
    setEditingField(null)
  }

  const handleImageUpload = (index: number, imageUrl: string) => {
    const newImages = new Map(productImages)
    newImages.set(index, imageUrl)
    setProductImages(newImages)
    
    // Atualizar o produto com a imagem
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], image_url: imageUrl }
    setProducts(updatedProducts)
  }

  const handleImageRemove = (index: number) => {
    const newImages = new Map(productImages)
    newImages.delete(index)
    setProductImages(newImages)
    
    // Remover imagem do produto
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], image_url: undefined }
    setProducts(updatedProducts)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: keyof ProductListItem) => {
    if (e.key === 'Enter') {
      finishEditing()
    } else if (e.key === 'Escape') {
      finishEditing()
    }
  }

  const addCategoryToProduct = (index: number, categoryName: string) => {
    if (!categoryName.trim() || !user) return

    const updatedProducts = [...products]
    const product = updatedProducts[index]
    
    // Verificar se é categoria hierárquica (contém >)
    let categoryId: string
    if (categoryName.includes('>')) {
      categoryId = createHierarchicalCategory(categoryName.trim(), user.id)
    } else {
      categoryId = createOrGetCategory(categoryName.trim(), user.id)
    }
    
    // Adicionar categoria ao produto (se não existir)
    if (!product.categories) {
      product.categories = []
    }
    
    if (!product.categories.includes(categoryName.trim())) {
      product.categories.push(categoryName.trim())
      setProducts(updatedProducts)
      setNewCategory('')
    }
  }

  const removeCategoryFromProduct = (index: number, categoryName: string) => {
    const updatedProducts = [...products]
    const product = updatedProducts[index]
    
    if (product.categories) {
      product.categories = product.categories.filter(cat => cat !== categoryName)
      setProducts(updatedProducts)
    }
  }

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    setProducts(updatedProducts)
    
    // Atualizar seleção
    const newSelected = new Set<number>()
    selectedProducts.forEach(selectedIndex => {
      if (selectedIndex < index) {
        newSelected.add(selectedIndex)
      } else if (selectedIndex > index) {
        newSelected.add(selectedIndex - 1)
      }
    })
    setSelectedProducts(newSelected)
  }

  const selectAll = () => {
    setSelectedProducts(new Set(products.map((_, index) => index)))
  }

  const deselectAll = () => {
    setSelectedProducts(new Set())
  }

  const handleConfirmSelected = () => {
    const selectedProductsList = Array.from(selectedProducts).map(index => products[index])
    onConfirmAll(selectedProductsList)
  }

  const handleConfirmAll = () => {
    console.log('🔥 Botão "Cadastrar Todos" clicado!')
    console.log('📋 Produtos para cadastrar:', products)
    onConfirmAll(products)
  }

  return (
    <div className="space-y-6">
      {/* Header da Lista */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Lista de Produtos Identificada
              </CardTitle>
              <CardDescription>
                {listResult.summary} - {listResult.totalItems} produtos encontrados
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {products.length} produtos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={products.length === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Selecionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAll}
              disabled={selectedProducts.size === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Desmarcar Todos
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {selectedProducts.size > 0 && (
              <p>{selectedProducts.size} produto(s) selecionado(s)</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="grid gap-4">
        {products.map((product, index) => (
          <Card key={index} className={`transition-all ${selectedProducts.has(index) ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Nome do Produto */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome do Produto</label>
                    {editingIndex === index && editingField === 'name' ? (
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        onBlur={finishEditing}
                        onKeyDown={(e) => handleKeyDown(e, index, 'name')}
                        autoFocus
                      />
                    ) : (
                      <p 
                        className="font-medium cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                        onClick={() => startEditing(index, 'name')}
                      >
                        {product.name}
                      </p>
                    )}
                  </div>

                  {/* Informações do Produto */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="text-muted-foreground">Categorias</label>
                      <div className="space-y-2">
                        {/* Categorias existentes */}
                        <div className="flex flex-wrap gap-1">
                          {product.categories?.map((category, catIndex) => (
                            <Badge key={catIndex} variant="secondary" className="text-xs">
                              {category}
                              <button
                                onClick={() => removeCategoryFromProduct(index, category)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                          {product.category && !product.categories?.includes(product.category) && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                              <button
                                onClick={() => removeCategoryFromProduct(index, product.category!)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          )}
                        </div>
                        
                        {/* Adicionar nova categoria */}
                        <div className="space-y-1">
                          <Input
                            placeholder="Ex: Correntes &gt; Masculinas (para hierarquia)"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addCategoryToProduct(index, newCategory)
                              }
                            }}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addCategoryToProduct(index, newCategory)}
                              disabled={!newCategory.trim()}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setNewCategory('')}
                            >
                              Limpar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Preço</label>
                      {editingIndex === index && editingField === 'price' ? (
                        <input
                          type="number"
                          step="0.01"
                          value={product.price || 0}
                          onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          onBlur={finishEditing}
                          onKeyDown={(e) => handleKeyDown(e, index, 'price')}
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                          onClick={() => startEditing(index, 'price')}
                        >
                          {product.price && product.price > 0 ? (
                            <div>
                              <p className="font-medium">R$ {product.price.toFixed(2)}</p>
                              {product.originalPrice && product.originalPrice !== product.price && (
                                <p className="text-xs text-gray-500 line-through">
                                  Original: R$ {product.originalPrice.toFixed(2)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="font-medium">Não informado</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-muted-foreground">Quantidade</label>
                      {editingIndex === index && editingField === 'quantity' ? (
                        <input
                          type="number"
                          value={product.quantity || 1}
                          onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          onBlur={finishEditing}
                          onKeyDown={(e) => handleKeyDown(e, index, 'quantity')}
                          autoFocus
                        />
                      ) : (
                        <p 
                          className="font-medium cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                          onClick={() => startEditing(index, 'quantity')}
                        >
                          {product.quantity || 1}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-muted-foreground">Confiança</label>
                      <Badge variant={product.confidence > 0.7 ? 'default' : 'secondary'}>
                        {Math.round(product.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="text-sm text-muted-foreground">Descrição</label>
                    {editingIndex === index && editingField === 'description' ? (
                      <textarea
                        value={product.description || ''}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm min-h-[60px]"
                        onBlur={finishEditing}
                        onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                        autoFocus
                      />
                    ) : (
                      <p 
                        className="text-sm cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors min-h-[40px]"
                        onClick={() => startEditing(index, 'description')}
                      >
                        {product.description || 'Clique para adicionar descrição'}
                      </p>
                    )}
                  </div>

                  {/* Upload de Imagem */}
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Imagem do Produto
                    </label>
                    <div className="mt-2">
                      <ImageUpload
                        onImageUploaded={(imageUrl) => handleImageUpload(index, imageUrl)}
                        onImageRemoved={() => handleImageRemove(index)}
                        currentImageUrl={product.image_url}
                        disabled={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProductSelection(index)}
                    className={selectedProducts.has(index) ? 'bg-blue-100' : ''}
                  >
                    {selectedProducts.has(index) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingIndex(index)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        {selectedProducts.size > 0 && (
          <Button 
            onClick={handleConfirmSelected}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Cadastrar Selecionados ({selectedProducts.size})
          </Button>
        )}
        <Button onClick={handleConfirmAll}>
          Cadastrar Todos ({products.length})
        </Button>
      </div>
    </div>
  )
}
