/**
 * Utilitários específicos para exportação de produtos
 */

import type { Product } from '@/types/product'
import { exportProductsToExcel } from './excel'
import { arrayToCSV, downloadCSV } from './csv'

export interface ProductExportOptions {
  filename?: string
  format: 'csv' | 'excel'
  includeImages?: boolean
}

/**
 * Exporta produtos em CSV
 */
export function exportProductsToCSV(
  products: Product[],
  options: ProductExportOptions = { format: 'csv' }
): void {
  const { filename = 'produtos' } = options

  const columns = [
    { key: 'name' as keyof Product, label: 'Nome' },
    { key: 'description' as keyof Product, label: 'Descrição' },
    { key: 'code' as keyof Product, label: 'Código' },
    { key: 'category' as keyof Product, label: 'Categoria' },
    { key: 'price' as keyof Product, label: 'Preço' },
    { key: 'cost' as keyof Product, label: 'Custo' },
    { key: 'stock_quantity' as keyof Product, label: 'Estoque' }
  ]

  // Preparar dados com categoria formatada
  const formattedProducts = products.map(product => ({
    ...product,
    category: product.category?.name || 'Sem Categoria'
  }))

  const csvContent = arrayToCSV(formattedProducts, columns)
  downloadCSV(csvContent, filename)
}

/**
 * Exporta produtos em Excel
 */
export function exportProducts(
  products: Product[],
  options: ProductExportOptions = { format: 'excel' }
): void {
  const { format, filename = 'produtos' } = options

  if (format === 'csv') {
    exportProductsToCSV(products, options)
  } else {
    exportProductsToExcel(products, { filename })
  }
}

/**
 * Filtra produtos baseado em critérios
 */
export interface ProductFilters {
  categoryIds?: string[]
  searchTerm?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  outOfStock?: boolean
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  let filtered = [...products]

  // Filtro por categoria
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    filtered = filtered.filter(p => 
      p.category_id && filters.categoryIds!.includes(p.category_id)
    )
  }

  // Filtro por termo de busca
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.code?.toLowerCase().includes(term)
    )
  }

  // Filtro por preço
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!)
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!)
  }

  // Filtro por estoque
  if (filters.inStock) {
    filtered = filtered.filter(p => (p.stock_quantity || 0) > 0)
  }
  if (filters.outOfStock) {
    filtered = filtered.filter(p => (p.stock_quantity || 0) === 0)
  }

  return filtered
}

