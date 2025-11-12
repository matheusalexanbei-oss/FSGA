'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Package, Folder, ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { getCategoryProducts, Category } from '@/lib/categories'
import { ProductMenu } from './ProductMenu'
import { Product } from '@/types/product'

interface CardsViewProps {
  products: Product[]
  categories: Category[]
  selectedProducts: Set<string>
  toggleProductSelection: (productId: string) => void
  isBulkMode: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onAddToCategory?: (productId: string) => void
}

export function CardsView({
  products,
  categories,
  selectedProducts,
  toggleProductSelection,
  isBulkMode,
  onEdit,
  onDelete,
  onAddToCategory
}: CardsViewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['all']))
  // const { user } = useHybridAuth() // Removido para evitar warning

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getCategoryStats = (categoryId: string) => {
    if (categoryId === 'all') {
      const total = products.length
      const totalValue = products.reduce((sum, product) => sum + (product.price * (product.stock_quantity || 0)), 0)
      return { total, totalValue }
    }

    const categoryProducts = products.filter(product => product.category_id === categoryId)
    const total = categoryProducts.length
    const totalValue = categoryProducts.reduce((sum, product) => sum + (product.price * (product.stock_quantity || 0)), 0)
    return { total, totalValue }
  }

  const getProductsInCategory = (categoryId: string) => {
    if (categoryId === 'all') return products
    return products.filter(product => product.category_id === categoryId)
  }

  return (
    <div className="space-y-6">
      {/* Card "Todos os Produtos" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg"
      >
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader 
            className="cursor-pointer pb-4"
            onClick={() => toggleFolder('all')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Todos os Produtos</CardTitle>
                  <CardDescription className="text-blue-100">
                    {getCategoryStats('all').total} produtos • {formatPrice(getCategoryStats('all').totalValue)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold text-lg">
                  {formatPrice(getCategoryStats('all').totalValue)}
                </span>
                {expandedFolders.has('all') ? (
                  <ChevronDown className="h-6 w-6 text-white" />
                ) : (
                  <ChevronRight className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </CardHeader>

          <AnimatePresence>
            {expandedFolders.has('all') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="pt-0">
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {products.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                            selectedProducts.has(product.id) ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                          } ${selectedProducts.size > 0 ? 'hover:border-blue-300' : ''}`}
                          onClick={() => selectedProducts.size > 0 && toggleProductSelection(product.id)}
                        >
                          <Card className="border-0 shadow-none cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardContent className="p-4" onClick={() => toggleProductSelection(product.id)}>
                              {/* Header com seleção */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <Checkbox
                                    checked={selectedProducts.has(product.id)}
                                    onCheckedChange={() => toggleProductSelection(product.id)}
                                    style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px' }}
                                  />
                                  {isBulkMode && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => toggleProductSelection(product.id)}
                                    >
                                      {selectedProducts.has(product.id) ? (
                                        <Minus className="h-4 w-4 text-blue-600" />
                                      ) : (
                                        <Plus className="h-4 w-4 text-gray-400" />
                                      )}
                                    </Button>
                                  )}
                                  <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                                    <p className="text-sm font-bold text-green-600">{formatPrice(product.price)}</p>
                                  </div>
                                </div>
                                <ProductMenu
                                  productId={product.id}
                                  productName={product.name}
                                  isSelected={selectedProducts.has(product.id)}
                                  onSelect={() => toggleProductSelection(product.id)}
                                  onEdit={() => onEdit?.(product)}
                                  onDelete={() => onDelete?.(product.id)}
                                  onAddToCategory={() => onAddToCategory?.(product.id)}
                                />
                              </div>

                              {product.description && (
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                              )}

                              {/* Tag de categoria - apenas para "Todos os Produtos" */}
                              {product.category && (
                                <div className="mb-3">
                                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    {product.category.name}
                                  </span>
                                </div>
                              )}

                              {/* Informações do produto */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Estoque:</span>
                                  <span className="font-medium">{product.stock_quantity || 0}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Valor Total:</span>
                                  <span className="font-medium text-green-600">
                                    {formatPrice(product.price * (product.stock_quantity || 0))}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum produto cadastrado</p>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Cards das Categorias */}
      {categories.map((category) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg"
        >
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader 
              className="cursor-pointer pb-4"
              onClick={() => toggleFolder(category.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Folder className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">{category.name}</CardTitle>
                    <CardDescription className="text-orange-100">
                      {getCategoryStats(category.id).total} produtos • {formatPrice(getCategoryStats(category.id).totalValue)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-lg">
                    {formatPrice(getCategoryStats(category.id).totalValue)}
                  </span>
                  {expandedFolders.has(category.id) ? (
                    <ChevronDown className="h-6 w-6 text-white" />
                  ) : (
                    <ChevronRight className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {expandedFolders.has(category.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="pt-0">
                    {getProductsInCategory(category.id).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getProductsInCategory(category.id).map((product) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                              selectedProducts.has(product.id) ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Card className="border-0 shadow-none">
                              <CardContent className="p-4">
                                {/* Header com seleção */}
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    {isBulkMode && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => toggleProductSelection(product.id)}
                                      >
                                        {selectedProducts.has(product.id) ? (
                                          <Minus className="h-4 w-4 text-orange-600" />
                                        ) : (
                                          <Plus className="h-4 w-4 text-gray-400" />
                                        )}
                                      </Button>
                                    )}
                                    <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                      <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                                      <p className="text-sm font-bold text-green-600">{formatPrice(product.price)}</p>
                                    </div>
                                  </div>
                                  <ProductMenu
                                    productId={product.id}
                                    productName={product.name}
                                    isSelected={selectedProducts.has(product.id)}
                                    onSelect={() => toggleProductSelection(product.id)}
                                    onEdit={() => onEdit?.(product)}
                                    onDelete={() => onDelete?.(product.id)}
                                    onAddToCategory={() => onAddToCategory?.(product.id)}
                                  />
                                </div>

                                {product.description && (
                                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                )}

                                {/* Informações do produto */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Estoque:</span>
                                    <span className="font-medium">{product.stock_quantity || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Valor Total:</span>
                                    <span className="font-medium text-green-600">
                                      {formatPrice(product.price * (product.stock_quantity || 0))}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum produto nesta categoria</p>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
