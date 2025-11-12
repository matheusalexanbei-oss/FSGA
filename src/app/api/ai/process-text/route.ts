import { NextRequest, NextResponse } from 'next/server'
import { processTextWithClaude } from '@/lib/ai/textProcessor'
import { processTextListWithClaude } from '@/lib/ai/textProcessor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const text = body.text as string
    const storeContextData = body.storeContext
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nenhum texto foi fornecido' },
        { status: 400 }
      )
    }

    // Parse store context
    let storeContext = null
    if (storeContextData) {
      try {
        storeContext = typeof storeContextData === 'string' 
          ? JSON.parse(storeContextData) 
          : storeContextData
      } catch (error) {
        console.warn('Erro ao parsear contexto da loja:', error)
      }
    }

    console.log('🔄 Processando texto com Claude...')
    
    // Primeiro, tentar detectar se é uma lista de produtos
    const listResult = await processTextListWithClaude(text, storeContext)
    
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
    const result = await processTextWithClaude(text, storeContext)
    
    return NextResponse.json({
      success: true,
      isList: false,
      data: result
    })
    
  } catch (error) {
    console.error('❌ Erro na API route:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar texto',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}



