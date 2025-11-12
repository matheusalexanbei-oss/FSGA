# 🧪 Documentação de Testes de Performance

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Como Executar](#como-executar)
3. [Cenários de Teste](#cenários-de-teste)
4. [Interpretando os Resultados](#interpretando-os-resultados)
5. [Métricas e Limites](#métricas-e-limites)
6. [Relatórios Gerados](#relatórios-gerados)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de testes de performance automatiza a avaliação do tempo de resposta do chat bot para diferentes tipos de comandos. Os testes são executados em 4 cenários principais:

- **Comandos Simples**: Comandos curtos e frequentes
- **Comandos Complexos**: Comandos longos ou com múltiplas entidades
- **Volume Alto**: Grande volume de comandos sequenciais
- **Concorrência**: Múltiplas requisições simultâneas

### Objetivos

- ✅ Garantir que comandos simples respondam em menos de 2 segundos
- ✅ Garantir que comandos complexos respondam em menos de 5 segundos
- ✅ Validar estabilidade com grande volume de comandos (1000+)
- ✅ Validar comportamento sob carga concorrente
- ✅ Identificar bugs e oportunidades de melhoria
- ✅ Gerar documentação automática dos resultados

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- Dependências do projeto instaladas (`npm install`)
- TypeScript configurado

### Execução Básica

```bash
npm run test:performance
```

### Saída Esperada

```
▶️ Executando cenário: comandos_simples
   Mede o tempo de resposta para comandos curtos e frequentes (limite 2s).
   - Média: 0.26ms | P95: 1.17ms | Máximo: 7.29ms

▶️ Executando cenário: comandos_complexos
   Avalia comandos longos ou com múltiplas entidades (limite 5s).
   - Média: 0.07ms | P95: 0.13ms | Máximo: 0.29ms

▶️ Executando cenário: volume_alto
   Executa 1000 comandos sequenciais para avaliar estabilidade em alto volume (limite 5s).
   - Média: 0.06ms | P95: 0.08ms | Máximo: 0.25ms

▶️ Executando cenário: concorrencia
   Simula múltiplas requisições simultâneas em lotes de 25 comandos (limite 5s).
   - Média: 0.04ms | P95: 0.05ms | Máximo: 0.07ms

✅ Testes de performance concluídos!
   Relatório JSON: docs/test-results/performance/performance-report-[timestamp].json
   Relatório Markdown: docs/test-results/performance/performance-report-[timestamp].md
```

---

## 📊 Cenários de Teste

### 1. Comandos Simples

**Objetivo**: Medir o tempo de resposta para comandos curtos e frequentes.

**Configuração**:
- Limite: 2000ms (2 segundos)
- Iterações: 5x por comando
- Comandos: Comandos com até 40 caracteres

**Exemplos de comandos testados**:
- `vendi o colar de pérolas`
- `gastei 50 reais no supermercado`
- `recebi 500 reais de serviço`
- `quantas argolas gota eu tenho`

**Critério de sucesso**: 95% dos comandos devem responder em menos de 2 segundos.

---

### 2. Comandos Complexos

**Objetivo**: Avaliar comandos longos ou com múltiplas entidades.

**Configuração**:
- Limite: 5000ms (5 segundos)
- Iterações: 5x por comando
- Comandos: Comandos com mais de 40 caracteres ou com entidades complexas

**Exemplos de comandos testados**:
- `venda de 200 reais que será pago mês que vem`
- `comprei um notebook de 3799 parcelado em 6x`
- `receita recorrente de 300 reais todo mês`
- `gera insights avançados`

**Critério de sucesso**: 95% dos comandos devem responder em menos de 5 segundos.

---

### 3. Volume Alto

**Objetivo**: Executar 1000 comandos sequenciais para avaliar estabilidade.

**Configuração**:
- Limite: 5000ms (5 segundos)
- Amostra: 1000 comandos
- Execução: Sequencial

**Critério de sucesso**: 
- Todos os comandos devem processar sem erros
- Tempo médio deve permanecer estável
- Não deve haver degradação de performance

---

### 4. Concorrência

**Objetivo**: Simular múltiplas requisições simultâneas.

**Configuração**:
- Limite: 5000ms (5 segundos)
- Amostra: 200 comandos
- Concorrência: 25 comandos simultâneos por lote

**Critério de sucesso**:
- Todos os comandos devem processar corretamente
- Não deve haver race conditions
- Performance deve ser similar à execução sequencial

---

## 📈 Interpretando os Resultados

### Métricas Explicadas

#### Média (Average)
Tempo médio de resposta de todos os comandos no cenário.

**Interpretação**:
- ✅ **Bom**: < 100ms
- ⚠️ **Atenção**: 100ms - 500ms
- ❌ **Crítico**: > 500ms

#### Mediana (Median)
Tempo de resposta do comando no meio da distribuição (50% dos comandos são mais rápidos, 50% são mais lentos).

**Interpretação**: Útil para identificar outliers. Se a mediana é muito menor que a média, há alguns comandos muito lentos.

#### P95 (Percentil 95)
95% dos comandos respondem em menos tempo que este valor.

**Interpretação**: 
- ✅ **Bom**: P95 < limite do cenário
- ❌ **Crítico**: P95 > limite do cenário

#### Máximo (Max)
Tempo de resposta do comando mais lento.

**Interpretação**: Identifica comandos problemáticos que precisam de otimização.

#### Mínimo (Min)
Tempo de resposta do comando mais rápido.

**Interpretação**: Estabelece o baseline de performance ideal.

---

### Exemplo de Análise

```
Cenário: comandos_simples
- Média: 0.26ms
- Mediana: 0.06ms
- P95: 1.17ms
- Máximo: 7.29ms
- Mínimo: 0.04ms
```

**Análise**:
- ✅ A média está excelente (0.26ms << 2000ms)
- ✅ O P95 está dentro do limite (1.17ms << 2000ms)
- ⚠️ Há um outlier (máximo de 7.29ms) que pode ser investigado
- ✅ A mediana (0.06ms) é muito menor que a média, indicando que a maioria dos comandos é muito rápida

---

## 🎯 Métricas e Limites

### Limites por Cenário

| Cenário | Limite | Justificativa |
|---------|--------|---------------|
| Comandos Simples | 2000ms | Comandos frequentes devem ser instantâneos |
| Comandos Complexos | 5000ms | Comandos complexos podem levar mais tempo |
| Volume Alto | 5000ms | Estabilidade sob carga |
| Concorrência | 5000ms | Performance sob concorrência |

### Benchmarks Esperados

| Métrica | Comandos Simples | Comandos Complexos | Volume Alto | Concorrência |
|---------|------------------|---------------------|-------------|--------------|
| Média Ideal | < 50ms | < 100ms | < 100ms | < 100ms |
| P95 Ideal | < 500ms | < 1000ms | < 1000ms | < 1000ms |
| Máximo Aceitável | < 2000ms | < 5000ms | < 5000ms | < 5000ms |

---

## 📄 Relatórios Gerados

### Localização

Os relatórios são salvos em:
```
docs/test-results/performance/
```

### Formatos

#### 1. Relatório JSON (`performance-report-[timestamp].json`)

Formato estruturado para análise programática.

**Estrutura**:
```json
{
  "generatedAt": "2025-11-12T11-39-40-826Z",
  "summary": {
    "scenarios": 4,
    "totalCommands": 1350,
    "totalFailures": 0,
    "bugs": [],
    "improvements": []
  },
  "scenarios": [
    {
      "name": "comandos_simples",
      "stats": { ... },
      "slowestCommands": [ ... ],
      "issues": [ ... ],
      "improvements": [ ... ]
    }
  ]
}
```

**Uso**: 
- Análise automatizada
- Integração com CI/CD
- Comparação entre execuções

#### 2. Relatório Markdown (`performance-report-[timestamp].md`)

Formato legível para humanos.

**Conteúdo**:
- Resumo geral
- Métricas por cenário
- Lista de bugs identificados
- Lista de melhorias sugeridas

**Uso**:
- Documentação
- Revisão manual
- Compartilhamento com equipe

---

## 🐛 Troubleshooting

### Problema: Testes muito lentos

**Possíveis causas**:
1. Sistema sobrecarregado
2. Problemas de rede (se houver chamadas externas)
3. Código ineficiente no parser

**Soluções**:
- Verificar uso de CPU/memória
- Executar testes em ambiente isolado
- Revisar código do parser para otimizações

---

### Problema: Erros durante execução

**Possíveis causas**:
1. Dependências faltando
2. Código do parser com bugs
3. Testes mal configurados

**Soluções**:
```bash
# Reinstalar dependências
npm install

# Verificar sintaxe TypeScript
npx tsc --noEmit

# Executar testes unitários primeiro
npm run test:chatbot
```

---

### Problema: Relatórios não são gerados

**Possíveis causas**:
1. Permissões de escrita
2. Diretório não existe

**Soluções**:
```bash
# Verificar permissões
ls -la docs/test-results/performance/

# Criar diretório manualmente se necessário
mkdir -p docs/test-results/performance
```

---

## 🔄 Integração com CI/CD

### GitHub Actions

Exemplo de workflow:

```yaml
name: Performance Tests

on:
  schedule:
    - cron: '0 0 * * 0'  # Semanalmente
  workflow_dispatch:

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:performance
      - uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: docs/test-results/performance/
```

---

## 📚 Referências

- [Script de Performance](scripts/performance/chatbot-performance.ts)
- [Testes de Comandos](src/lib/chat-bot/__tests__/command-tests.ts)
- [Parser de Comandos](src/lib/chat-bot/command-parser.ts)
- [Validação](src/lib/chat-bot/validation.ts)

---

## ✅ Checklist de Testes

- [x] Testes de performance automatizados
- [x] Relatórios JSON e Markdown
- [x] Documentação completa
- [x] Integração com npm scripts
- [ ] Integração com CI/CD (opcional)
- [ ] Dashboard de métricas (futuro)

---

**Última atualização**: 12 de Novembro de 2025

