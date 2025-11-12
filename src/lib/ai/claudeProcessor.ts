// Processador de imagens com Claude Vision API real
import Anthropic from '@anthropic-ai/sdk'

export interface AIProductData {
  name: string
  description?: string
  category?: string
  price?: number
  confidence: number
}

// Inicializar cliente Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
})

// Verificar se a API key está configurada
if (!anthropic.apiKey) {
  console.error('❌ ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente')
  console.log('💡 Configure com: $env:ANTHROPIC_API_KEY="sk-ant-sua-chave-aqui"')
}

// Função para converter base64 para formato Claude
function convertBase64ForClaude(base64String: string): string {
  // Remover o prefixo data:image/...;base64,
  const base64Data = base64String.split(',')[1]
  return base64Data
}

// Função para detectar tipo de imagem
function getImageType(base64String: string): string {
  if (base64String.includes('data:image/jpeg')) return 'image/jpeg'
  if (base64String.includes('data:image/png')) return 'image/png'
  if (base64String.includes('data:image/webp')) return 'image/webp'
  if (base64String.includes('data:image/gif')) return 'image/gif'
  return 'image/jpeg' // default
}

// Função principal para processar imagem com Claude Vision
export async function processImageWithClaude(imageData: string, storeContext?: { storeType: string; storeDescription: string; commonCategories: string[] }): Promise<AIProductData> {
  try {
    console.log('🤖 Iniciando processamento com Claude Vision...')
    
    const base64Image = convertBase64ForClaude(imageData)
    const imageType = getImageType(imageData)
    
    // Verificar se a API key está disponível
    if (!anthropic.apiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada. Configure com: $env:ANTHROPIC_API_KEY="sk-ant-sua-chave-aqui"')
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta imagem de produto e extraia as seguintes informações em português brasileiro:

1. **Nome do Produto**: Identifique o nome/título do produto
2. **Descrição**: Descreva APENAS os formatos, formas e características visíveis (ex: "anel circular", "pulseira trançada", "brinco pendente")
3. **Categoria**: Classifique em uma categoria apropriada (ex: Eletrônicos, Joias, Roupas, Casa, Esportes, etc.)
4. **Preço**: Se houver preço visível na imagem, extraia-o. Se não houver, NÃO sugira preço - deixe como 0
5. **Confiança**: Avalie sua confiança na análise (0.0 a 1.0)

IMPORTANTE - REGRAS DE DESCRIÇÃO:
- NÃO mencione materiais específicos como "ouro", "prata", "diamante", "zircônia" etc.
- Descreva APENAS o que você vê: formatos, formas, cores, estilos
- Use termos genéricos como "metal", "pedra", "material" quando necessário
- Foque em características visuais: "circular", "quadrado", "trançado", "liso", "cravejado"

${storeContext ? `CONTEXTO DA LOJA: Esta é uma loja de "${storeContext.storeType}" - ${storeContext.storeDescription}. Use as categorias mais comuns para este tipo de loja: ${storeContext.commonCategories?.join(', ')}.` : ''}

CATEGORIZAÇÃO INTELIGENTE:
- Se o nome do produto contém palavras como "pulseira", "bracelete", "braçadeira" → categoria "Pulseiras"
- Se contém "anel", "anél" → categoria "Anéis"  
- Se contém "brinco", "argola" → categoria "Brincos"
- Se contém "tornozeleira", "tornozela" → categoria "Tornozeleiras"
- Se contém "corrente", "colar" → categoria "Correntes"
- Se contém "piercing" → categoria "Piercings"
- Evite criar categorias duplicadas ou similares

Responda APENAS no seguinte formato JSON, sem texto adicional:
{
  "name": "nome do produto",
  "description": "descrição focada em formato e características visuais",
  "category": "categoria",
  "price": valor_numérico,
  "confidence": valor_entre_0_e_1
}

Se não conseguir identificar o produto claramente, use valores genéricos mas realistas.`
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
    const result: AIProductData = {
      name: parsedData.name || 'Produto não identificado',
      description: parsedData.description || 'Descrição não disponível',
      category: parsedData.category || 'Outros',
      price: parseFloat(parsedData.price) || 0,
      confidence: Math.min(Math.max(parseFloat(parsedData.confidence) || 0.5, 0), 1)
    }
    
    console.log('✅ Dados processados:', result)
    return result
    
  } catch (error) {
    console.error('❌ Erro ao processar com Claude:', error)
    
    // Fallback em caso de erro
    return {
      name: 'Erro no processamento',
      description: 'Não foi possível processar a imagem com Claude',
      category: 'Erro',
      price: 0,
      confidence: 0.1
    }
  }
}

// Função para processar múltiplas imagens em lote
export async function processBatchImagesWithClaude(images: string[]): Promise<AIProductData[]> {
  const results: AIProductData[] = []
  
  for (let i = 0; i < images.length; i++) {
    try {
      console.log(`🔄 Processando imagem ${i + 1}/${images.length}...`)
      const result = await processImageWithClaude(images[i])
      results.push(result)
      
      // Pequeno delay entre requisições para evitar rate limiting
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`❌ Erro ao processar imagem ${i + 1}:`, error)
      results.push({
        name: 'Erro no processamento',
        description: `Erro ao processar imagem ${i + 1}`,
        category: 'Erro',
        price: 0,
        confidence: 0.1
      })
    }
  }
  
  return results
}

// Função para testar a conexão com Claude
export async function testClaudeConnection(): Promise<boolean> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: "Responda apenas: OK"
        }
      ]
    })
    
    console.log('✅ Claude API funcionando!')
    return true
  } catch (error) {
    console.error('❌ Erro na conexão com Claude:', error)
    return false
  }
}
