'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Edit, Eye } from 'lucide-react'
import type { Product } from '@/types/product'
import { motion } from 'framer-motion'
import { ProductMenu } from './ProductMenu'

interface ProductTableProps {
  products: Product[]
  selectedProducts: Set<string>
  toggleProductSelection: (productId: string) => void
  isBulkMode: boolean
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  onAddToCategory?: (productId: string) => void
}

export function ProductTable({ 
  products, 
  selectedProducts,
  toggleProductSelection,
  isBulkMode,
  onEdit,
  onDelete,
  onAddToCategory
}: ProductTableProps) {
  const router = useRouter()

  const handleEdit = (product: Product) => {
    if (onEdit) {
      onEdit(product)
    } else {
      router.push(`/products/${product.id}/edit`)
    }
  }

  const handleView = (product: Product) => {
    // Implementar visualização detalhada do produto
    console.log('Visualizar produto:', product)
  }

  const handleDelete = (productId: string) => {
    if (onDelete) {
      onDelete(productId)
    } else {
      console.log('Delete product:', productId)
    }
  }

  const handleAddToCategory = (productId: string) => {
    if (onAddToCategory) {
      onAddToCategory(productId)
    } else {
      console.log('Add to category:', productId)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Agrupar produtos por categoria
  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Sem Categoria'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Produtos</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500 dark:text-blue-400" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatPrice(products.reduce((sum, p) => sum + p.price, 0))}
                </p>
              </div>
              <div className="text-green-500 font-bold">R$</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Categorias</p>
                <p className="text-2xl font-bold text-purple-900">{Object.keys(groupedProducts).length}</p>
              </div>
              <div className="text-purple-500 font-bold">📁</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produtos agrupados por categoria */}
      {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
        <motion.div
          key={categoryName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header da Categoria */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                <p className="text-sm text-gray-500">
                  {categoryProducts.length} produtos • {formatPrice(categoryProducts.reduce((sum, p) => sum + p.price, 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Imagem do Produto */}
                <div className="relative h-48 bg-gray-100">
                  {product.image_url ? (
                    product.image_url.startsWith('data:') ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={200}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Checkbox para seleção */}
                  {isBulkMode && (
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Menu de ações */}
                  <div className="absolute top-2 right-2">
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
                </div>

                {/* Informações do Produto */}
                <div className="p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                      {product.name}
                    </h4>
                    {product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatPrice(product.price)}
                      </p>
                      {product.code && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Código: {product.code}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Estoque: {product.stock_quantity}
                      </p>
                    </div>
                  </div>

                  {/* Categorias */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {categoryName}
                    </Badge>
                  </div>

                  {/* Data de criação */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Criado em: {formatDate(product.created_at)}</span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(product)}
                        className="h-6 px-2 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="h-6 px-2 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Estado vazio */}
      {products.length === 0 && (
        <div className="text-center py-12" role="status" aria-live="polite">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Comece adicionando seu primeiro produto</p>
          <Button 
            onClick={() => router.push('/products/new')}
            aria-label="Criar novo produto"
          >
            <Package className="h-4 w-4 mr-2" aria-hidden="true" />
            Novo Produto
          </Button>
        </div>
      )}
    </div>
  )
}