/**
 * Sistema de carregamento inteligente que usa Supabase como fonte principal
 * e localStorage apenas como cache limitado
 */

import { createClient } from '@/lib/supabase/client'
import { cleanAllData } from './dataCleaner'

interface SmartLoaderOptions {
  maxCacheItems?: number
  cacheExpiryMinutes?: number
  enableCache?: boolean // Opção para desabilitar cache completamente
}

export class SmartLoader {
  private maxCacheItems: number
  private cacheExpiryMinutes: number
  private enableCache: boolean

  constructor(options: SmartLoaderOptions = {}) {
    this.maxCacheItems = options.maxCacheItems || 20 // Apenas 20 itens em cache
    this.cacheExpiryMinutes = options.cacheExpiryMinutes || 30 // Cache expira em 30 minutos
    this.enableCache = options.enableCache !== false // Cache habilitado por padrão
  }

  /**
   * Carrega produtos diretamente do Supabase (fonte principal)
   * Salva apenas uma versão resumida no localStorage como cache
   */
  async loadProducts(userId: string) {
    try {
      console.log('🔄 Carregando produtos diretamente do Supabase...')
      
      const supabase = createClient()
      
      // Carregar produtos com categorias aninhadas
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          description, 
          code, 
          price, 
          cost, 
          stock_quantity, 
          category_id, 
          image_url, 
          ai_processed, 
          created_at, 
          updated_at,
          category:categories(id, name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000) // Limite razoável para performance

      if (error) {
        console.error('❌ Erro ao carregar produtos do Supabase:', error)
        return []
      }

      console.log(`✅ ${products?.length || 0} produtos carregados do Supabase`)
      
      // Limpar produtos com IDs customizados
      const cleanProducts = (products || []).filter(product => {
        const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id)
        if (!isValidId) {
          console.warn(`⚠️ Produto com ID customizado removido: ${product.id} (${product.name})`)
        }
        return isValidId
      })
      
      console.log(`🧹 ${cleanProducts.length} produtos válidos após limpeza`)
      
      // Salvar versão resumida no cache (apenas para performance)
      if (this.enableCache) {
        this.saveToCache('products', userId, cleanProducts, this.maxCacheItems)
      }
      
      return cleanProducts
      
    } catch (error) {
      console.error('❌ Erro no SmartLoader:', error)
      return []
    }
  }

  /**
   * Carrega categorias diretamente do Supabase
   */
  async loadCategories(userId: string) {
    try {
      console.log('🔄 Carregando categorias diretamente do Supabase...')
      
      const supabase = createClient()
      
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Erro ao carregar categorias do Supabase:', error)
        return []
      }

      console.log(`✅ ${categories?.length || 0} categorias carregadas do Supabase`)
      
      // Limpar categorias com IDs customizados
      const cleanCategories = (categories || []).filter(category => {
        const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(category.id)
        if (!isValidId) {
          console.warn(`⚠️ Categoria com ID customizado removida: ${category.id} (${category.name})`)
        }
        return isValidId
      })
      
      console.log(`🧹 ${cleanCategories.length} categorias válidas após limpeza`)
      
      // Salvar no cache
      if (this.enableCache) {
        this.saveToCache('categories', userId, cleanCategories, this.maxCacheItems)
      }
      
      return cleanCategories
      
    } catch (error) {
      console.error('❌ Erro no SmartLoader:', error)
      return []
    }
  }

  /**
   * Salva dados no cache com limite ultra-conservador e expiração
   */
  private saveToCache(type: string, userId: string, data: any[], maxItems: number) {
    try {
      const cacheKey = `cache_${type}_${userId}`
      
      // Criar versão ULTRA resumida para cache (apenas campos essenciais)
      const ultraCompactData = data.slice(0, maxItems).map(item => {
        if (type === 'products') {
          return {
            id: item.id,
            name: item.name,
            price: item.price,
            stock_quantity: item.stock_quantity,
            image_url: item.image_url
          }
        } else if (type === 'categories') {
          return {
            id: item.id,
            name: item.name
          }
        }
        return item
      })
      
      const cacheData = {
        data: ultraCompactData,
        timestamp: Date.now(),
        totalCount: data.length
      }
      
      const dataString = JSON.stringify(cacheData)
      
      // Verificar tamanho antes de salvar
      if (dataString.length > 50000) { // 50KB limite
        console.warn(`⚠️ Cache ${type} muito grande (${dataString.length} bytes), reduzindo...`)
        
        // Reduzir ainda mais
        const reducedData = ultraCompactData.slice(0, Math.floor(maxItems / 2))
        const reducedCacheData = {
          data: reducedData,
          timestamp: Date.now(),
          totalCount: data.length
        }
        
        localStorage.setItem(cacheKey, JSON.stringify(reducedCacheData))
        console.log(`💾 Cache ${type} reduzido salvo: ${reducedData.length} itens`)
      } else {
        localStorage.setItem(cacheKey, dataString)
        console.log(`💾 Cache ${type} salvo: ${ultraCompactData.length} itens`)
      }
      
    } catch (error) {
      console.warn('⚠️ Erro ao salvar cache (não crítico):', error)
      
      // Tentar salvar apenas metadados se falhar
      try {
        const cacheKey = `cache_${type}_${userId}`
        const minimalData = {
          data: [],
          timestamp: Date.now(),
          totalCount: data.length,
          error: 'Cache reduzido devido a limitações de espaço'
        }
        localStorage.setItem(cacheKey, JSON.stringify(minimalData))
        console.log(`💾 Cache ${type} minimal salvo (apenas metadados)`)
      } catch (fallbackError) {
        console.warn('⚠️ Falha total ao salvar cache:', fallbackError)
        // Não falha se não conseguir salvar no cache
      }
    }
  }

  /**
   * Verifica se há cache válido
   */
  getCachedData(type: string, userId: string): any[] | null {
    try {
      const cacheKey = `cache_${type}_${userId}`
      const cached = localStorage.getItem(cacheKey)
      
      if (!cached) return null
      
      const cacheData = JSON.parse(cached)
      const now = Date.now()
      const expiryTime = this.cacheExpiryMinutes * 60 * 1000
      
      // Verificar se cache expirou
      if (now - cacheData.timestamp > expiryTime) {
        localStorage.removeItem(cacheKey)
        return null
      }
      
      console.log(`📦 Cache ${type} válido encontrado: ${cacheData.data.length} itens`)
      return cacheData.data
      
    } catch (error) {
      console.warn('⚠️ Erro ao ler cache:', error)
      return null
    }
  }

  /**
   * Limpa cache antigo
   */
  clearOldCache(userId: string) {
    try {
      const keys = Object.keys(localStorage)
      const userKeys = keys.filter(key => key.includes(userId))
      
      userKeys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
      
      console.log('🧹 Cache antigo limpo')
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache:', error)
    }
  }
}

// Instância global do SmartLoader - ULTRA CONSERVADORA
export const smartLoader = new SmartLoader({
  maxCacheItems: 10, // Apenas 10 itens em cache
  cacheExpiryMinutes: 15, // Cache expira em 15 minutos
  enableCache: false // DESABILITADO por padrão para evitar problemas de quota
})
