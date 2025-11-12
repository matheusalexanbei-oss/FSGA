import { BotResponse, ParsedCommand } from '../types'
import { Product } from '@/types/product'
import { createClient } from '@/lib/supabase/client'
import { searchProducts } from '../product-search'

const supabase = createClient()

/**
 * Busca um produto por ID
 */
async function getProduct(productId: string, userId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('user_id', userId)
    .single()
  
  if (error || !data) return null
  return data as Product
}

/**
 * Atualiza o estoque de um produto (aumenta)
 */
async function increaseStock(productId: string, userId: string, quantity: number): Promise<void> {
  const product = await getProduct(productId, userId)
  if (!product) throw new Error('Produto não encontrado')
  
  const newStock = product.stock_quantity + quantity
  
  const { error } = await supabase
    .from('products')
    .update({
      stock_quantity: newStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .eq('user_id', userId)
  
  if (error) throw error
}

/**
 * Handler para reposição/aumento de estoque
 */
export async function handleRestockProduct(
  command: ParsedCommand,
  userId: string,
  products: Product[]
): Promise<BotResponse> {
  const { productName, quantity } = command.entities
  
  // Verificar se tem nome do produto
  if (!productName) {
    return {
      message: "Não consegui identificar qual produto você quer repor. Pode repetir?\n\nExemplo: \"reposição de 10 kit 5 pares de brincos\"",
      type: 'error',
      suggestions: ['reposição de 10 kit 5 pares de brincos', 'repor estoque']
    }
  }
  
  // Verificar se tem quantidade
  if (!quantity || quantity <= 0) {
    return {
      message: "Não consegui identificar a quantidade para repor. Pode repetir?\n\nExemplo: \"reposição de 10 kit 5 pares de brincos\"",
      type: 'error',
      suggestions: ['reposição de 10 kit 5 pares de brincos']
    }
  }
  
  // Buscar produtos usando busca flexível
  const matches = searchProducts(products, productName)
  
  if (matches.length === 0) {
    return {
      message: `Não encontrei nenhum produto com o nome "${productName}".\n\nQuer que eu liste os produtos disponíveis?`,
      type: 'question',
      data: {
        contextType: 'list_products',
        question: 'Quer que eu liste os produtos disponíveis?'
      },
      suggestions: ['sim', 'não', 'listar produtos']
    }
  }
  
  if (matches.length === 1) {
    // Produto único - executar diretamente
    const product = matches[0]
    
    try {
      await increaseStock(product.id, userId, quantity)
      
      const newStock = product.stock_quantity + quantity
      
      return {
        message: `✅ Estoque atualizado com sucesso!\n\n📦 ${product.name}\n➕ ${quantity} unidades adicionadas\n📊 Novo estoque: ${newStock} unidades`,
        type: 'success',
        data: {
          product: {
            ...product,
            stock_quantity: newStock
          }
        }
      }
    } catch (error: any) {
      return {
        message: `❌ Erro ao atualizar estoque: ${error.message || 'Erro desconhecido'}`,
        type: 'error'
      }
    }
  }
  
  // Múltiplos produtos - listar opções
  const options = matches.map((p, i) => 
    `${i + 1}. ${p.name} - Estoque atual: ${p.stock_quantity} unidades`
  ).join('\n')
  
  return {
    message: `Encontrei ${matches.length} produtos. Qual deles você quer repor?\n\n${options}\n\nDigite o número do produto.`,
    type: 'question',
    data: { productMatches: matches, restockQuantity: quantity },
    suggestions: matches.map((_, i) => (i + 1).toString())
  }
}

/**
 * Executa a reposição de estoque (após seleção de produto)
 */
export async function executeRestockProduct(
  productId: string,
  userId: string,
  quantity: number
): Promise<BotResponse> {
  try {
    const product = await getProduct(productId, userId)
    if (!product) {
      return {
        message: "❌ Produto não encontrado.",
        type: 'error'
      }
    }
    
    await increaseStock(productId, userId, quantity)
    
    const newStock = product.stock_quantity + quantity
    
    return {
      message: `✅ Estoque atualizado com sucesso!\n\n📦 ${product.name}\n➕ ${quantity} unidades adicionadas\n📊 Novo estoque: ${newStock} unidades`,
      type: 'success',
      data: {
        product: {
          ...product,
          stock_quantity: newStock
        }
      }
    }
  } catch (error: any) {
    return {
      message: `❌ Erro ao atualizar estoque: ${error.message || 'Erro desconhecido'}`,
      type: 'error'
    }
  }
}

