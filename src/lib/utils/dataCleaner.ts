/**
 * Utilitário para limpar dados misturados entre localStorage e Supabase
 */

import { isValidUUID, isCustomId } from './idValidator'

/**
 * Limpa produtos removendo aqueles com IDs customizados
 */
export function cleanProductsWithCustomIds(products: any[]): any[] {
  return products.filter(product => {
    const hasValidId = isValidUUID(product.id)
    if (!hasValidId) {
      console.warn(`⚠️ Produto com ID customizado removido: ${product.id} (${product.name})`)
    }
    return hasValidId
  })
}

/**
 * Limpa categorias removendo aquelas com IDs customizados
 */
export function cleanCategoriesWithCustomIds(categories: any[]): any[] {
  return categories.filter(category => {
    const hasValidId = isValidUUID(category.id)
    if (!hasValidId) {
      console.warn(`⚠️ Categoria com ID customizado removida: ${category.id} (${category.name})`)
    }
    return hasValidId
  })
}

/**
 * Converte category_id customizado para null nos produtos
 */
export function cleanProductCategoryIds(products: any[]): any[] {
  return products.map(product => {
    if (isCustomId(product.category_id)) {
      console.warn(`⚠️ Product ${product.id}: category_id customizado convertido para null`)
      return { ...product, category_id: null }
    }
    return product
  })
}

/**
 * Limpa todos os dados de uma vez
 */
export function cleanAllData(products: any[], categories: any[]) {
  const cleanProducts = cleanProductsWithCustomIds(products)
  const cleanCategories = cleanCategoriesWithCustomIds(categories)
  const finalProducts = cleanProductCategoryIds(cleanProducts)
  
  return {
    products: finalProducts,
    categories: cleanCategories
  }
}



