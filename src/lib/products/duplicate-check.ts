import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/product'

/**
 * Verifica se existe um produto duplicado baseado no nome e código
 */
export async function checkForDuplicateProduct(
  productName: string,
  productCode: string | null,
  userId: string,
  useSupabase: boolean
): Promise<Product | null> {
  if (useSupabase) {
    const supabase = createClient()
    // Buscar produto com mesmo nome (case-insensitive)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', productName.trim())
      .maybeSingle()

    if (error || !data) return null
    
    // Se o produto novo não tem código, e o existente também não tem, é duplicata
    if (!productCode && !data.code) {
      return data as Product
    }
    
    // Se ambos têm código e são iguais, é duplicata
    if (productCode && data.code && productCode.toLowerCase().trim() === data.code.toLowerCase().trim()) {
      return data as Product
    }
    
    // Se o produto novo não tem código mas o existente tem, permite criar
    // Se o produto novo tem código diferente, permite criar
    return null
  } else {
    // LocalStorage
    const storedProducts = localStorage.getItem(`products_${userId}`)
    if (!storedProducts) return null
    
    const products: Product[] = JSON.parse(storedProducts)
    const duplicate = products.find(p => 
      p.name.toLowerCase().trim() === productName.toLowerCase().trim() &&
      (!productCode || !p.code || productCode.toLowerCase().trim() === p.code.toLowerCase().trim())
    )
    
    return duplicate || null
  }
}

