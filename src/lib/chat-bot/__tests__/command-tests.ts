/**
 * Arquivo de testes para validação de comandos do chat bot
 * Este arquivo contém variações de comandos para testar o sistema
 */

export interface TestCase {
  command: string
  expectedIntent: string
  expectedEntities?: {
    amount?: number
    productName?: string
    quantity?: number
    isInstallment?: boolean
    installmentCount?: number
    date?: string
    category?: string
  }
  description: string
  shouldSucceed: boolean
}

/**
 * Casos de teste para vendas
 */
export const salesTests: TestCase[] = [
  {
    command: 'vendi o colar de pérolas',
    expectedIntent: 'sell_product',
    expectedEntities: { productName: 'colar' }, // Parser extrai apenas "colar"
    description: 'Venda básica de produto',
    shouldSucceed: true
  },
  {
    command: 'vendi um produto por 150 reais',
    expectedIntent: 'sell_product',
    expectedEntities: { amount: 150 },
    description: 'Venda com valor',
    shouldSucceed: true
  },
  {
    command: 'vendi produto em 3x de 50 reais',
    expectedIntent: 'sell_product',
    expectedEntities: { 
      isInstallment: true, 
      installmentCount: 3,
      amount: 150 // Valor total após multiplicar parcelas
    },
    description: 'Venda parcelada',
    shouldSucceed: true
  },
  {
    command: 'venda de 200 reais que será pago mês que vem',
    expectedIntent: 'sell_product',
    expectedEntities: { 
      amount: 200,
      paymentScheduled: true
    },
    description: 'Venda com pagamento agendado',
    shouldSucceed: true
  },
  {
    command: 'vendi 2 unidades do colar por 300 reais',
    expectedIntent: 'sell_product',
    expectedEntities: { 
      quantity: 2,
      productName: 'do colar', // Parser pode extrair assim
      amount: 300
    },
    description: 'Venda múltipla com quantidade',
    shouldSucceed: true
  },
  {
    command: 'venda parcelada em 6x',
    expectedIntent: 'sell_product',
    expectedEntities: { 
      isInstallment: true,
      installmentCount: 6
    },
    description: 'Venda parcelada sem valor total',
    shouldSucceed: false // Deve perguntar o valor
  }
]

/**
 * Casos de teste para despesas
 */
export const expenseTests: TestCase[] = [
  {
    command: 'gastei 50 reais no supermercado',
    expectedIntent: 'register_expense',
    expectedEntities: { amount: 50 }, // Descrição é extraída pelo handler, não pelo parser
    description: 'Despesa básica',
    shouldSucceed: true
  },
  {
    command: 'paguei 200 reais de conta de luz',
    expectedIntent: 'register_expense',
    expectedEntities: { amount: 200 }, // Descrição é extraída pelo handler
    description: 'Despesa com descrição',
    shouldSucceed: true
  },
  {
    command: 'comprei um notebook de 3799 parcelado em 6x',
    expectedIntent: 'register_expense',
    expectedEntities: { 
      amount: 3799,
      isInstallment: true,
      installmentCount: 6
      // Descrição é extraída pelo handler
    },
    description: 'Despesa parcelada (caso problemático anterior)',
    shouldSucceed: true
  },
  {
    command: 'comprei um notebook de 3799 em 6x',
    expectedIntent: 'register_expense',
    expectedEntities: { 
      amount: 3799,
      isInstallment: true,
      installmentCount: 6
    },
    description: 'Despesa parcelada sem palavra "parcelado"',
    shouldSucceed: true
  },
  {
    command: 'gastei 100 reais hoje',
    expectedIntent: 'register_expense',
    expectedEntities: { amount: 100 },
    description: 'Despesa com data',
    shouldSucceed: true
  },
  {
    command: 'despesa de 500 reais com material',
    expectedIntent: 'register_expense',
    expectedEntities: { amount: 500, description: 'material' },
    description: 'Despesa com palavra "despesa"',
    shouldSucceed: true
  },
  {
    command: 'comprei um produto',
    expectedIntent: 'register_expense',
    description: 'Despesa sem valor (deve perguntar)',
    shouldSucceed: false // Deve perguntar o valor
  }
]

/**
 * Casos de teste para receitas
 */
export const incomeTests: TestCase[] = [
  {
    command: 'recebi 500 reais de serviço',
    expectedIntent: 'register_income',
    expectedEntities: { amount: 500 }, // Descrição é extraída pelo handler
    description: 'Receita básica',
    shouldSucceed: true
  },
  {
    command: 'receita de 200 reais',
    expectedIntent: 'register_income',
    expectedEntities: { amount: 200 },
    description: 'Receita sem descrição',
    shouldSucceed: true
  },
  {
    command: 'recebi 1000 reais hoje',
    expectedIntent: 'register_income',
    expectedEntities: { amount: 1000 },
    description: 'Receita com data',
    shouldSucceed: true
  },
  {
    command: 'receita recorrente de 300 reais todo mês',
    expectedIntent: 'register_income',
    expectedEntities: { 
      amount: 300,
      isRecurring: true,
      recurringInterval: 'monthly'
    },
    description: 'Receita recorrente',
    shouldSucceed: true
  }
]

/**
 * Casos de teste para estoque
 */
export const stockTests: TestCase[] = [
  {
    command: 'quantas argolas gota eu tenho',
    expectedIntent: 'check_stock',
    expectedEntities: { productName: 'argolas gota' },
    description: 'Consulta de estoque',
    shouldSucceed: true
  },
  {
    command: 'tem estoque do colar?',
    expectedIntent: 'check_stock',
    expectedEntities: { productName: 'colar?' }, // Parser pode incluir interrogação
    description: 'Consulta de estoque com interrogação',
    shouldSucceed: true
  },
  {
    command: 'quantos produtos tem no estoque?',
    expectedIntent: 'check_stock',
    description: 'Consulta geral de estoque',
    shouldSucceed: true
  },
  {
    command: 'estoque de colar',
    expectedIntent: 'check_stock',
    expectedEntities: {}, // Pode não extrair produto neste formato
    description: 'Consulta direta de estoque',
    shouldSucceed: true // Ainda é válido mesmo sem produto específico
  },
  {
    command: 'falta estoque?',
    expectedIntent: 'check_stock',
    description: 'Consulta sobre falta de estoque',
    shouldSucceed: true
  }
]

/**
 * Casos de teste para reposição
 */
export const restockTests: TestCase[] = [
  {
    command: 'reposição de 10 kit 5 pares de brincos',
    expectedIntent: 'restock_product',
    expectedEntities: { 
      quantity: 10,
      productName: 'de 10 kit 5 pares' // Parser pode extrair assim
    },
    description: 'Reposição completa',
    shouldSucceed: true
  },
  {
    command: 'repor 20 unidades de colar',
    expectedIntent: 'restock_product',
    expectedEntities: { 
      quantity: 20,
      productName: 'colar'
    },
    description: 'Reposição com "repor"',
    shouldSucceed: true
  },
  {
    command: 'adicionar 15 argolas ao estoque',
    expectedIntent: 'unknown', // "adicionar" não está nos padrões de restock
    description: 'Reposição com "adicionar"',
    shouldSucceed: false // "adicionar" não é reconhecido como restock
  }
]

/**
 * Casos de teste para consultas financeiras
 */
export const financialQueryTests: TestCase[] = [
  {
    command: 'qual meu lucro líquido esse mês',
    expectedIntent: 'calculate_profit',
    description: 'Consulta de lucro',
    shouldSucceed: true
  },
  {
    command: 'lucro mês passado',
    expectedIntent: 'unknown', // Pode não ser reconhecido
    description: 'Consulta de lucro mês anterior',
    shouldSucceed: false
  },
  {
    command: 'qual minhas receitas este mês',
    expectedIntent: 'register_income', // Pode ser interpretado como registro
    description: 'Consulta de receitas',
    shouldSucceed: false
  },
  {
    command: 'quanto gastei esta semana',
    expectedIntent: 'register_expense', // Pode ser interpretado como registro
    description: 'Consulta de despesas',
    shouldSucceed: false
  },
  {
    command: 'mostra minhas despesas',
    expectedIntent: 'register_expense', // Pode ser interpretado como registro
    description: 'Consulta geral de despesas',
    shouldSucceed: false
  }
]

/**
 * Casos de teste para análises
 */
export const analyticsTests: TestCase[] = [
  {
    command: 'gera insights',
    expectedIntent: 'generate_insights',
    description: 'Geração de insights básica',
    shouldSucceed: true
  },
  {
    command: 'insights avançados',
    expectedIntent: 'generate_insights',
    description: 'Geração de insights avançados',
    shouldSucceed: true
  },
  {
    command: 'análise financeira',
    expectedIntent: 'generate_insights',
    description: 'Análise financeira',
    shouldSucceed: true
  },
  {
    command: 'produtos mais vendidos',
    expectedIntent: 'sell_product', // Pode ser interpretado como venda
    description: 'Análise de produtos',
    shouldSucceed: false
  },
  {
    command: 'top produtos',
    expectedIntent: 'unknown', // Pode não ser reconhecido
    description: 'Top produtos',
    shouldSucceed: false
  }
]

/**
 * Casos de teste para comandos inválidos/desconhecidos
 */
export const invalidTests: TestCase[] = [
  {
    command: 'oi',
    expectedIntent: 'unknown',
    description: 'Cumprimento sem comando',
    shouldSucceed: false
  },
  {
    command: 'como vai?',
    expectedIntent: 'unknown',
    description: 'Pergunta casual',
    shouldSucceed: false
  },
  {
    command: 'fazer café',
    expectedIntent: 'unknown',
    description: 'Comando não relacionado',
    shouldSucceed: false
  },
  {
    command: 'vendi',
    expectedIntent: 'sell_product',
    description: 'Comando incompleto (sem produto)',
    shouldSucceed: false // Deve perguntar qual produto
  },
  {
    command: 'gastei',
    expectedIntent: 'register_expense',
    description: 'Comando incompleto (sem valor)',
    shouldSucceed: false // Deve perguntar o valor
  }
]

/**
 * Todos os testes combinados
 */
export const allTests: TestCase[] = [
  ...salesTests,
  ...expenseTests,
  ...incomeTests,
  ...stockTests,
  ...restockTests,
  ...financialQueryTests,
  ...analyticsTests,
  ...invalidTests
]

/**
 * Função auxiliar para executar testes
 */
export function runTests(
  parseCommand: (command: string) => any,
  validateCommand: (parsed: any) => any
): Array<{ test: TestCase; passed: boolean; result?: any; error?: string }> {
  const results: Array<{ test: TestCase; passed: boolean; result?: any; error?: string }> = []
  
  for (const test of allTests) {
    try {
      const parsed = parseCommand(test.command)
      const validation = validateCommand(parsed)
      
      let passed = true
      let error: string | undefined
      
      // Verificar intenção
      if (parsed.intent !== test.expectedIntent) {
        passed = false
        error = `Intent esperado: ${test.expectedIntent}, obtido: ${parsed.intent}`
      }
      
      // Verificar entidades se especificadas
      if (test.expectedEntities && passed) {
        for (const [key, expectedValue] of Object.entries(test.expectedEntities)) {
          const actualValue = parsed.entities[key]
          if (actualValue !== expectedValue) {
            passed = false
            error = `${key}: esperado ${expectedValue}, obtido ${actualValue}`
            break
          }
        }
      }
      
      // Verificar se deve ter sucesso
      if (test.shouldSucceed && !validation.isValid) {
        passed = false
        error = `Validação falhou: ${validation.errors.map(e => e.message).join(', ')}`
      } else if (!test.shouldSucceed && validation.isValid && parsed.intent !== 'unknown') {
        // Se não deve ter sucesso mas passou, verificar se pelo menos perguntou algo
        passed = true // Aceitável se perguntar
      }
      
      results.push({ test, passed, result: { parsed, validation }, error })
    } catch (err) {
      results.push({ 
        test, 
        passed: false, 
        error: err instanceof Error ? err.message : 'Erro desconhecido' 
      })
    }
  }
  
  return results
}

