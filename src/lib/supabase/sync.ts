'use client'

import { createClient } from './client'
import { createOrGetCategory } from '@/lib/categories'
import { smartLoader } from '@/lib/utils/smartLoader'

export interface Product {
  id: string
  name: string
  description?: string | null
  code?: string | null
  price: number
  cost?: number | null
  stock_quantity: number
  category_id?: string | null
  user_id: string
  image_url?: string | null
  ai_processed?: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string | null
  user_id: string
  created_at: string
}

/**
 * Sincroniza dados do localStorage para o Supabase
 */
export async function syncLocalDataToSupabase(userId: string) {
  const supabase = createClient()
  
  try {
    // 1. Sincronizar categorias
    const localCategories = localStorage.getItem(`categories_${userId}`)
    if (localCategories) {
      const categories: Category[] = JSON.parse(localCategories)
      console.log('🔄 Sincronizando categorias:', categories.length)
      
      for (const category of categories) {
        const { error } = await supabase
          .from('categories')
          .upsert({
            id: category.id,
            user_id: userId,
            name: category.name,
            description: category.description,
            created_at: category.created_at
          })
        
        if (error) {
          console.error('❌ Erro ao sincronizar categoria:', error)
        } else {
          console.log(`✅ Categoria "${category.name}" sincronizada`)
        }
      }
    }

    // 2. Sincronizar produtos
    const localProducts = localStorage.getItem(`products_${userId}`)
    if (localProducts) {
      const products: Product[] = JSON.parse(localProducts)
      console.log('🔄 Sincronizando produtos:', products.length)
      
      for (const product of products) {
        const { error } = await supabase
          .from('products')
          .upsert({
            id: product.id,
            user_id: userId,
            category_id: product.category_id,
            name: product.name,
            description: product.description,
            code: product.code,
            price: product.price,
            cost: product.cost,
            stock_quantity: product.stock_quantity,
            image_url: product.image_url,
            ai_processed: product.ai_processed || false,
            created_at: product.created_at,
            updated_at: product.updated_at
          })
        
        if (error) {
          console.error('❌ Erro ao sincronizar produto:', error)
        } else {
          console.log(`✅ Produto "${product.name}" sincronizado`)
        }
      }
    }

    console.log('✅ Sincronização concluída!')
    return { success: true }
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    return { success: false, error }
  }
}

/**
 * NOVA FUNÇÃO: Carregamento inteligente usando SmartLoader
 * Sistema que não depende do localStorage para armazenar todos os dados
 */
export async function loadDataSmartly(userId: string) {
  try {
    console.log('🚀 Iniciando carregamento inteligente de dados...')
    
    // Limpar cache antigo antes de carregar
    smartLoader.clearOldCache(userId)
    
    // Carregar dados diretamente do Supabase
    const [categories, products] = await Promise.all([
      smartLoader.loadCategories(userId),
      smartLoader.loadProducts(userId)
    ])

    console.log(`✅ Carregamento concluído: ${categories.length} categorias, ${products.length} produtos`)
    
    return { success: true, categories, products }
    
  } catch (error) {
    console.error('❌ Erro no carregamento inteligente:', error)
    
    // Fallback: tentar carregar do cache se disponível
    try {
      const cachedCategories = smartLoader.getCachedData('categories', userId) || []
      const cachedProducts = smartLoader.getCachedData('products', userId) || []
      
      if (cachedCategories.length > 0 || cachedProducts.length > 0) {
        console.log('📦 Usando dados do cache como fallback')
        return { success: true, categories: cachedCategories, products: cachedProducts }
      }
    } catch (cacheError) {
      console.warn('⚠️ Erro ao carregar cache:', cacheError)
    }
    
    return { success: false, error, categories: [], products: [] }
  }
}

/**
 * FUNÇÃO LEGADA: Mantida para compatibilidade (mas não usa mais)
 * Carrega dados do Supabase para o localStorage
 * Se não há dados no Supabase, tenta carregar do localStorage e sincronizar
 */
export async function loadSupabaseDataToLocal(userId: string) {
  const supabase = createClient()
  
  try {
    // 1. Carregar categorias
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (categoriesError) {
      console.error('❌ Erro ao carregar categorias:', categoriesError)
    } else {
      StorageManager.setItem('categories', userId, categories || [])
      console.log(`✅ ${categories?.length || 0} categorias carregadas do Supabase`)
    }

    // 2. Carregar produtos (SEM categorias aninhadas para economizar espaço)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, description, code, price, cost, stock_quantity, category_id, user_id, image_url, ai_processed, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('❌ Erro ao carregar produtos:', productsError)
    } else {
      StorageManager.setItem('products', userId, products || [])
      console.log(`✅ ${products?.length || 0} produtos carregados do Supabase`)
    }

    // 3. Se não há dados no Supabase, verificar se há dados no localStorage para sincronizar
    if ((!categories || categories.length === 0) && (!products || products.length === 0)) {
      console.log('🔄 Nenhum dado encontrado no Supabase, verificando localStorage...')
      
      const localCategories = StorageManager.getItem('categories', userId)
      const localProducts = StorageManager.getItem('products', userId)
      
      if (localCategories.length > 0 || localProducts.length > 0) {
        console.log('📤 Dados encontrados no localStorage, sincronizando com Supabase...')
        
        // Sincronizar categorias do localStorage para o Supabase
        if (localCategories.length > 0) {
          const categoriesData = localCategories
          for (const category of categoriesData) {
            try {
              const { error } = await supabase
                .from('categories')
                .insert({
                  id: category.id,
                  user_id: userId,
                  name: category.name,
                  description: category.description,
                  created_at: category.created_at
                })
              
              if (error) {
                console.error('❌ Erro ao sincronizar categoria:', error)
              }
            } catch (err) {
              console.error('❌ Erro ao sincronizar categoria:', err)
            }
          }
          console.log(`✅ ${categoriesData.length} categorias sincronizadas com Supabase`)
        }
        
        // Sincronizar produtos do localStorage para o Supabase
        if (localProducts.length > 0) {
          const productsData = localProducts
          for (const product of productsData) {
            try {
              const { error } = await supabase
                .from('products')
                .insert({
                  id: product.id,
                  user_id: userId,
                  category_id: product.category_id,
                  name: product.name,
                  description: product.description,
                  code: product.code,
                  price: product.price,
                  cost: product.cost,
                  stock_quantity: product.stock_quantity,
                  image_url: product.image_url,
                  ai_processed: product.ai_processed || false,
                  created_at: product.created_at,
                  updated_at: product.updated_at
                })
              
              if (error) {
                console.error('❌ Erro ao sincronizar produto:', error)
              }
            } catch (err) {
              console.error('❌ Erro ao sincronizar produto:', err)
            }
          }
          console.log(`✅ ${productsData.length} produtos sincronizados com Supabase`)
        }
        
        // Recarregar dados do Supabase após sincronização
        const { data: syncedCategories } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
        
        const { data: syncedProducts } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        return { success: true, categories: syncedCategories || [], products: syncedProducts || [] }
      }
    }

    return { success: true, categories: categories || [], products: products || [] }
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error)
    return { success: false, error }
  }
}

/**
 * Salva um produto diretamente no Supabase
 */
export async function saveProductToSupabase(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: productData.user_id,
        category_id: productData.category_id,
        name: productData.name,
        description: productData.description,
        code: productData.code,
        price: productData.price,
        cost: productData.cost,
        stock_quantity: productData.stock_quantity,
        image_url: productData.image_url,
        ai_processed: productData.ai_processed || false
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao salvar produto no Supabase:', error)
      return { success: false, error }
    }

    console.log(`✅ Produto "${productData.name}" salvo no Supabase`)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Erro ao salvar produto:', error)
    return { success: false, error }
  }
}

/**
 * Busca ou cria uma categoria no Supabase (evita duplicatas)
 */
export async function findOrCreateCategory(categoryData: Omit<Category, 'id' | 'created_at'>) {
  const supabase = createClient()
  
  try {
    // Primeiro, tentar encontrar a categoria existente
    const { data: existingCategory, error: searchError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', categoryData.user_id)
      .eq('name', categoryData.name)
      .single()

    if (existingCategory && !searchError) {
      // Categoria já existe, retornar ela
      console.log(`✅ Categoria "${categoryData.name}" já existe, reutilizando`)
      return { success: true, data: existingCategory }
    }

    // Categoria não existe, criar nova
    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert({
        user_id: categoryData.user_id,
        name: categoryData.name,
        description: categoryData.description
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao criar categoria no Supabase:', insertError)
      return { success: false, error: insertError }
    }

    console.log(`✅ Nova categoria "${categoryData.name}" criada no Supabase`)
    return { success: true, data: newCategory }
  } catch (error) {
    console.error('❌ Erro ao buscar/criar categoria:', error)
    return { success: false, error }
  }
}

/**
 * Salva uma categoria diretamente no Supabase (DEPRECATED - use findOrCreateCategory)
 */
export async function saveCategoryToSupabase(categoryData: Omit<Category, 'id' | 'created_at'>) {
  return findOrCreateCategory(categoryData)
}
