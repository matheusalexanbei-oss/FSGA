import { Product } from '@/types/product'

/**
 * Remove artigos e palavras comuns do nome do produto para melhor busca
 */
function normalizeProductName(name: string): string {
  // Remover artigos comuns
  const articles = ['a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na']
  const words = name.toLowerCase().split(/\s+/)
  const filtered = words.filter(word => 
    word.length > 1 && !articles.includes(word)
  )
  return filtered.join(' ')
}

/**
 * Calcula similaridade entre duas strings (busca aproximada)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeProductName(str1)
  const s2 = normalizeProductName(str2)
  
  // Se uma string contém a outra completamente
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9
  }
  
  // Contar palavras em comum
  const words1 = s1.split(/\s+/).filter(w => w.length > 2)
  const words2 = s2.split(/\s+/).filter(w => w.length > 2)
  
  if (words1.length === 0 || words2.length === 0) return 0
  
  const commonWords = words1.filter(w1 => 
    words2.some(w2 => w2.includes(w1) || w1.includes(w2))
  )
  
  // Calcular score baseado em palavras comuns
  const score = commonWords.length / Math.max(words1.length, words2.length)
  return score
}

/**
 * Busca produtos por nome usando busca flexível
 */
export function searchProducts(products: Product[], searchTerm: string): Product[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return products
  }
  
  const normalizedSearch = normalizeProductName(searchTerm)
  const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 1)
  
  // Primeiro, tentar busca exata (incluindo com artigos)
  const exactMatches = products.filter(p => {
    const productName = p.name.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return productName.includes(searchLower) || searchLower.includes(productName)
  })
  
  if (exactMatches.length > 0) {
    return exactMatches
  }
  
  // Busca por palavras-chave (pelo menos uma palavra do termo de busca)
  const keywordMatches = products.filter(p => {
    const productNormalized = normalizeProductName(p.name)
    return searchWords.some(word => 
      productNormalized.includes(word) || 
      productNormalized.split(/\s+/).some(pWord => 
        pWord.includes(word) || word.includes(pWord)
      )
    )
  })
  
  if (keywordMatches.length > 0) {
    return keywordMatches
  }
  
  // Busca por similaridade (último recurso)
  const scoredProducts = products.map(p => ({
    product: p,
    score: calculateSimilarity(p.name, searchTerm)
  }))
  
  const similarMatches = scoredProducts
    .filter(item => item.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product)
  
  return similarMatches
}

/**
 * Melhora a extração do nome do produto removendo artigos e palavras desnecessárias
 */
export function extractProductNameFromCommand(command: string, intent: string): string | null {
  // Remover a palavra-chave da ação
  let cleaned = command
    .replace(/^(vendi|comprei|produto|o|a|um|uma|tem|tenho|procura|buscar|busca)\s+/i, '')
    .trim()
  
  // Remover artigos no início
  cleaned = cleaned.replace(/^(a|o|as|os|um|uma|uns|umas)\s+/i, '')
  
  // Remover valores monetários e quantidades
  cleaned = cleaned.replace(/\d+[,.]?\d*\s*(reais?|r\$|rs|real|R\$)/gi, '')
  cleaned = cleaned.replace(/\d+\s*(unidades?|un|pcs?|peças?)/gi, '')
  
  // Remover palavras comuns no final (por, de, com, para, etc.)
  cleaned = cleaned.replace(/\s+(por|de|com|para|em|no|na)\s+.*$/i, '')
  
  // Remover sinais de pontuação excessivos
  cleaned = cleaned.replace(/[?.!,:;]+$/, '')
  
  return cleaned.trim() || null
}

