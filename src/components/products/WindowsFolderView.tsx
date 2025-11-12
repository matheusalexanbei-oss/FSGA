'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Folder, ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { Category } from '@/lib/categories'
import { ProductMenu } from './ProductMenu'
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
}

export function WindowsFolderView({
  products,
  categories,
  selectedProducts,
  toggleProductSelection,
  isBulkMode,
  onEdit,
  onDelete,
  onAddToCategory
}: WindowsFolderViewProps) {
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null)
  // const { user } = useHybridAuth() // Removido para evitar warning

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolder(expandedFolder === folderId ? null : folderId)
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

  // Criar lista de pastas (categorias + "Todos os Produtos")
  const folders = [
    {
      id: 'all',
      name: 'Todos os Produtos',
      icon: Package,
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
    <div className="space-y-6">
      {/* Grid de Pastas - Estilo Windows Explorer */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {folders.map((folder, index) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative"
          >
            {/* Pasta */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                expandedFolder === folder.id 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleFolder(folder.id)}
            >
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
        ))}
      </div>

      {/* Conteúdo da Pasta Expandida */}
      <AnimatePresence>
        {expandedFolder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              {/* Header da Pasta Expandida */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    {(() => {
                      const folder = folders.find(f => f.id === expandedFolder)
                      const IconComponent = folder?.icon
                      return IconComponent ? <IconComponent className="h-8 w-8 text-blue-600" /> : null
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {folders.find(f => f.id === expandedFolder)?.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {getCategoryStats(expandedFolder).total} produtos • {formatPrice(getCategoryStats(expandedFolder).totalValue)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedFolder(null)}
                >
                  Fechar
                </Button>
              </div>

              {/* Grid de Produtos - Cards como no Windows */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {getProductsInCategory(expandedFolder).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                      selectedProducts.has(product.id) ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectedProducts.size > 0 && toggleProductSelection(product.id)}
                  >
                    <Card className="border-0 shadow-none">
                      <CardContent className="p-3">
                        {/* Header com seleção */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-1 flex-1 min-w-0">
                            {isBulkMode && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => toggleProductSelection(product.id)}
                              >
                                {selectedProducts.has(product.id) ? (
                                  <Minus className="h-3 w-3 text-blue-600" />
                                ) : (
                                  <Plus className="h-3 w-3 text-gray-400" />
                                )}
                              </Button>
                            )}
                            <Package className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
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

                        {/* Nome do Produto */}
                        <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Preço */}
                        <p className="text-sm font-bold text-green-600 mb-2">
                          {formatPrice(product.price)}
                        </p>

                        {/* Informações adicionais */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Estoque:</span>
                            <span className="font-medium">{product.stock_quantity || 0}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Total:</span>
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

              {/* Mensagem quando não há produtos */}
              {getProductsInCategory(expandedFolder).length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Pasta vazia</p>
                  <p className="text-gray-400 text-sm">Nenhum produto encontrado nesta categoria</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
