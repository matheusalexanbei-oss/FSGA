import { BotResponse, ParsedCommand } from '../types'
import { Product } from '@/types/product'
import { searchProducts } from '../product-search'

/**
 * Handler para consulta de estoque
 */
export async function handleCheckStock(
  command: ParsedCommand,
  products: Product[]
): Promise<BotResponse> {
  const { productName } = command.entities
  
  if (!productName) {
    // Listar todos os produtos com estoque baixo (<= 5)
    const lowStock = products.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0)
    const outOfStock = products.filter(p => p.stock_quantity === 0)
    
    if (lowStock.length === 0 && outOfStock.length === 0) {
      return {
        message: "✅ Todos os produtos têm estoque adequado!",
        type: 'success',
        data: { allProductsInStock: true }
      }
    }
    
    let message = ''
    if (outOfStock.length > 0) {
      message += `❌ Produtos sem estoque (${outOfStock.length}):\n\n`
      message += outOfStock.map(p => `• ${p.name}`).join('\n')
    }
    
    if (lowStock.length > 0) {
      if (message) message += '\n\n'
      message += `⚠️ Produtos com estoque baixo (${lowStock.length}):\n\n`
      message += lowStock.map(p => `• ${p.name}: ${p.stock_quantity} unidades`).join('\n')
    }
    
    return {
      message,
      type: 'info',
      data: { 
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock
      }
    }
  }
  
  // Buscar produto usando busca flexível
  const matches = searchProducts(products, productName)
  
  if (matches.length === 0) {
    return {
      message: `Não encontrei o produto "${productName}".`,
      type: 'error',
      suggestions: ['listar produtos']
    }
  }
  
  if (matches.length === 1) {
    const product = matches[0]
    const status = product.stock_quantity > 0 
      ? `✅ ${product.stock_quantity} ${product.stock_quantity === 1 ? 'unidade disponível' : 'unidades disponíveis'}`
      : '❌ Sem estoque'
    
    let message = `📦 ${product.name}\n`
    message += `${status}\n`
    message += `💰 Preço: R$ ${product.price.toFixed(2)}`
    
    if (product.description) {
      message += `\n📝 ${product.description}`
    }
    
    // Calcular valor total em estoque
    const totalValue = product.stock_quantity * product.price
    message += `\n💵 Valor total em estoque: R$ ${totalValue.toFixed(2)}`
    
    return {
      message,
      type: 'info',
      data: { product }
    }
  }
  
  // Múltiplos produtos encontrados - somar quantidades se forem similares
  // Se todos tiverem nomes muito similares, pode ser a mesma busca
  const totalQuantity = matches.reduce((sum, p) => sum + p.stock_quantity, 0)
  const totalValue = matches.reduce((sum, p) => sum + (p.stock_quantity * p.price), 0)
  
  // Se for uma consulta genérica (ex: "quantas argolas"), mostrar total
  const commandLower = command.raw.toLowerCase()
  const isGenericQuery = commandLower.includes('quantas') || commandLower.includes('quantos') || 
                         commandLower.includes('tenho') || commandLower.includes('tem')
  
  if (isGenericQuery && matches.length > 1) {
    // Se for uma pergunta direta (ex: "quantas argolas gota eu tenho"), priorizar exatidão
    const exactMatch = matches.find(p => 
      p.name.toLowerCase().includes(productName.toLowerCase()) ||
      productName.toLowerCase().includes(p.name.toLowerCase())
    )
    
    if (exactMatch && matches.length <= 3) {
      // Se houver match exato ou poucos resultados, mostrar todos com destaque
      let message = `📦 Encontrei ${matches.length} produto(s) relacionado(s) a "${productName}":\n\n`
      matches.forEach((p, index) => {
        const isExact = p.id === exactMatch?.id
        const prefix = isExact ? '✅' : '•'
        const status = p.stock_quantity > 0 
          ? `${p.stock_quantity} ${p.stock_quantity === 1 ? 'unidade' : 'unidades'}` 
          : 'Sem estoque'
        message += `${prefix} ${p.name}: ${status} - R$ ${p.price.toFixed(2)}\n`
      })
      message += `\n💵 Valor total: R$ ${totalValue.toFixed(2)}`
      
      return {
        message,
        type: 'info',
        data: { productMatches: matches, totalQuantity, totalValue }
      }
    }
    
    // Múltiplos produtos - mostrar total consolidado
    let message = `📦 Encontrei ${matches.length} produtos relacionados a "${productName}":\n\n`
    message += `✅ Total: ${totalQuantity} ${totalQuantity === 1 ? 'unidade' : 'unidades'}\n`
    message += `💵 Valor total: R$ ${totalValue.toFixed(2)}\n\n`
    message += `Detalhes:\n`
    matches.slice(0, 10).forEach(p => {
      const status = p.stock_quantity > 0 ? `✅ ${p.stock_quantity} unidades` : '❌ Sem estoque'
      message += `• ${p.name}: ${status} - R$ ${p.price.toFixed(2)}\n`
    })
    if (matches.length > 10) {
      message += `\n... e mais ${matches.length - 10} produto(s)`
    }
    
    return {
      message,
      type: 'info',
      data: { productMatches: matches, totalQuantity, totalValue }
    }
  }
  
  // Lista normal de produtos
  const list = matches.map(p => {
    const status = p.stock_quantity > 0 ? `✅ ${p.stock_quantity} unidades` : '❌ Sem estoque'
    return `• ${p.name}: ${status} - R$ ${p.price.toFixed(2)}`
  }).join('\n')
  
  return {
    message: `Encontrei ${matches.length} produtos:\n\n${list}\n\nDigite o nome completo para mais detalhes.`,
    type: 'info',
    data: { productMatches: matches }
  }
}

