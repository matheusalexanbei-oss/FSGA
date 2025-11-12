// Processador especializado para listas de produtos
import Anthropic from '@anthropic-ai/sdk'

export interface ProductListItem {
  name: string
  description?: string
  category?: string
  categories?: string[]
  price?: number
  originalPrice?: number
  quantity?: number
  confidence: number
  image_url?: string
}

export interface ListProcessingResult {
  isList: boolean
  totalItems: number
  products: ProductListItem[]
  summary?: string
}

// Inicializar cliente Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
})

// Função para converter base64 para formato Claude
function convertBase64ForClaude(base64String: string): string {
  const base64Data = base64String.split(',')[1]
  return base64Data
}

// Função para detectar tipo de imagem
function getImageType(base64String: string): string {
  if (base64String.includes('data:image/jpeg')) return 'image/jpeg'
  if (base64String.includes('data:image/png')) return 'image/png'
  if (base64String.includes('data:image/webp')) return 'image/webp'
  if (base64String.includes('data:image/gif')) return 'image/gif'
  return 'image/jpeg'
}

// Função principal para processar lista de produtos
export async function processProductListWithClaude(imageData: string, storeContext?: { storeType: string; storeDescription: string; commonCategories: string[] }): Promise<ListProcessingResult> {
  try {
    console.log('📋 Iniciando processamento de lista com Claude Vision...')
    
    const base64Image = convertBase64ForClaude(imageData)
    const imageType = getImageType(imageData)
    
    // Verificar se a API key está disponível
    if (!anthropic.apiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada')
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta imagem e identifique se ela contém uma LISTA de produtos. Se for uma lista, extraia TODOS os produtos individuais.

IMPORTANTE:
1. Se for uma lista/catálogo/planilha com múltiplos produtos, extraia CADA item separadamente
2. Se for apenas um produto único, retorne apenas esse produto
3. Identifique preços, quantidades e categorias quando visíveis
4. Seja preciso na separação dos itens
5. ${storeContext ? `CONTEXTO DA LOJA: Esta é uma loja de "${storeContext.storeType}" - ${storeContext.storeDescription}. Use as categorias mais comuns para este tipo de loja: ${storeContext.commonCategories?.join(', ')}.` : ''}

REGRAS DE DESCRIÇÃO:
- NÃO mencione materiais específicos como "ouro", "prata", "diamante", "zircônia" etc.
- Descreva APENAS o que você vê: formatos, formas, cores, estilos
- Use termos genéricos como "metal", "pedra", "material" quando necessário
- Foque em características visuais: "circular", "quadrado", "trançado", "liso", "cravejado"

CATEGORIZAÇÃO INTELIGENTE:
- Se o nome do produto contém palavras como "pulseira", "bracelete", "braçadeira" → categoria "Pulseiras"
- Se contém "anel", "anél" → categoria "Anéis"  
- Se contém "brinco", "argola" → categoria "Brincos"
- Se contém "tornozeleira", "tornozela" → categoria "Tornozeleiras"
- Se contém "corrente", "colar" → categoria "Correntes"
- Se contém "piercing" → categoria "Piercings"
- Evite criar categorias duplicadas ou similares

Responda APENAS no seguinte formato JSON:

{
  "isList": true/false,
  "totalItems": número_total_de_produtos,
  "products": [
    {
      "name": "nome do produto 1",
      "description": "descrição do produto 1",
      "category": "categoria",
      "price": valor_numérico,
      "quantity": quantidade_se_visível,
      "confidence": valor_entre_0_e_1
    },
    {
      "name": "nome do produto 2",
      "description": "descrição do produto 2",
      "category": "categoria",
      "price": valor_numérico,
      "quantity": quantidade_se_visível,
      "confidence": valor_entre_0_e_1
    }
  ],
  "summary": "resumo da lista identificada"
}

Se não conseguir identificar produtos claramente, use valores genéricos mas realistas.`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: base64Image
              }
            }
          ]
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('📝 Resposta bruta do Claude:', responseText)
    
    // Extrair JSON da resposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Resposta do Claude não contém JSON válido')
    }
    
    const parsedData = JSON.parse(jsonMatch[0])
    
    // Validar e normalizar dados
    const result: ListProcessingResult = {
      isList: Boolean(parsedData.isList),
      totalItems: Number(parsedData.totalItems) || 0,
      products: Array.isArray(parsedData.products) ? parsedData.products.map((product: { name?: string; description?: string; category?: string; price?: number; quantity?: number; confidence?: number; categories?: string[]; originalPrice?: number }) => ({
        name: product.name || 'Produto não identificado',
        description: product.description || 'Descrição não disponível',
        category: product.category || 'Outros',
        price: parseFloat(product.price?.toString() || '0') || 0,
        quantity: parseInt(product.quantity?.toString() || '1') || 1,
        confidence: Math.min(Math.max(parseFloat(product.confidence?.toString() || '0.5') || 0.5, 0), 1)
      })) : [],
      summary: parsedData.summary || 'Lista de produtos identificada'
    }
    
    console.log('✅ Lista processada:', result)
    return result
    
  } catch (error) {
    console.error('❌ Erro ao processar lista com Claude:', error)
    
    // Fallback em caso de erro
    return {
      isList: false,
      totalItems: 0,
      products: [{
        name: 'Erro no processamento',
        description: 'Não foi possível processar a imagem com Claude',
        category: 'Erro',
        price: 0,
        quantity: 1,
        confidence: 0.1
      }],
      summary: 'Erro ao processar imagem'
    }
  }
}

// Função para processar produto individual (fallback)
export async function processSingleProductWithClaude(imageData: string): Promise<ProductListItem> {
  try {
    console.log('🔍 Processando produto individual...')
    
    const base64Image = convertBase64ForClaude(imageData)
    const imageType = getImageType(imageData)
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta imagem de produto e extraia as informações em português brasileiro.

Responda APENAS no seguinte formato JSON:
{
  "name": "nome do produto",
  "description": "descrição detalhada",
  "category": "categoria",
  "price": valor_numérico,
  "quantity": 1,
  "confidence": valor_entre_0_e_1
}`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: base64Image
              }
            }
          ]
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('Resposta do Claude não contém JSON válido')
    }
    
    const parsedData = JSON.parse(jsonMatch[0])
    
    return {
      name: parsedData.name || 'Produto não identificado',
      description: parsedData.description || 'Descrição não disponível',
      category: parsedData.category || 'Outros',
      price: parseFloat(parsedData.price) || 0,
      quantity: parseInt(parsedData.quantity) || 1,
      confidence: Math.min(Math.max(parseFloat(parsedData.confidence) || 0.5, 0), 1)
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar produto individual:', error)
    return {
      name: 'Erro no processamento',
      description: 'Não foi possível processar a imagem',
      category: 'Erro',
      price: 0,
      quantity: 1,
      confidence: 0.1
    }
  }
}
