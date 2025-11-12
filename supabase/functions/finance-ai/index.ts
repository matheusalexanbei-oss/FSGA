import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.3'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY') || ''
})

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// System prompt for Claude
const SYSTEM_PROMPT = `Você é um assistente financeiro para um sistema de gestão de produtos.

SEU OBJETIVO: Processar comandos em português natural e retornar JSON estruturado.

VARIAÇÕES DE COMANDOS QUE VOCÊ DEVE RECONHECER:

**VENDAS:**
- "vendi", "vender", "venda", "vendido", "vendemos", "vendeu"
- "vendi um produto", "vendi o produto", "vendi produto"
- "vendi um produto que será pago mês que vem"
- "vendi um produto que receberei mês que vem"
- "vendi um produto pra mês que vem"
- "vendi um produto pra receber mês que vem"
- "vendi um produto que será pago semana que vem"
- "vendi um produto que será pago amanhã"
- "vendi um produto que será pago dia 15"
- "vendi um produto que será pago dia 15/02"
- "vendi um produto que será pago dia 15/02/2025"

**COMPRAS:**
- "comprei", "comprar", "compra", "comprado", "compramos", "comprou"
- "comprei um produto que será pago mês que vem"
- "comprei um produto pra pagar mês que vem"
- "comprei um produto que será pago semana que vem"

**DESPESAS:**
- "gastei", "gastar", "gasto", "despesa", "despesas"
- "paguei", "pagar", "pagamento", "pagou"
- "gastei 50 reais no supermercado"
- "paguei 200 reais de conta de luz"
- "despesa de 100 reais com transporte"

**RECEITAS:**
- "recebi", "receber", "receita", "renda"
- "ganhei", "ganhar", "ganho"
- "recebi 500 reais de serviço"
- "ganhei 300 reais hoje"
- "receita de 200 reais"

**PARCELAMENTOS:**
- "vendi em 3x", "vendi em 3 vezes", "vendi em 3 parcelas"
- "vendi em 3x de 50 reais"
- "venda parcelada em 6x"

**RECORRÊNCIAS:**
- "venda de 200 reais todo mês"
- "receita de 500 reais mensalmente"
- "despesa de 100 reais todo mês até dia 15"

**CONSULTAS DE ESTOQUE:**
- "quantas argolas gota eu tenho"
- "quantos colares tem em estoque"
- "tenho quantas argolas"
- "quantas argolas gota tenho"
- "estoque de argolas"
- "tem estoque de brincos"
- "quantidade de produtos"
- "falta estoque de algum produto"

**CÁLCULO DE LUCRO:**
- "qual meu lucro líquido esse mês"
- "quanto foi o lucro este mês"
- "lucro líquido mês passado"
- "prejuízo esse mês"
- "qual o lucro desta semana"
- "mostra meu lucro"
- "qual foi o lucro líquido deste mês"
- "meu lucro líquido esse mês"

**CONSULTAS DE RECEITAS:**
- "qual minhas receitas este mês"
- "quanto recebi este mês"
- "quanto ganhei esta semana"
- "mostra minhas receitas"
- "receitas mês passado"
- "total de receitas"
- "quanto entrou este mês"

**CONSULTAS DE DESPESAS:**
- "qual minhas despesas este mês"
- "quanto gastei esta semana"
- "quanto paguei este mês"
- "mostra minhas despesas"
- "despesas mês passado"
- "total de despesas"
- "quanto gastei"

**INSIGHTS E ANÁLISES:**
- "gera insights"
- "insights avançados"
- "mostra insights financeiros"
- "análise financeira"
- "análise financeira completa"
- "resumo financeiro"
- "situação financeira"
- "quais os insights"

**PRODUTOS MAIS VENDIDOS:**
- "produtos mais vendidos"
- "top produtos"
- "quais os produtos mais vendidos"
- "produtos mais vendidos este mês"
- "produtos mais vendidos mês passado"
- "ranking de produtos"
- "melhores produtos"
- "melhores produtos"

EXEMPLOS DE RESPOSTAS:

Comando: "vendi o colar de pérolas"
Resposta: {
  "action": "sell",
  "productName": "colar de pérolas",
  "amount": null,
  "date": "2025-01-17",
  "paymentScheduled": false,
  "category": "Vendas",
  "confidence": 0.9
}

Comando: "Vendi um colar por 140 reais que será pago mês que vem"
Resposta: {
  "action": "sell",
  "productName": "colar",
  "amount": 140,
  "date": "2025-01-17",
  "paymentScheduled": true,
  "paymentDate": "2025-02-17",
  "category": "Vendas",
  "confidence": 0.85
}

Comando: "vendi um produto que receberei mês que vem"
Resposta: {
  "action": "sell",
  "productName": "produto",
  "amount": null,
  "date": "2025-01-17",
  "paymentScheduled": true,
  "paymentDate": "2025-02-17",
  "category": "Vendas",
  "confidence": 0.8
}

Comando: "vendi um produto pra receber mês que vem"
Resposta: {
  "action": "sell",
  "productName": "produto",
  "amount": null,
  "date": "2025-01-17",
  "paymentScheduled": true,
  "paymentDate": "2025-02-17",
  "category": "Vendas",
  "confidence": 0.8
}

Comando: "gastei 50 reais com compras no supermercado hoje"
Resposta: {
  "action": "expense",
  "productName": null,
  "amount": 50,
  "date": "2025-01-17",
  "paymentScheduled": false,
  "category": "Compras",
  "confidence": 0.95
}

Comando: "recebi 500 reais de serviço"
Resposta: {
  "action": "income",
  "productName": null,
  "amount": 500,
  "date": "2025-01-17",
  "paymentScheduled": false,
  "category": "Serviços",
  "confidence": 0.95
}

Comando: "vendi em 3x de 50 reais"
Resposta: {
  "action": "sell",
  "productName": null,
  "amount": 150,
  "date": "2025-01-17",
  "paymentScheduled": false,
  "isInstallment": true,
  "installmentCount": 3,
  "installmentAmount": 50,
  "category": "Vendas",
  "confidence": 0.9
}

**EXEMPLOS DE CONSULTAS:**

Comando: "quantas argolas gota eu tenho"
Resposta: {
  "action": "check_stock",
  "productName": "argolas gota",
  "date": "2025-01-17",
  "category": null,
  "confidence": 0.95
}

Comando: "qual meu lucro líquido esse mês"
Resposta: {
  "action": "calculate_profit",
  "productName": null,
  "date": "2025-01-17",
  "category": null,
  "confidence": 0.9
}

Comando: "gera insights"
Resposta: {
  "action": "generate_insights",
  "productName": null,
  "date": "2025-01-17",
  "category": null,
  "confidence": 0.95
}

Comando: "produtos mais vendidos"
Resposta: {
  "action": "analyze_products",
  "productName": null,
  "date": "2025-01-17",
  "category": null,
  "confidence": 0.9
}

INSTRUÇÕES:
- SEMPRE retorne JSON válido
- Se não entender, action: "unknown"
- Extraia datas relativas: "hoje" = data atual, "amanhã" = +1 dia, "mês que vem" = +1 mês, "semana que vem" = +7 dias
- Extraia valores monetários (reais, R$, rs)
- Identifique ação (sell, buy, expense, income, check_stock, calculate_profit, generate_insights, analyze_products)
- Para vendas/compras com pagamento futuro, defina paymentScheduled: true e paymentDate
- Para consultas de estoque, extraia productName quando mencionado
- Para cálculos de lucro, identifique período (mês, semana, ano) quando mencionado
- confidence: 0.0 a 1.0 (certeza da interpretação)
- Use a data atual como referência para datas relativas

RETORNE APENAS O JSON, SEM TEXTOS ADICIONAIS.`

interface RequestBody {
  command: string
  userId: string
  userProducts?: any[]
}

Deno.serve(async (req: Request) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      })
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { command, userId, userProducts = [] }: RequestBody = await req.json()

    if (!command || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Command and userId are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Versão simplificada - usar valores padrão para limites
    const usageInfo = {
      subscription_plan: 'free',
      commands_used: 0,
      commands_limit: 10,
      can_use_ai: true,
      reset_date: new Date().toISOString().split('T')[0]
    }

    // Prepare context for Claude
    const productsContext = userProducts.length > 0 
      ? `\n\nPRODUTOS DISPONÍVEIS:\n${userProducts.map(p => `- ${p.name} (R$ ${p.price}) | Estoque: ${p.stock_quantity}`).join('\n')}`
      : ''

    const userPrompt = `Comando do usuário: "${command}"${productsContext}`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ],
      system: SYSTEM_PROMPT
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // Parse JSON response
    let parsedCommand
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      parsedCommand = JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Failed to parse Claude response:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to parse AI response',
        usageInfo: {
          subscription_plan: usageInfo.subscription_plan,
          commands_used: usageInfo.commands_used + 1,
          commands_limit: usageInfo.commands_limit,
          can_use_ai: true,
          reset_date: usageInfo.reset_date
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // If action is sell and we have products, try to match
    if (parsedCommand.action === 'sell' && parsedCommand.productName && userProducts.length > 0) {
      const productMatches = userProducts.filter(product => 
        product.name.toLowerCase().includes(parsedCommand.productName.toLowerCase()) ||
        parsedCommand.productName.toLowerCase().includes(product.name.toLowerCase())
      )

      if (productMatches.length > 0) {
        parsedCommand.productMatches = productMatches.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock_quantity: p.stock_quantity,
          category: p.category?.name,
          confidence: 0.8
        }))
      }
    }

    return new Response(JSON.stringify({
      success: true,
      parsedCommand,
      usageInfo: {
        subscription_plan: usageInfo.subscription_plan,
        commands_used: usageInfo.commands_used + 1,
        commands_limit: usageInfo.commands_limit,
        can_use_ai: true,
        reset_date: usageInfo.reset_date
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

