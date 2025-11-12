// Processador de texto com Claude API
import Anthropic from '@anthropic-ai/sdk'
import type { AIProductData } from './claudeProcessor'
import type { ProductListItem, ListProcessingResult } from './listProcessor'

// Inicializar cliente Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
})

// Verificar se a API key está configurada
if (!anthropic.apiKey) {
  console.error('❌ ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente')
  console.log('💡 Configure com: $env:ANTHROPIC_API_KEY="sk-ant-sua-chave-aqui"')
}

// Função para processar texto e extrair informações de produto único
export async function processTextWithClaude(
  text: string,
  storeContext?: { storeType: string; storeDescription: string; commonCategories: string[] }
): Promise<AIProductData> {
  try {
    console.log('🤖 Iniciando processamento de texto com Claude...')
    
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
          content: `Analise o seguinte texto e extraia informações de produto em português brasileiro:

TEXTO:
${text}

Extraia as seguintes informações:

1. **Nome do Produto**: Identifique o nome/título do produto
2. **Descrição**: Descreva características do produto mencionadas no texto (formato, forma, estilo, etc.)
3. **Categoria**: Classifique em uma categoria apropriada (ex: Eletrônicos, Joias, Roupas, Casa, Esportes, etc.)
4. **Preço**: Se houver preço mencionado no texto, extraia-o. Se não houver, deixe como 0
5. **Confiança**: Avalie sua confiança na análise (0.0 a 1.0)

IMPORTANTE - REGRAS DE DESCRIÇÃO:
- NÃO mencione materiais específicos como "ouro", "prata", "diamante", "zircônia" etc. a menos que estejam explicitamente no texto
- Descreva características mencionadas no texto: formatos, formas, cores, estilos
- Use termos genéricos quando necessário
- Foque em características descritas: "circular", "quadrado", "trançado", "liso", "cravejado"

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
  "description": "descrição focada em características mencionadas",
  "category": "categoria",
  "price": valor_numérico,
  "confidence": valor_entre_0_e_1
}

Se não conseguir identificar o produto claramente, use valores genéricos mas realistas.`
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
    console.error('❌ Erro ao processar texto com Claude:', error)
    
    // Fallback em caso de erro
    return {
      name: 'Erro no processamento',
      description: 'Não foi possível processar o texto com Claude',
      category: 'Erro',
      price: 0,
      confidence: 0.1
    }
  }
}

// Função para processar texto e extrair lista de produtos
export async function processTextListWithClaude(
  text: string,
  storeContext?: { storeType: string; storeDescription: string; commonCategories: string[] }
): Promise<ListProcessingResult> {
  try {
    console.log('📋 Iniciando processamento de lista de texto com Claude...')
    
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
          content: `Analise o seguinte texto e identifique se ele contém uma LISTA de produtos. Se for uma lista, extraia TODOS os produtos individuais.

TEXTO:
${text}

IMPORTANTE:
1. Se for uma lista/catálogo/planilha com múltiplos produtos, extraia CADA item separadamente
2. Se for apenas um produto único, retorne apenas esse produto
3. Identifique preços, quantidades e categorias quando mencionados no texto
4. Seja preciso na separação dos itens
5. ${storeContext ? `CONTEXTO DA LOJA: Esta é uma loja de "${storeContext.storeType}" - ${storeContext.storeDescription}. Use as categorias mais comuns para este tipo de loja: ${storeContext.commonCategories?.join(', ')}.` : ''}

REGRAS DE DESCRIÇÃO:
- NÃO mencione materiais específicos como "ouro", "prata", "diamante", "zircônia" etc. a menos que estejam explicitamente no texto
- Descreva características mencionadas: formatos, formas, cores, estilos
- Use termos genéricos quando necessário
- Foque em características descritas: "circular", "quadrado", "trançado", "liso", "cravejado"

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
      "quantity": quantidade_se_mencionada_ou_1,
      "confidence": valor_entre_0_e_1
    },
    {
      "name": "nome do produto 2",
      "description": "descrição do produto 2",
      "category": "categoria",
      "price": valor_numérico,
      "quantity": quantidade_se_mencionada_ou_1,
      "confidence": valor_entre_0_e_1
    }
  ],
  "summary": "resumo breve da lista extraída"
}

Se for apenas um produto único, retorne isList: false e um array com um único produto.`
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
    const products: ProductListItem[] = (parsedData.products || []).map((p: any) => ({
      name: p.name || 'Produto não identificado',
      description: p.description || '',
      category: p.category || 'Outros',
      categories: p.categories || (p.category ? [p.category] : []),
      price: parseFloat(p.price) || 0,
      quantity: parseInt(p.quantity) || 1,
      confidence: Math.min(Math.max(parseFloat(p.confidence) || 0.5, 0), 1)
    }))
    
    const result: ListProcessingResult = {
      isList: parsedData.isList !== false && products.length > 1,
      totalItems: products.length,
      products: products,
      summary: parsedData.summary || ''
    }
    
    console.log(`✅ Lista processada: ${result.totalItems} produtos encontrados`)
    return result
    
  } catch (error) {
    console.error('❌ Erro ao processar lista de texto com Claude:', error)
    
    // Fallback em caso de erro
    return {
      isList: false,
      totalItems: 0,
      products: [],
      summary: 'Erro ao processar texto'
    }
  }
}



