/**
 * Gerenciador de armazenamento local com controle de quota
 */

const STORAGE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  USER: 'user',
  AUTH: 'isAuthenticated'
} as const

const MAX_ITEMS_PER_TYPE = 1000 // Limite razoável para sistema de estoque
const MAX_STORAGE_SIZE = 10 * 1024 * 1024 // 10MB limite (adequado para estoque)

interface StorageItem {
  id: string
  created_at: string
  updated_at: string
  [key: string]: any
}

export class StorageManager {
  private static getStorageKey(type: string, userId: string): string {
    return `${type}_${userId}`
  }

  private static getStorageSize(): number {
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
        }
      }
    }
    return totalSize
  }

  private static isStorageFull(): boolean {
    return this.getStorageSize() > MAX_STORAGE_SIZE
  }

  private static cleanOldItems<T extends StorageItem>(items: T[], maxItems: number = MAX_ITEMS_PER_TYPE): T[] {
    if (items.length <= maxItems) return items

    // Ordenar por data de criação (mais antigos primeiro)
    const sortedItems = items.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // Manter apenas os mais recentes
    return sortedItems.slice(-maxItems)
  }

  private static compressData<T>(items: T[]): T[] {
    // Compressão leve - apenas remover campos vazios desnecessários
    return items.map(item => {
      if (typeof item === 'object' && item !== null) {
        const compressed = { ...item } as any
        
        // Remover apenas campos de metadados desnecessários (não dados do negócio)
        delete compressed.app_metadata
        delete compressed.user_metadata
        delete compressed.aud
        
        return compressed as T
      }
      return item
    })
  }

  static setItem<T extends StorageItem>(type: string, userId: string, items: T[]): boolean {
    try {
      const storageKey = this.getStorageKey(type, userId)
      
      // Limpar itens antigos se necessário
      let cleanedItems = this.cleanOldItems(items)
      
      // Comprimir dados se o storage estiver cheio
      if (this.isStorageFull()) {
        cleanedItems = this.compressData(cleanedItems)
        console.log(`🗜️ Dados comprimidos para economizar espaço no localStorage`)
      }

      const dataToStore = JSON.stringify(cleanedItems)
      
      // Verificar se ainda cabe no storage
      if (dataToStore.length > MAX_STORAGE_SIZE) {
        console.warn(`⚠️ Dados muito grandes para localStorage (${dataToStore.length} bytes)`)
        console.warn(`⚠️ Isso pode indicar um problema no carregamento de dados. Verifique se não há dados duplicados ou campos desnecessários.`)
        // Apenas salvar sem limitação agressiva
        localStorage.setItem(storageKey, dataToStore)
      } else {
        localStorage.setItem(storageKey, dataToStore)
      }

      console.log(`✅ ${cleanedItems.length} ${type} salvos no localStorage`)
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('❌ Quota do localStorage excedida. Limpando dados antigos...')
        
        // Limpar todos os dados antigos
        this.clearOldData(userId)
        
        // Tentar novamente com dados reduzidos
        try {
          const reducedItems = items.slice(-100) // Manter 100 itens (adequado para estoque)
          localStorage.setItem(this.getStorageKey(type, userId), JSON.stringify(reducedItems))
          console.log(`✅ ${reducedItems.length} ${type} salvos após limpeza`)
          return true
        } catch (retryError) {
          console.error('❌ Falha ao salvar no localStorage após limpeza:', retryError)
          return false
        }
      }
      console.error('❌ Erro ao salvar no localStorage:', error)
      return false
    }
  }

  static getItem<T extends StorageItem>(type: string, userId: string): T[] {
    try {
      const storageKey = this.getStorageKey(type, userId)
      const data = localStorage.getItem(storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error(`❌ Erro ao ler ${type} do localStorage:`, error)
      return []
    }
  }

  static clearOldData(userId: string): void {
    try {
      // Limpar dados antigos de todos os tipos
      Object.values(STORAGE_KEYS).forEach(key => {
        const storageKey = this.getStorageKey(key, userId)
        localStorage.removeItem(storageKey)
      })
      
      // Limpar dados de outros usuários antigos
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('_') && !key.includes(userId)) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      console.log(`🧹 Dados antigos limpos do localStorage`)
    } catch (error) {
      console.error('❌ Erro ao limpar dados antigos:', error)
    }
  }

  static getStorageInfo(): { size: number; maxSize: number; percentage: number } {
    const size = this.getStorageSize()
    const percentage = (size / MAX_STORAGE_SIZE) * 100
    
    return {
      size,
      maxSize: MAX_STORAGE_SIZE,
      percentage: Math.round(percentage)
    }
  }
}
