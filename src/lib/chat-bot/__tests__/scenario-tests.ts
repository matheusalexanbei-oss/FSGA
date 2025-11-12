import { createSupabaseMock, SupabaseMockClient } from './supabase-mock'
import type { Product } from '@/types/product'
import type { SupabaseMockState } from './supabase-mock'
import type { BotResponse, ConfirmationData } from '../types'
import { clearConversationContext } from '../context'

const supabaseMock = createSupabaseMock()
;(globalThis as any).__TEST_SUPABASE_CLIENT__ = supabaseMock

type ProcessCommandFn = (
  command: string,
  userId: string,
  products?: Product[]
) => Promise<BotResponse>

type ExecuteConfirmedActionFn = (
  data: ConfirmationData,
  userId: string,
  products?: Product[]
) => Promise<BotResponse>

interface BotHandlers {
  processCommand: ProcessCommandFn
  executeConfirmedAction: ExecuteConfirmedActionFn
}

let cachedHandlers: BotHandlers | null = null

async function getBotHandlers(): Promise<BotHandlers> {
  if (!cachedHandlers) {
    const module = await import('../index')
    cachedHandlers = {
      processCommand: module.processCommand,
      executeConfirmedAction: module.executeConfirmedAction
    }
  }
  return cachedHandlers
}

interface ScenarioResult {
  name: string
  passed: boolean
  details?: string
}

const USER_ID = 'test-user'

interface BaseProductOptions {
  includeSimilar?: boolean
}

function createBaseProducts(options: BaseProductOptions = {}): Product[] {
  const timestamp = new Date().toISOString()
  return [
    {
      id: 'prod-colar',
      user_id: USER_ID,
      category_id: null,
      name: 'Colar de Pérolas',
      description: 'Colar clássico',
      code: null,
      price: 120,
      cost: 60,
      stock_quantity: 500,
      image_url: null,
      images: [],
      ai_processed: false,
      created_at: timestamp,
      updated_at: timestamp
    },
    {
      id: 'prod-pulseira',
      user_id: USER_ID,
      category_id: null,
      name: 'Pulseira Elegante',
      description: 'Pulseira banhada a ouro',
      code: null,
      price: 75,
      cost: 35,
      stock_quantity: 500,
      image_url: null,
      images: [],
      ai_processed: false,
      created_at: timestamp,
      updated_at: timestamp
    },
    {
      id: 'prod-produto-x',
      user_id: USER_ID,
      category_id: null,
      name: 'Produto X',
      description: 'Produto genérico para testes',
      code: null,
      price: 90,
      cost: 40,
      stock_quantity: 15,
      image_url: null,
      images: [],
      ai_processed: false,
      created_at: timestamp,
      updated_at: timestamp
    },
    ...(options.includeSimilar
      ? [
          {
            id: 'prod-colar-luxo',
            user_id: USER_ID,
            category_id: null,
            name: 'Colar Luxo Cristal',
            description: 'Variação de colar',
            code: null,
            price: 250,
            cost: 120,
            stock_quantity: 5,
            image_url: null,
            images: [],
            ai_processed: false,
            created_at: timestamp,
            updated_at: timestamp
          } as Product
        ]
      : []),
    {
      id: 'prod-assinatura',
      user_id: USER_ID,
      category_id: null,
      name: 'Assinatura Premium',
      description: 'Plano mensal recorrente',
      code: null,
      price: 200,
      cost: 0,
      stock_quantity: 999,
      image_url: null,
      images: [],
      ai_processed: false,
      created_at: timestamp,
      updated_at: timestamp
    }
  ]
}

function createSupabaseState(products: Product[]): SupabaseMockState {
  return {
    products: products.map((product) => ({ ...product })),
    financial_transactions: []
  }
}

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function getSupabaseState(mock: SupabaseMockClient) {
  return mock.snapshot()
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function pickProductMatch(matches: Product[], command: string): number {
  if (matches.length === 1) return 0
  const normalizedCommand = normalize(command)

  const bestIndex = matches.findIndex(match =>
    normalizedCommand.includes(normalize(match.name))
  )

  if (bestIndex >= 0) {
    return bestIndex
  }

  return 0
}

async function runSaleFlow(
  command: string,
  products: Product[],
  supabaseMock: SupabaseMockClient,
  handlers: BotHandlers,
  expected: {
    quantity?: number
    totalAmount?: number
    scheduled?: boolean
    installments?: number
    recurring?: boolean
    interval?: 'monthly' | 'weekly' | 'quarterly'
  } = {}
) {
  const previousSnapshot = supabaseMock.snapshot()
  const previousTransactionCount = previousSnapshot.financial_transactions.length

  let response = await handlers.processCommand(command, USER_ID, products)

  let safetyCounter = 0
  while (response.type === 'question' && safetyCounter < 5) {
    safetyCounter++

    if (response.data?.productMatches) {
      const matches: Product[] = response.data.productMatches
      const indexToPick = pickProductMatch(matches, command)
      const selection = String(indexToPick + 1)
      response = await handlers.processCommand(selection, USER_ID, products)
      continue
    }

    if (response.requiresInput) {
      throw new Error(`Fluxo de venda pediu informação adicional inesperada para "${command}"`)
    }

    throw new Error(`Fluxo de venda gerou pergunta inesperada para "${command}": ${response.message}`)
  }

  assert(
    response.type === 'confirmation' && response.requiresConfirmation,
    `Comando "${command}" deveria solicitar confirmação`
  )

  const confirmation = response.confirmationData
  assert(confirmation, 'Dados de confirmação ausentes')

  const result = await handlers.executeConfirmedAction(confirmation, USER_ID)

  assert(result.type === 'success', `Execução do comando "${command}" deveria ter sucesso`)

  const state = getSupabaseState(supabaseMock)
  const newTransactions = state.financial_transactions.slice(previousTransactionCount)
  const product = state.products.find((p) => p.id === confirmation.productId)
  assert(product, 'Produto não encontrado após execução')

  const initialProduct = products.find((p) => p.id === product!.id)
  assert(initialProduct, 'Produto inicial não encontrado para comparação')

  const quantity = expected.quantity ?? confirmation.quantity ?? 1
  assert(
    product!.stock_quantity === initialProduct!.stock_quantity - quantity,
    `Estoque deveria reduzir ${quantity} unidades`
  )

  if (expected.installments && expected.installments > 1) {
    assert(
      newTransactions.length === expected.installments,
      `Venda parcelada deveria gerar ${expected.installments} transações`
    )
    newTransactions.forEach((t, index) => {
      assert(t.is_installment, 'Transação deveria estar marcada como parcela')
      assert(t.installment_count === expected.installments, 'Total de parcelas incorreto')
      assert(t.installment_number === index + 1, 'Número da parcela incorreto')
      if (expected.interval) {
        assert(t.installment_interval === expected.interval, 'Intervalo da parcela incorreto')
      }
    })
    if (expected.totalAmount) {
      const total = newTransactions.reduce((sum, t) => sum + t.amount, 0)
      assert(Math.abs(total - expected.totalAmount) < 0.01, 'Valor total das parcelas incorreto')
    }
  } else if (expected.recurring) {
    assert(
      newTransactions.length === 1,
      'Venda recorrente deveria gerar transação única agendada'
    )
    const recurring = newTransactions[0]
    assert(recurring.notes?.includes('Recorrente'), 'Transação recorrente sem nota correta')
    if (expected.interval) {
      assert(
        recurring.notes?.includes(expected.interval),
        'Intervalo recorrente não registrado na nota'
      )
    }
  } else {
    assert(newTransactions.length === 1, 'Venda simples deveria gerar 1 transação')
    const transaction = newTransactions[0]
    if (expected.totalAmount) {
      assert(
        Math.abs(transaction.amount - expected.totalAmount) < 0.01,
        `Valor da transação deveria ser ${expected.totalAmount}`
      )
    }
    if (expected.scheduled) {
      assert(transaction.is_paid === false, 'Transação agendada deveria estar como não paga')
      assert(transaction.scheduled_date, 'Transação agendada deveria ter data futura')
    } else {
      assert(transaction.is_paid === true, 'Transação imediata deveria estar paga')
    }
  }

  // Atualizar produtos para próximos testes com base no estado atual
  return state.products as Product[]
}

async function runExpenseFlow(
  command: string,
  supabaseMock: SupabaseMockClient,
  handlers: BotHandlers,
  expectedAmount: number
) {
  clearConversationContext()
  const response = await handlers.processCommand(command, USER_ID, [])

  if (response.type === 'question' && response.requiresInput) {
    // Fornecer valor esperado
    const valueResponse = await handlers.processCommand(`${expectedAmount} reais`, USER_ID, [])
    assert(valueResponse.type === 'confirmation', 'Despesa deveria gerar confirmação')
    const confirmation = valueResponse.confirmationData
    assert(confirmation, 'Confirmação da despesa ausente')
    const result = await handlers.executeConfirmedAction(confirmation, USER_ID)
    assert(result.type === 'success', 'Despesa deveria ser registrada com sucesso')
  } else {
    assert(response.type === 'confirmation', 'Despesa deveria gerar confirmação direta')
    const confirmation = response.confirmationData
    assert(confirmation, 'Confirmação da despesa ausente')
    const result = await handlers.executeConfirmedAction(confirmation, USER_ID)
    assert(result.type === 'success', 'Despesa deveria ser registrada com sucesso')
  }

  const state = getSupabaseState(supabaseMock)
  const expense = state.financial_transactions.find(
    (t) => t.type === 'expense' && Math.abs(t.amount - expectedAmount) < 0.01
  )

  assert(expense, `Despesa de ${expectedAmount} reais deveria existir`)
}

async function runIncomeFlow(
  command: string,
  supabaseMock: SupabaseMockClient,
  handlers: BotHandlers,
  expectedAmount: number
) {
  clearConversationContext()
  const response = await handlers.processCommand(command, USER_ID, [])
  assert(response.type === 'confirmation', 'Receita deveria gerar confirmação')
  const confirmation = response.confirmationData
  assert(confirmation, 'Confirmação da receita ausente')
  const result = await handlers.executeConfirmedAction(confirmation, USER_ID)
  assert(result.type === 'success', 'Receita deveria ser registrada com sucesso')

  const state = getSupabaseState(supabaseMock)
  const income = state.financial_transactions.find(
    (t) => t.type === 'income' && Math.abs(t.amount - expectedAmount) < 0.01
  )

  assert(income, `Receita de ${expectedAmount} reais deveria existir`)
}

async function runAmbiguousCommand(command: string, handlers: BotHandlers) {
  clearConversationContext()
  const response = await handlers.processCommand(command, USER_ID, [])
  assert(
    response.type === 'error' || response.type === 'question',
    `Comando ambíguo "${command}" deveria pedir esclarecimentos`
  )
}

async function runSimilarProductsScenario(products: Product[], handlers: BotHandlers) {
  clearConversationContext()
  const response = await handlers.processCommand('vendi colar', USER_ID, products)
  assert(
    response.type === 'question',
    'Quando múltiplos produtos similares existem, o bot deveria perguntar qual deles'
  )
  assert(
    response.suggestions && response.suggestions.length > 0,
    'Sugestões numéricas deveriam ser oferecidas'
  )
}

export async function runScenarioTestSuite(): Promise<ScenarioResult[]> {
  const handlers = await getBotHandlers()

  const scenarios: Array<[string, () => Promise<void>]> = [
    [
      'Teste 1: Vendas Simples',
      async () => {
        const baseProducts = createBaseProducts()
        supabaseMock.setState(createSupabaseState(baseProducts))

        let currentProducts = baseProducts
        currentProducts = await runSaleFlow(
          'vendi o colar de pérolas',
          currentProducts,
          supabaseMock,
          handlers,
          { quantity: 1, totalAmount: 120 }
        )

        currentProducts = await runSaleFlow(
          'vendi 2 pulseiras por 150 reais',
          currentProducts,
          supabaseMock,
          handlers,
          { quantity: 2, totalAmount: 300 }
        )

        await runSaleFlow(
          'vendi produto x por 200 reais',
          currentProducts,
          supabaseMock,
          handlers,
          { quantity: 1, totalAmount: 200 }
        )
      }
    ],
    [
      'Teste 2: Vendas com Agendamento',
      async () => {
        const baseProducts = createBaseProducts()
        supabaseMock.setState(createSupabaseState(baseProducts))
        let currentProducts = baseProducts

        currentProducts = await runSaleFlow(
          'vendi o colar de pérolas que será pago mês que vem',
          currentProducts,
          supabaseMock,
          handlers,
          { scheduled: true }
        )

        currentProducts = await runSaleFlow(
          'vendi o produto x por 150 reais, pagamento dia 15',
          currentProducts,
          supabaseMock,
          handlers,
          { totalAmount: 150, scheduled: true }
        )

        await runSaleFlow(
          'vendi o colar de pérolas com pagamento em 30 dias',
          currentProducts,
          supabaseMock,
          handlers,
          { scheduled: true }
        )
      }
    ],
    [
      'Teste 3: Parcelamentos',
      async () => {
        const baseProducts = createBaseProducts()
        supabaseMock.setState(createSupabaseState(baseProducts))
        let currentProducts = baseProducts

        currentProducts = await runSaleFlow(
          'vendi o colar de pérolas em 3x de 50 reais',
          currentProducts,
          supabaseMock,
          handlers,
          { installments: 3, totalAmount: 150 }
        )

        currentProducts = await runSaleFlow(
          'vendi produto x em 6 parcelas mensais de 100 reais',
          currentProducts,
          supabaseMock,
          handlers,
          { installments: 6, interval: 'monthly', totalAmount: 600 }
        )

        await runSaleFlow(
          'vendi o colar de pérolas em 4x semanais de 25 reais',
          currentProducts,
          supabaseMock,
          handlers,
          { installments: 4, interval: 'weekly', totalAmount: 100 }
        )
      }
    ],
    [
      'Teste 4: Recorrências',
      async () => {
        const baseProducts = createBaseProducts()
        supabaseMock.setState(createSupabaseState(baseProducts))
        let currentProducts = baseProducts

        currentProducts = await runSaleFlow(
          'vendi assinatura premium de 200 reais todo mês',
          currentProducts,
          supabaseMock,
          handlers,
          { recurring: true, interval: 'monthly', totalAmount: 200 }
        )

        await runSaleFlow(
          'vendi assinatura premium de 500 reais mensal até dia 15',
          currentProducts,
          supabaseMock,
          handlers,
          { recurring: true, interval: 'monthly', totalAmount: 500 }
        )
      }
    ],
    [
      'Teste 5: Compras',
      async () => {
        const baseProducts = createBaseProducts()
        supabaseMock.setState(createSupabaseState(baseProducts))

        await runExpenseFlow(
          'comprei matéria-prima por 300 reais',
          supabaseMock,
          handlers,
          300
        )

        await runExpenseFlow(
          'compra de produto x por 450 reais',
          supabaseMock,
          handlers,
          450
        )
      }
    ],
    [
      'Teste 6: Despesas e Receitas',
      async () => {
        const baseProducts = createBaseProducts()
        supabaseMock.setState(createSupabaseState(baseProducts))

        await runExpenseFlow(
          'gastei 50 reais com transporte',
          supabaseMock,
          handlers,
          50
        )

        await runIncomeFlow(
          'recebi 200 reais de aluguel',
          supabaseMock,
          handlers,
          200
        )
      }
    ],
    [
      'Teste 7: Comandos Ambíguos',
      async () => {
        await runAmbiguousCommand('vendi algo', handlers)
        await runAmbiguousCommand('comprei', handlers)
      }
    ],
    [
      'Teste 8: Múltiplos Produtos Similares',
      async () => {
        const baseProducts = createBaseProducts({ includeSimilar: true })
        supabaseMock.setState(createSupabaseState(baseProducts))
        await runSimilarProductsScenario(baseProducts, handlers)
      }
    ]
  ]

  const results: ScenarioResult[] = []

  for (const [name, fn] of scenarios) {
    try {
      clearConversationContext()
      await fn()
      results.push({ name, passed: true })
    } catch (error: any) {
      results.push({ name, passed: false, details: error?.message || 'Erro desconhecido' })
    }
  }

  return results
}



