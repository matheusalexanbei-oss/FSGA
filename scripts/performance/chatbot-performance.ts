import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

import { parseCommand } from '../../src/lib/chat-bot/command-parser'
import { validateCommand } from '../../src/lib/chat-bot/validation'
import { allTests, TestCase } from '../../src/lib/chat-bot/__tests__/command-tests'

type IssueType = 'bug' | 'improvement' | 'observation'

interface Issue {
  type: IssueType
  message: string
}

interface CommandMeasurement {
  test: TestCase
  durationMs: number
  intent: string
  success: boolean
  validationErrors: string[]
  error?: string
  issues: Issue[]
}

interface Stats {
  min: number
  max: number
  average: number
  median: number
  p95: number
  totalDuration: number
}

interface ScenarioConfig {
  name: string
  description: string
  tests: TestCase[]
  thresholdMs: number
  sampleSize?: number
  iterations?: number
  concurrency?: number
}

interface ScenarioResult {
  name: string
  description: string
  thresholdMs: number
  totalCommands: number
  totalSuccess: number
  totalFailures: number
  stats: Stats
  slowestCommands: CommandMeasurement[]
  issues: CommandMeasurement[]
  improvements: CommandMeasurement[]
}

function expandTests(tests: TestCase[], targetLength: number): TestCase[] {
  if (tests.length === 0) {
    return []
  }

  if (tests.length >= targetLength) {
    return tests.slice(0, targetLength)
  }

  const expanded: TestCase[] = []
  for (let i = 0; i < targetLength; i += 1) {
    expanded.push(tests[i % tests.length])
  }
  return expanded
}

function computeStats(values: number[]): Stats {
  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      average: 0,
      median: 0,
      p95: 0,
      totalDuration: 0
    }
  }

  const sorted = [...values].sort((a, b) => a - b)
  const totalDuration = values.reduce((sum, value) => sum + value, 0)
  const average = totalDuration / values.length
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[(sorted.length - 1) / 2]

  const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
  const p95 = sorted[p95Index]

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    average,
    median,
    p95,
    totalDuration
  }
}

async function measureCommand(test: TestCase): Promise<CommandMeasurement> {
  // Garantir que as execuções concorrentes tenham oportunidade de rodar em paralelo
  await new Promise(resolve => setImmediate(resolve))

  const start = performance.now()
  try {
    const parsed = parseCommand(test.command)
    const validation = validateCommand(parsed)
    const durationMs = performance.now() - start

    const issues: Issue[] = []

    if (parsed.intent !== test.expectedIntent) {
      const issueType: IssueType = test.shouldSucceed ? 'bug' : 'improvement'
      issues.push({
        type: issueType,
        message: `Intenção esperada "${test.expectedIntent}", mas recebeu "${parsed.intent}".`
      })
    }

    if (test.shouldSucceed && !validation.isValid) {
      issues.push({
        type: 'bug',
        message: `Validação falhou para um caso que deveria passar: ${validation.errors
          .map(error => error.message)
          .join('; ')}`
      })
    }

    if (!test.shouldSucceed && validation.isValid && parsed.intent !== 'unknown') {
      issues.push({
        type: 'improvement',
        message: 'Comando deveria falhar ou pedir esclarecimentos, mas foi aceito.'
      })
    }

    return {
      test,
      durationMs,
      intent: parsed.intent,
      success: validation.isValid,
      validationErrors: validation.errors.map(error => error.message),
      issues
    }
  } catch (error) {
    const durationMs = performance.now() - start
    const message = error instanceof Error ? error.message : 'Erro desconhecido'

    return {
      test,
      durationMs,
      intent: 'error',
      success: false,
      validationErrors: [],
      error: message,
      issues: [
        {
          type: 'bug',
          message: `Erro inesperado ao processar comando: ${message}`
        }
      ]
    }
  }
}

async function runScenario(config: ScenarioConfig): Promise<ScenarioResult> {
  const {
    tests,
    sampleSize,
    iterations = 1,
    concurrency = 1,
    thresholdMs,
    name,
    description
  } = config

  const totalRuns =
    sampleSize ??
    (tests.length === 0 ? 0 : Math.max(1, iterations) * tests.length)

  const schedule = expandTests(tests, totalRuns)
  const measurements: CommandMeasurement[] = []

  if (concurrency > 1) {
    for (let i = 0; i < schedule.length; i += concurrency) {
      const batch = schedule.slice(i, i + concurrency)
      const batchResults = await Promise.all(batch.map(test => measureCommand(test)))
      batchResults.forEach(result => {
        if (result.durationMs > thresholdMs) {
          result.issues.push({
            type: 'bug',
            message: `Tempo de resposta ${result.durationMs.toFixed(
              2
            )}ms acima do limite de ${thresholdMs}ms.`
          })
        }
      })
      measurements.push(...batchResults)
    }
  } else {
    for (const test of schedule) {
      const result = await measureCommand(test)
      if (result.durationMs > thresholdMs) {
        result.issues.push({
          type: 'bug',
          message: `Tempo de resposta ${result.durationMs.toFixed(
            2
          )}ms acima do limite de ${thresholdMs}ms.`
        })
      }
      measurements.push(result)
    }
  }

  const stats = computeStats(measurements.map(result => result.durationMs))
  const totalFailures = measurements.filter(
    result => result.issues.some(issue => issue.type === 'bug')
  ).length
  const totalImprovements = measurements.filter(result =>
    result.issues.some(issue => issue.type === 'improvement')
  ).length

  const slowestCommands = [...measurements]
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, Math.min(5, measurements.length))

  const issues = measurements.filter(result =>
    result.issues.some(issue => issue.type === 'bug')
  )
  const improvements = measurements.filter(result =>
    result.issues.some(issue => issue.type === 'improvement')
  )

  return {
    name,
    description,
    thresholdMs,
    totalCommands: measurements.length,
    totalSuccess: measurements.length - totalFailures,
    totalFailures: totalFailures + totalImprovements,
    stats,
    slowestCommands,
    issues,
    improvements
  }
}

function formatDuration(value: number): string {
  return `${value.toFixed(2)}ms`
}

function writeReports(
  timestamp: string,
  scenarios: ScenarioResult[],
  outputDir: string
) {
  const totalCommands = scenarios.reduce((sum, scenario) => sum + scenario.totalCommands, 0)
  const totalFailures = scenarios.reduce((sum, scenario) => sum + scenario.totalFailures, 0)
  const allIssues = scenarios.flatMap(scenario => scenario.issues)
  const allImprovements = scenarios.flatMap(scenario => scenario.improvements)

  const reportData = {
    generatedAt: timestamp,
    summary: {
      scenarios: scenarios.length,
      totalCommands,
      totalFailures,
      bugs: allIssues.map(item => ({
        scenario: item.test.description,
        command: item.test.command,
        durationMs: item.durationMs,
        issues: item.issues
          .filter(issue => issue.type === 'bug')
          .map(issue => issue.message),
        error: item.error
      })),
      improvements: allImprovements.map(item => ({
        scenario: item.test.description,
        command: item.test.command,
        durationMs: item.durationMs,
        issues: item.issues
          .filter(issue => issue.type === 'improvement')
          .map(issue => issue.message)
      }))
    },
    scenarios: scenarios.map(scenario => ({
      name: scenario.name,
      description: scenario.description,
      thresholdMs: scenario.thresholdMs,
      totalCommands: scenario.totalCommands,
      totalSuccess: scenario.totalSuccess,
      totalFailures: scenario.totalFailures,
      stats: scenario.stats,
      slowestCommands: scenario.slowestCommands.map(result => ({
        command: result.test.command,
        durationMs: result.durationMs,
        intent: result.intent,
        issues: result.issues,
        error: result.error
      }))
    }))
  }

  const jsonPath = path.join(outputDir, `performance-report-${timestamp}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2), 'utf-8')

  const markdownLines: string[] = []
  markdownLines.push(`# Relatório de Performance - ${timestamp}`)
  markdownLines.push('')
  markdownLines.push('## Resumo Geral')
  markdownLines.push(
    `- Execuções analisadas: ${totalCommands}`,
    `- Cenários avaliados: ${scenarios.length}`,
    `- Bugs identificados: ${allIssues.length}`,
    `- Melhorias sugeridas: ${allImprovements.length}`
  )
  markdownLines.push('')

  scenarios.forEach(scenario => {
    markdownLines.push(`## Cenário: ${scenario.name}`)
    markdownLines.push(`${scenario.description}`)
    markdownLines.push('')
    markdownLines.push('| Métrica | Valor |')
    markdownLines.push('| --- | --- |')
    markdownLines.push(`| Comandos executados | ${scenario.totalCommands} |`)
    markdownLines.push(
      `| Limite de tempo | ${formatDuration(scenario.thresholdMs)} |`
    )
    markdownLines.push(
      `| Média | ${formatDuration(scenario.stats.average)} |`
    )
    markdownLines.push(`| Mediana | ${formatDuration(scenario.stats.median)} |`)
    markdownLines.push(`| P95 | ${formatDuration(scenario.stats.p95)} |`)
    markdownLines.push(`| Máximo | ${formatDuration(scenario.stats.max)} |`)
    markdownLines.push(`| Mínimo | ${formatDuration(scenario.stats.min)} |`)
    markdownLines.push('')

    if (scenario.issues.length > 0) {
      markdownLines.push('### Bugs')
      scenario.issues.forEach(result => {
        const bugMessages = result.issues
          .filter(issue => issue.type === 'bug')
          .map(issue => `- ${issue.message}`)
        markdownLines.push(
          `- **${result.test.description}** (${formatDuration(result.durationMs)}):`,
          `  - Comando: \`${result.test.command}\``,
          ...bugMessages
        )
        if (result.error) {
          markdownLines.push(`  - Erro: ${result.error}`)
        }
      })
      markdownLines.push('')
    }

    if (scenario.improvements.length > 0) {
      markdownLines.push('### Melhorias sugeridas')
      scenario.improvements.forEach(result => {
        const improvementMessages = result.issues
          .filter(issue => issue.type === 'improvement')
          .map(issue => `- ${issue.message}`)
        markdownLines.push(
          `- **${result.test.description}** (${formatDuration(result.durationMs)}):`,
          `  - Comando: \`${result.test.command}\``,
          ...improvementMessages
        )
      })
      markdownLines.push('')
    }
  })

  const markdownPath = path.join(outputDir, `performance-report-${timestamp}.md`)
  fs.writeFileSync(markdownPath, markdownLines.join('\n'), 'utf-8')

  return { jsonPath, markdownPath }
}

function sanitizeTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-')
}

function ensureDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

async function main() {
  const timestamp = sanitizeTimestamp(new Date())
  const baseOutputDir = path.join(
    process.cwd(),
    'docs',
    'test-results',
    'performance'
  )
  ensureDirectory(baseOutputDir)

  const successCases = allTests.filter(test => test.shouldSucceed)
  const simpleTests = successCases.filter(test => test.command.length <= 40)
  const complexTests = successCases.filter(
    test =>
      test.command.length > 40 ||
      /(parcelad|recorr|anális|insight|agend|parcelado|parcelada|pagamento)/i.test(
        test.command
      )
  )

  // Garantir que sempre teremos dados para os cenários
  const fallbackTests = successCases.length > 0 ? successCases : allTests
  const selectedSimpleTests = simpleTests.length > 0 ? simpleTests : fallbackTests
  const selectedComplexTests =
    complexTests.length > 0 ? complexTests : fallbackTests

  const scenarios: ScenarioConfig[] = [
    {
      name: 'comandos_simples',
      description:
        'Mede o tempo de resposta para comandos curtos e frequentes (limite 2s).',
      tests: selectedSimpleTests,
      thresholdMs: 2000,
      iterations: 5
    },
    {
      name: 'comandos_complexos',
      description:
        'Avalia comandos longos ou com múltiplas entidades (limite 5s).',
      tests: selectedComplexTests.length > 0 ? selectedComplexTests : fallbackTests,
      thresholdMs: 5000,
      iterations: 5
    },
    {
      name: 'volume_alto',
      description:
        'Executa 1000 comandos sequenciais para avaliar estabilidade em alto volume (limite 5s).',
      tests: fallbackTests,
      thresholdMs: 5000,
      sampleSize: 1000
    },
    {
      name: 'concorrencia',
      description:
        'Simula múltiplas requisições simultâneas em lotes de 25 comandos (limite 5s).',
      tests: fallbackTests,
      thresholdMs: 5000,
      sampleSize: 200,
      concurrency: 25
    }
  ]

  if (fallbackTests.length === 0) {
    console.error('Nenhum caso de teste foi encontrado para executar.')
    process.exit(1)
  }

  const results: ScenarioResult[] = []
  for (const scenario of scenarios) {
    console.log(`\n▶️ Executando cenário: ${scenario.name}`)
    console.log(`   ${scenario.description}`)
    const result = await runScenario(scenario)
    console.log(
      `   - Média: ${formatDuration(result.stats.average)} | P95: ${formatDuration(
        result.stats.p95
      )} | Máximo: ${formatDuration(result.stats.max)}`
    )
    if (result.issues.length > 0) {
      console.log(`   - Bugs identificados: ${result.issues.length}`)
    }
    if (result.improvements.length > 0) {
      console.log(`   - Melhorias sugeridas: ${result.improvements.length}`)
    }
    results.push(result)
  }

  const { jsonPath, markdownPath } = writeReports(timestamp, results, baseOutputDir)
  console.log('\n✅ Testes de performance concluídos!')
  console.log(`   Relatório JSON: ${jsonPath}`)
  console.log(`   Relatório Markdown: ${markdownPath}`)
}

main().catch(error => {
  console.error('Erro ao executar testes de performance:', error)
  process.exit(1)
})


