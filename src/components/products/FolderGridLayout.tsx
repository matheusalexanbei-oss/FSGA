'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Package, Folder, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category } from '@/lib/categories'
import { ProductMenu } from './ProductMenu'
import { CategoryMenu } from './CategoryMenu'
import { ProductImageGallery } from './ProductImageGallery'
import { Product } from '@/types/product'

interface FolderGridLayoutProps {
  products: Product[]
  categories: Category[]
  selectedProducts: Set<string>
  toggleProductSelection: (productId: string) => void
  isBulkMode: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onMove: (productId: string) => void
  onEditCategory?: (category: Category) => void
  onDeleteCategory?: (categoryId: string) => void
  onToggleBulkMode?: () => void
  // Props para ações em massa
  onBulkEdit?: () => void
  onBulkDelete?: () => void
  onBulkMove?: () => void
}

export function FolderGridLayout({
  products,
  categories,
  selectedProducts,
  toggleProductSelection,
  isBulkMode,
  onEdit,
  onDelete,
  onMove,
  onEditCategory,
  onDeleteCategory,
  onToggleBulkMode,
  onBulkEdit,
  onBulkDelete,
  onBulkMove
}: FolderGridLayoutProps) {
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null)

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
      color: 'light-blue',
      stats: getCategoryStats(category.id)
    }))
  ]

  return (
    <div className="space-y-4">
      {/* Grid de Pastas com Layout Flexível */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {folders.map((folder) => (
          <div key={folder.id} className="contents">
            {/* Pasta da Categoria */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md relative bg-card dark:bg-gray-950 border-gray-200 dark:border-gray-800 ${
                  expandedFolder === folder.id
                    ? 'border-blue-500 dark:border-blue-600 shadow-lg scale-105' 
                    : 'hover:border-gray-300 dark:hover:border-gray-700'
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
                    folder.color === 'blue' ? 'bg-blue-100 dark:bg-blue-950' : 'bg-blue-50 dark:bg-blue-900'
                  }`}>
                    <folder.icon className={`h-12 w-12 ${
                      folder.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500 dark:text-blue-300'
                    }`} />
                  </div>

                  {/* Nome da Pasta */}
                  <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                    {folder.name}
                  </h3>

                  {/* Estatísticas */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {folder.stats.total} produtos
                    </p>
                    <p className={`text-xs font-semibold ${
                      folder.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500 dark:text-blue-300'
                    }`}>
                      {formatPrice(folder.stats.totalValue)}
                    </p>
                  </div>

                  {/* Indicador de expansão */}
                  <div className="mt-3">
                    {expandedFolder === folder.id ? (
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Produtos da Categoria Expandida - Logo abaixo da pasta */}
            <AnimatePresence>
              {expandedFolder === folder.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-full"
                >
                  <div className="bg-card text-card-foreground border border-border rounded-lg p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
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
                        <div 
                          key={product.id} 
                          className={`border rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer relative bg-card text-card-foreground border-border ${selectedProducts.has(product.id) ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30' : ''} ${selectedProducts.size > 0 ? 'hover:border-blue-300 dark:hover:border-blue-500' : ''}`}
                          onClick={(e) => {
                            // Só selecionar se o clique não foi em um botão ou menu
                            const target = e.target as HTMLElement
                            if (!target.closest('button') && !target.closest('[role="button"]')) {
                              if (selectedProducts.size > 0 || isBulkMode) {
                                toggleProductSelection(product.id)
                              }
                            }
                          }}
                        >
                          {/* Checkbox principal - sempre visível quando em bulk mode */}
                          {isBulkMode && (
                            <div className="flex justify-start mb-2">
                              <Checkbox
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={() => toggleProductSelection(product.id)}
                                className="mt-1"
                                style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
                              />
                            </div>
                          )}
                          
                          <div className="aspect-square bg-muted dark:bg-muted rounded mb-1 flex items-center justify-center">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          <h4 className="font-medium text-xs mb-1 line-clamp-2 text-foreground">{product.name}</h4>
                          <p className="text-xs text-muted-foreground mb-1">{formatPrice(product.price)}</p>
                          {/* Tag de categoria - apenas para "Todos os Produtos" */}
                          {folder.id === 'all' && product.category && (
                            <div className="mb-1">
                              <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-full">
                                {product.category.name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Qtd: {product.stock_quantity}</span>
                            <ProductMenu
                              productId={product.id}
                              productName={product.name}
                              isSelected={selectedProducts.has(product.id)}
                              onEdit={() => onEdit?.(product)}
                              onDelete={() => onDelete?.(product.id)}
                              onMove={() => onMove(product.id)}
                              onSelect={() => toggleProductSelection(product.id)}
                              onSelectWithBulk={() => {
                                if (!isBulkMode && onToggleBulkMode) {
                                  onToggleBulkMode()
                                }
                              }}
                              hasSelectedProducts={selectedProducts.size > 0}
                              selectedCount={selectedProducts.size}
                              onBulkEdit={onBulkEdit}
                              onBulkDelete={onBulkDelete}
                              onBulkMove={onBulkMove}
                            />
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
