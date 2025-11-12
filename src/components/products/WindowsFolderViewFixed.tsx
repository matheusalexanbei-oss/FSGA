'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Folder, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category } from '@/lib/categories'
import { ProductMenu } from './ProductMenu'
import { CategoryMenu } from './CategoryMenu'
import { Product } from '@/types/product'

interface WindowsFolderViewProps {
  products: Product[]
  categories: Category[]
  selectedProducts: Set<string>
  toggleProductSelection: (productId: string) => void
  isBulkMode: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onAddToCategory?: (productId: string) => void
  onDuplicate?: (product: Product) => void
  onView?: (product: Product) => void
  onEditCategory?: (category: Category) => void
  onDeleteCategory?: (categoryId: string) => void
}

export function WindowsFolderView({
  products,
  categories,
  selectedProducts,
  toggleProductSelection,
  isBulkMode,
  onEdit,
  onDelete,
  onAddToCategory,
  onDuplicate,
  onView,
  onEditCategory,
  onDeleteCategory
}: WindowsFolderViewProps) {
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const toggleFolder = (folderId: string) => {
    // Se a pasta já está aberta, fecha ela
    if (expandedFolder === folderId) {
      setExpandedFolder(null)
    } else {
      // Se outra pasta está aberta, fecha e abre a nova
      setExpandedFolder(folderId)
    }
  }

  const getCategoryStats = (categoryId: string) => {
    if (categoryId === 'all') {
      const total = products.length
      const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock_quantity), 0)
      return { total, totalValue }
    }

    const categoryProducts = products.filter(product => product.category_id === categoryId)
    const total = categoryProducts.length
    const totalValue = categoryProducts.reduce((sum, product) => sum + (product.price * product.stock_quantity), 0)
    return { total, totalValue }
  }

  const getProductsInCategory = (categoryId: string) => {
    if (categoryId === 'all') return products
    return products.filter(product => product.category_id === categoryId)
  }

  // Criar lista de pastas
  const folders = [
    {
      id: 'all',
      name: 'Todos os Produtos',
      icon: Folder,
      color: 'blue',
      stats: getCategoryStats('all')
    },
    ...categories.map(category => ({
      id: category.id,
      name: category.name,
      icon: Folder,
      color: 'orange',
      stats: getCategoryStats(category.id)
    }))
  ]

  return (
    <div className="space-y-4">
      {/* Grid de Pastas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {folders.map((folder) => (
          <div key={folder.id} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md relative ${
                  expandedFolder === folder.id
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleFolder(folder.id)}
              >
                {/* Menu da Categoria - apenas para categorias, não para "Todos os Produtos" */}
                {folder.id !== 'all' && onEditCategory && onDeleteCategory && (
                  <CategoryMenu
                    categoryId={folder.id}
                    categoryName={folder.name}
                    onEdit={() => {
                      const category = categories.find(c => c.id === folder.id)
                      if (category) onEditCategory(category)
                    }}
                    onDelete={() => onDeleteCategory(folder.id)}
                  />
                )}
                
                <CardContent className="p-6 text-center">
                  {/* Ícone da Pasta */}
                  <div className={`mx-auto mb-4 p-4 rounded-full ${
                    folder.color === 'blue' ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    <folder.icon className={`h-12 w-12 ${
                      folder.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
                    }`} />
                  </div>

                  {/* Nome da Pasta */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {folder.name}
                  </h3>

                  {/* Estatísticas */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      {folder.stats.total} produtos
                    </p>
                    <p className={`text-xs font-semibold ${
                      folder.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {formatPrice(folder.stats.totalValue)}
                    </p>
                  </div>

                  {/* Indicador de expansão */}
                  <div className="mt-3">
                    {expandedFolder === folder.id ? (
                      <ChevronDown className="h-4 w-4 text-gray-400 mx-auto" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 mx-auto" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Conteúdo da Pasta Expandida - Logo abaixo da pasta */}
            <AnimatePresence>
              {expandedFolder === folder.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Produtos em {folder.name}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedFolder(null)}
                      >
                        Fechar
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {getProductsInCategory(folder.id).map((product) => (
                        <div key={product.id} className="border rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer" onClick={() => selectedProducts.size > 0 && toggleProductSelection(product.id)}>
                          <div className="aspect-square bg-gray-100 rounded mb-1 flex items-center justify-center">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <h4 className="font-medium text-xs mb-1 line-clamp-2">{product.name}</h4>
                          <p className="text-xs text-gray-600 mb-1">{formatPrice(product.price)}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Qtd: {product.stock_quantity}</span>
                            {isBulkMode && (
                              <input
                                type="checkbox"
                                checked={selectedProducts.has(product.id)}
                                onChange={() => toggleProductSelection(product.id)}
                                className="rounded"
                              />
                            )}
                            {!isBulkMode && (
                              <ProductMenu
                                productId={product.id}
                                productName={product.name}
                                isSelected={selectedProducts.has(product.id)}
                                onEdit={() => onEdit?.(product)}
                                onDelete={() => onDelete?.(product.id)}
                                onSelect={() => toggleProductSelection(product.id)}
                                onAddToCategory={() => onAddToCategory?.(product.id)}
                                onDuplicate={() => onDuplicate?.(product)}
                                onView={() => onView?.(product)}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
