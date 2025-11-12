'use client'

import { useState, useEffect } from 'react'
import { Package, Folder, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { getProductCategories, getCategoryProducts, Category } from '@/lib/categories'
import { ProductMenu } from './ProductMenu'
import { Product } from '@/types/product'

interface FolderViewProps {
  products: Product[]
  categories: Category[]
  selectedProducts: Set<string>
  toggleProductSelection: (productId: string) => void
  isBulkMode: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onAddToCategory?: (productId: string) => void
}

export function FolderView({
  products,
  categories,
  selectedProducts,
  toggleProductSelection,
  isBulkMode,
  onEdit,
  onDelete,
  onAddToCategory
}: FolderViewProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [productCategories, setProductCategories] = useState<Record<string, Category[]>>({})
  const { user } = useHybridAuth()

  useEffect(() => {
    setLocalCategories(categories)
    
    if (!user) return

    // Carregar associações produto-categoria
    const associations: Record<string, Category[]> = {}
    products.forEach(product => {
      associations[product.id] = getProductCategories(product.id, user.id)
    })
    setProductCategories(associations)
  }, [user, products, categories])

  const toggleFolder = (categoryId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedFolders(newExpanded)
  }

  const getProductsInCategory = (categoryId: string): Product[] => {
    if (categoryId === 'all') return products
    
    const productIds = getCategoryProducts(categoryId, user?.id || '')
    return products.filter(product => productIds.includes(product.id))
  }

  const getCategoryStats = (categoryId: string) => {
    const categoryProducts = getProductsInCategory(categoryId)
    return {
      total: categoryProducts.length,
      totalValue: categoryProducts.reduce((sum, product) => sum + product.price, 0)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="space-y-4">
      {/* Card "Todos os Produtos" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl overflow-hidden"
      >
        <div 
          className="p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => toggleFolder('all')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Todos os Produtos</h3>
                <p className="text-sm text-blue-700">
                  {getCategoryStats('all').total} produtos • {formatPrice(getCategoryStats('all').totalValue)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-600">
                {formatPrice(getCategoryStats('all').totalValue)}
              </span>
              {expandedFolders.has('all') ? (
                <ChevronDown className="h-5 w-5 text-blue-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </div>
        </div>

        {/* Produtos da categoria "Todos" */}
        <AnimatePresence>
          {expandedFolders.has('all') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-blue-200 bg-white"
            >
              <div className="p-4">
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50 rounded-lg p-2 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {isBulkMode && (
                              <input
                                type="checkbox"
                                checked={selectedProducts.has(product.id)}
                                onChange={() => toggleProductSelection(product.id)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            )}
                            <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                              <p className="text-sm font-bold text-green-600">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                          <ProductMenu
                            productId={product.id}
                            productName={product.name}
                            isSelected={selectedProducts.has(product.id)}
                            onEdit={() => onEdit?.(product)}
                            onDelete={() => onDelete?.(product.id)}
                            onMove={() => onAddToCategory?.(product.id)}
                          />
                        </div>
                        
                        {product.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {productCategories[product.id]?.map((category) => (
                            <motion.span
                              key={category.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {category.name}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Nenhum produto cadastrado</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cards das Categorias */}
      {localCategories.map((category) => {
        const stats = getCategoryStats(category.id)
        const isExpanded = expandedFolders.has(category.id)
        
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-linear-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl overflow-hidden"
          >
            <div 
              className="p-4 cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => toggleFolder(category.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Folder className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900">{category.name}</h3>
                    <p className="text-sm text-orange-700">
                      {stats.total} produtos • {formatPrice(stats.totalValue)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-orange-600">
                    {formatPrice(stats.totalValue)}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-orange-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-orange-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Produtos da categoria */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-orange-200 bg-white"
                >
                  <div className="p-4">
                    {getProductsInCategory(category.id).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {getProductsInCategory(category.id).map((product) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-50 rounded-lg p-2 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                {isBulkMode && (
                                  <input
                                    type="checkbox"
                                    checked={selectedProducts.has(product.id)}
                                    onChange={() => toggleProductSelection(product.id)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                )}
                                <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                                  <p className="text-sm font-bold text-green-600">{formatPrice(product.price)}</p>
                                </div>
                              </div>
                              <ProductMenu
                                productId={product.id}
                                productName={product.name}
                                isSelected={selectedProducts.has(product.id)}
                                onEdit={() => onEdit?.(product)}
                                onDelete={() => onDelete?.(product.id)}
                                onMove={() => onAddToCategory?.(product.id)}
                              />
                            </div>
                            
                            {product.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {productCategories[product.id]?.map((category) => (
                                <motion.span
                                  key={category.id}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                                >
                                  {category.name}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Folder className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Nenhum produto nesta categoria</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}