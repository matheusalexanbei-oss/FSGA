'use client'

import { useState, useEffect } from 'react'

export interface StoreContext {
  storeType: string
  storeDescription: string
  commonCategories: string[]
}

const DEFAULT_STORE_CONTEXT: StoreContext = {
  storeType: 'acessórios',
  storeDescription: 'Loja de acessórios em prata',
  commonCategories: ['Pulseiras', 'Anéis', 'Brincos', 'Tornozeleiras', 'Correntes', 'Colares']
}

export function useStoreContext() {
  const [storeContext, setStoreContext] = useState<StoreContext>(DEFAULT_STORE_CONTEXT)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carregar contexto da loja do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('store_context')
      if (saved) {
        try {
          setStoreContext(JSON.parse(saved))
        } catch (error) {
          console.error('Erro ao carregar contexto da loja:', error)
          setStoreContext(DEFAULT_STORE_CONTEXT)
        }
      }
      setIsLoading(false)
    }
  }, [])

  const updateStoreContext = (newContext: Partial<StoreContext>) => {
    const updated = { ...storeContext, ...newContext }
    setStoreContext(updated)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('store_context', JSON.stringify(updated))
    }
  }

  const getStoreTypeCategories = (storeType: string): string[] => {
    const categoriesMap: Record<string, string[]> = {
      'acessórios': ['Pulseiras', 'Anéis', 'Brincos', 'Tornozeleiras', 'Correntes', 'Colares', 'Piercings'],
      'joalheria': ['Anéis', 'Brincos', 'Colares', 'Pulseiras', 'Correntes', 'Relógios', 'Alianças'],
      'moda': ['Roupas', 'Calçados', 'Bolsas', 'Cintos', 'Óculos', 'Chapéus', 'Luvas'],
      'eletrônicos': ['Smartphones', 'Tablets', 'Notebooks', 'Acessórios', 'Cabo', 'Carregador', 'Fone'],
      'casa': ['Decoração', 'Utensílios', 'Móveis', 'Iluminação', 'Textil', 'Organização'],
      'esportes': ['Roupas Esportivas', 'Calçados', 'Equipamentos', 'Acessórios', 'Suplementos'],
      'beleza': ['Cosméticos', 'Skincare', 'Perfumes', 'Cabelo', 'Unhas', 'Maquiagem'],
      'livros': ['Romance', 'Técnicos', 'Infantil', 'Biografia', 'Ficção', 'Não-ficção'],
      'outros': ['Diversos', 'Geral', 'Outros']
    }
    
    return categoriesMap[storeType.toLowerCase()] || categoriesMap['outros']
  }

  const updateStoreType = (storeType: string) => {
    const commonCategories = getStoreTypeCategories(storeType)
    updateStoreContext({
      storeType,
      commonCategories
    })
  }

  return {
    storeContext,
    isLoading,
    updateStoreContext,
    updateStoreType,
    getStoreTypeCategories
  }
}


