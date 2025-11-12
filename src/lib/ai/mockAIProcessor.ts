// Sistema de IA Mockado mais realista
// Funciona sem APIs externas, mas simula comportamento inteligente

export interface AIProductData {
  name: string
  description?: string
  category?: string
  price?: number
  confidence: number
}

// Base de dados de produtos para simulação mais realista
const PRODUCT_DATABASE = {
  'smartphone': {
    categories: ['Eletrônicos', 'Smartphones', 'Tecnologia'],
    priceRange: [800, 3000],
    descriptions: [
      'Smartphone com tela de alta resolução e câmera profissional',
      'Dispositivo móvel com sistema operacional moderno',
      'Telefone inteligente com recursos avançados'
    ]
  },
  'pulseira': {
    categories: ['Joias', 'Acessórios', 'Bijuterias'],
    priceRange: [20, 200],
    descriptions: [
      'Pulseira elegante em metal nobre',
      'Acessório de moda com design exclusivo',
      'Joia fina para ocasiões especiais'
    ]
  },
  'brinco': {
    categories: ['Joias', 'Acessórios', 'Bijuterias'],
    priceRange: [15, 150],
    descriptions: [
      'Brinco delicado com pedras preciosas',
      'Acessório de moda feminina',
      'Joia artesanal com acabamento refinado'
    ]
  },
  'relogio': {
    categories: ['Eletrônicos', 'Acessórios', 'Smartwatches'],
    priceRange: [100, 2000],
    descriptions: [
      'Relógio inteligente com múltiplas funcionalidades',
      'Dispositivo vestível com monitoramento de saúde',
      'Relógio digital com conectividade'
    ]
  },
  'camiseta': {
    categories: ['Roupas', 'Vestuário', 'Moda'],
    priceRange: [30, 120],
    descriptions: [
      'Camiseta de algodão com estampa exclusiva',
      'Peça de vestuário casual e confortável',
      'Roupa básica de alta qualidade'
    ]
  }
}

// Função para extrair palavras-chave da imagem (simulada)
function extractKeywordsFromImage(imageData: string): string[] {
  // Simulação de análise de imagem
  const keywords = [
    'smartphone', 'pulseira', 'brinco', 'relogio', 'camiseta',
    'eletronico', 'joia', 'acessorio', 'roupa', 'tecnologia'
  ]
  
  // Retorna palavras-chave aleatórias baseadas no hash da imagem
  const hash = imageData.length % keywords.length
  return [keywords[hash], keywords[(hash + 1) % keywords.length]]
}

// Função para gerar dados realistas baseados nas palavras-chave
export async function processImageWithMockAI(imageData: string): Promise<AIProductData> {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const keywords = extractKeywordsFromImage(imageData)
  const primaryKeyword = keywords[0]
  const productInfo = PRODUCT_DATABASE[primaryKeyword as keyof typeof PRODUCT_DATABASE]
  
  if (!productInfo) {
    // Produto não reconhecido
    return {
      name: 'Produto não identificado',
      description: 'Não foi possível identificar este produto automaticamente',
      category: 'Outros',
      price: 50,
      confidence: 0.3
    }
  }
  
  // Gerar dados realistas
  const category = productInfo.categories[Math.floor(Math.random() * productInfo.categories.length)]
  const [minPrice, maxPrice] = productInfo.priceRange
  const price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice)
  const description = productInfo.descriptions[Math.floor(Math.random() * productInfo.descriptions.length)]
  
  // Nomes mais específicos baseados no tipo
  const specificNames = {
    'smartphone': ['iPhone 15 Pro', 'Samsung Galaxy S24', 'Google Pixel 8', 'Xiaomi 14'],
    'pulseira': ['Pulseira de Prata', 'Pulseira de Ouro', 'Pulseira Pandora', 'Pulseira de Couro'],
    'brinco': ['Brinco de Pérola', 'Brinco de Cristal', 'Brinco de Ouro', 'Brinco Artesanal'],
    'relogio': ['Apple Watch', 'Samsung Galaxy Watch', 'Relógio Casio', 'Relógio Digital'],
    'camiseta': ['Camiseta Básica', 'Camiseta Polo', 'Camiseta Estampada', 'Camiseta Premium']
  }
  
  const names = specificNames[primaryKeyword as keyof typeof specificNames] || ['Produto Genérico']
  const name = names[Math.floor(Math.random() * names.length)]
  
  // Calcular confiança baseada na "qualidade" da imagem simulada
  const confidence = 0.7 + (Math.random() * 0.25) // 70-95% de confiança
  
  return {
    name,
    description,
    category,
    price,
    confidence: Math.round(confidence * 100) / 100
  }
}

// Função para processar múltiplas imagens
export async function processBatchImages(images: string[]): Promise<AIProductData[]> {
  const results: AIProductData[] = []
  
  for (let i = 0; i < images.length; i++) {
    const result = await processImageWithMockAI(images[i])
    results.push(result)
    
    // Mostrar progresso
    console.log(`Processando imagem ${i + 1}/${images.length}...`)
  }
  
  return results
}









