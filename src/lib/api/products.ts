// src/lib/api/products.ts

import { createClient } from '@/lib/supabase/client'
import { validateCategoryIdForSupabase, filterValidUUIDs } from '@/lib/utils/idValidator'

/**
 * Move múltiplos produtos para uma categoria específica
 * Funciona tanto com localStorage quanto Supabase
 * 
 * @param productIds - Array de IDs dos produtos a serem movidos
 * @param categoryId - ID da categoria de destino
 * @param useSupabase - Se true, atualiza também no Supabase
 * @returns Objeto com success (boolean) e error opcional (string)
 */
export async function moveProductsToCategory(
  productIds: string[],
  categoryId: string | null,
  useSupabase: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // Se está usando Supabase, atualizar na nuvem primeiro
    if (useSupabase) {
      const supabase = createClient()
      
      // Validar e converter categoryId
      const finalCategoryId = validateCategoryIdForSupabase(categoryId === '' ? null : categoryId)
      
      // Filtrar apenas IDs válidos (UUIDs)
      const validProductIds = filterValidUUIDs(productIds)
      
      if (validProductIds.length === 0) {
        console.warn('⚠️ Nenhum ID de produto válido encontrado para atualização no Supabase')
        return { success: false, error: 'Nenhum produto válido para atualizar' }
      }
      
      console.log(`🔄 Atualizando ${validProductIds.length} produtos no Supabase com category_id: ${finalCategoryId}`)
      
      const { error } = await supabase
        .from('products')
        // @ts-expect-error - Problema de tipagem do Supabase com category_id null
        .update({ category_id: finalCategoryId })
        .in('id', validProductIds)
      
      if (error) {
        console.error('Erro ao mover produtos no Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        return { success: false, error: error.message || 'Erro desconhecido no Supabase' }
      }
    }
    
    // Apenas atualizar no localStorage se NÃO estiver usando Supabase
    if (!useSupabase) {
      const storedProducts = localStorage.getItem('products')
      if (storedProducts) {
        const products = JSON.parse(storedProducts)
        
        // Atualizar category_id dos produtos selecionados
        const updatedProducts = products.map((product: Record<string, any>) => {
          if (productIds.includes(product.id)) {
            return { 
              ...product, 
              category_id: categoryId === '' ? null : categoryId 
            }
          }
          return product
        })
        
        localStorage.setItem('products', JSON.stringify(updatedProducts))
      }
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Erro ao mover produtos:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

/**
 * Move um único produto para uma categoria
 * Atalho para moveProductsToCategory com array de 1 elemento
 * 
 * @param productId - ID do produto
 * @param categoryId - ID da categoria de destino
 * @param useSupabase - Se true, atualiza também no Supabase
 */
export async function moveProductToCategory(
  productId: string,
  categoryId: string,
  useSupabase: boolean = false
): Promise<{ success: boolean; error?: string }> {
  return moveProductsToCategory([productId], categoryId, useSupabase)
}

/**
 * Remove produtos de suas categorias (define category_id como vazio)
 * Útil para "descategorizar" produtos
 * 
 * @param productIds - Array de IDs dos produtos
 * @param useSupabase - Se true, atualiza também no Supabase
 */
export async function removeProductsFromCategory(
  productIds: string[],
  useSupabase: boolean = false
): Promise<{ success: boolean; error?: string }> {
  return moveProductsToCategory(productIds, '', useSupabase)
}