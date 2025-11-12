/**
 * Script para executar testes do chat bot
 * Execute com: npx tsx src/lib/chat-bot/__tests__/run-tests.ts
 */

import { parseCommand } from '../command-parser'
import { validateCommand } from '../validation'
import { allTests, runTests, TestCase } from './command-tests'
import { runScenarioTestSuite } from './scenario-tests'

/**
 * Executa todos os testes e exibe os resultados
 */
async function main() {
  console.log('🧪 Iniciando testes do Chat Bot...\n')
  
  const results = runTests(parseCommand, validateCommand)
  const scenarioResults = await runScenarioTestSuite()
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length
  const scenarioPassed = scenarioResults.filter(r => r.passed).length
  const scenarioFailed = scenarioResults.length - scenarioPassed
  
  console.log(`\n📊 Resultados:\n`)
  console.log(`✅ Testes de parsing/validação: ${passed}/${total}`)
  console.log(`✅ Testes de cenário end-to-end: ${scenarioPassed}/${scenarioResults.length}`)
  console.log(`❌ Total de falhas: ${failed + scenarioFailed}`)
  console.log(
    `📈 Taxa de sucesso global: ${(
      ((passed + scenarioPassed) / (total + scenarioResults.length)) * 100
    ).toFixed(1)}%\n`
  )
  
  // Agrupar por categoria
  const categories: Record<string, TestCase[]> = {
    'Vendas': [],
    'Despesas': [],
    'Receitas': [],
    'Estoque': [],
    'Reposição': [],
    'Consultas Financeiras': [],
    'Análises': [],
    'Inválidos': []
  }
  
  allTests.forEach(test => {
    if (test.command.includes('vendi') || test.command.includes('venda')) {
      categories['Vendas'].push(test)
    } else if (test.command.includes('gastei') || test.command.includes('comprei') || test.command.includes('paguei')) {
      categories['Despesas'].push(test)
    } else if (test.command.includes('recebi') || test.command.includes('receita')) {
      categories['Receitas'].push(test)
    } else if (test.command.includes('estoque') || test.command.includes('quant')) {
      categories['Estoque'].push(test)
    } else if (test.command.includes('reposição') || test.command.includes('repor')) {
      categories['Reposição'].push(test)
    } else if (test.command.includes('lucro') || test.command.includes('receitas') || test.command.includes('despesas')) {
      categories['Consultas Financeiras'].push(test)
    } else if (test.command.includes('insights') || test.command.includes('análise') || test.command.includes('produtos mais')) {
      categories['Análises'].push(test)
    } else {
      categories['Inválidos'].push(test)
    }
  })
  
  // Mostrar detalhes dos falhos
  const failures = results.filter(r => !r.passed)
  if (failures.length > 0) {
    console.log(`\n❌ Testes que falharam:\n`)
    failures.forEach(({ test, error }) => {
      console.log(`  • ${test.description}`)
      console.log(`    Comando: "${test.command}"`)
      console.log(`    Erro: ${error}\n`)
    })
  }

  if (scenarioFailed > 0) {
    console.log(`\n❌ Cenários que falharam:\n`)
    scenarioResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  • ${r.name}`)
        if (r.details) {
          console.log(`    Detalhes: ${r.details}`)
        }
      })
  }
  
  // Mostrar estatísticas por categoria
  console.log(`\n📋 Estatísticas por categoria:\n`)
  Object.entries(categories).forEach(([category, tests]) => {
    if (tests.length === 0) return
    const categoryResults = results.filter(r => tests.includes(r.test))
    const categoryPassed = categoryResults.filter(r => r.passed).length
    const categoryTotal = categoryResults.length
    const percentage = ((categoryPassed / categoryTotal) * 100).toFixed(1)
    console.log(`  ${category}: ${categoryPassed}/${categoryTotal} (${percentage}%)`)
  })
  
  console.log(`\n✅ Testes concluídos!\n`)
  
  // Retornar código de saída baseado nos resultados
  const exitWithFailure = failed > 0 || scenarioFailed > 0
  process.exit(exitWithFailure ? 1 : 0)
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

export { main as runChatBotTests }







