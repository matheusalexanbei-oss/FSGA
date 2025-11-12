import { NextRequest, NextResponse } from 'next/server'
import { processImageWithClaude } from '@/lib/ai/claudeProcessor'
import { processProductListWithClaude } from '@/lib/ai/listProcessor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const storeContextData = formData.get('storeContext') as string
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'Nenhuma imagem foi enviada' },
        { status: 400 }
      )
    }

    // Parse store context
    let storeContext = null
    if (storeContextData) {
      try {
        storeContext = JSON.parse(storeContextData)
      } catch (error) {
        console.warn('Erro ao parsear contexto da loja:', error)
      }
    }

    // Converter arquivo para base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`
    
    console.log('🔄 Processando imagem com Claude Vision...')
    
    // Primeiro, tentar detectar se é uma lista de produtos
    const listResult = await processProductListWithClaude(base64Image, storeContext)
    
    // Se for uma lista com múltiplos produtos, retornar a lista
    if (listResult.isList && listResult.products.length > 1) {
      console.log(`📋 Lista detectada com ${listResult.totalItems} produtos`)
      return NextResponse.json({
        success: true,
        isList: true,
        data: listResult
      })
    }
    
    // Se for apenas um produto, processar normalmente
    const result = await processImageWithClaude(base64Image, storeContext)
    
    return NextResponse.json({
      success: true,
      isList: false,
      data: result
    })
    
  } catch (error) {
    console.error('❌ Erro na API route:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Método GET para testar a API
export async function GET() {
  try {
    const { testClaudeConnection } = await import('@/lib/ai/claudeProcessor')
    const isConnected = await testClaudeConnection()
    
    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Claude API funcionando' : 'Claude API não disponível',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao testar conexão',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}







