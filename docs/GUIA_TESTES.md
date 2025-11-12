# 📖 Guia Completo de Testes

## 🎯 Visão Geral

Este guia cobre todos os tipos de testes disponíveis no projeto, incluindo testes de funcionalidade, performance e integração.

---

## 📋 Índice

1. [Testes de Chat Bot](#testes-de-chat-bot)
2. [Testes de Performance](#testes-de-performance)
3. [Executando Testes](#executando-testes)
4. [Interpretando Resultados](#interpretando-resultados)
5. [Troubleshooting](#troubleshooting)

---

## 🤖 Testes de Chat Bot

### O que são?

Testes que validam o funcionamento do parser e validação de comandos do chat bot.

### Como executar

```bash
npm run test:chatbot
```

### O que é testado?

- ✅ Reconhecimento de intenções (vendas, despesas, receitas, etc.)
- ✅ Extração de entidades (valores, produtos, quantidades, etc.)
- ✅ Validação de comandos
- ✅ Tratamento de comandos inválidos

### Exemplos de comandos testados

**Vendas**:
- `vendi o colar de pérolas`
- `vendi um produto por 150 reais`
- `vendi produto em 3x de 50 reais`

**Despesas**:
- `gastei 50 reais no supermercado`
- `paguei 200 reais de conta de luz`
- `comprei um notebook de 3799 parcelado em 6x`

**Receitas**:
- `recebi 500 reais de serviço`
- `receita de 200 reais`
- `receita recorrente de 300 reais todo mês`

**Estoque**:
- `quantas argolas gota eu tenho`
- `tem estoque do colar?`
- `estoque de colar`

**Reposição**:
- `reposição de 10 kit 5 pares de brincos`
- `repor 20 unidades de colar`

**Consultas Financeiras**:
- `qual meu lucro líquido esse mês`
- `mostra minhas despesas`

**Análises**:
- `gera insights`
- `análise financeira`

### Saída esperada

```
🧪 Iniciando testes do Chat Bot...

📊 Resultados:

✅ Passou: 45/50
❌ Falhou: 5/50
📈 Taxa de sucesso: 90.0%

📋 Estatísticas por categoria:

  Vendas: 8/10 (80.0%)
  Despesas: 10/10 (100.0%)
  Receitas: 5/5 (100.0%)
  Estoque: 5/5 (100.0%)
  Reposição: 2/3 (66.7%)
  Consultas Financeiras: 2/5 (40.0%)
  Análises: 3/5 (60.0%)
  Inválidos: 10/10 (100.0%)

✅ Testes concluídos!
```

---

## ⚡ Testes de Performance

### O que são?

Testes que medem o tempo de resposta do sistema para diferentes tipos de comandos.

### Como executar

```bash
npm run test:performance
```

### O que é testado?

- ⏱️ Tempo de resposta para comandos simples (< 2s)
- ⏱️ Tempo de resposta para comandos complexos (< 5s)
- 📊 Estabilidade com grande volume (1000+ comandos)
- 🔄 Comportamento sob concorrência

### Cenários

1. **Comandos Simples**: 120 comandos, limite 2s
2. **Comandos Complexos**: 30 comandos, limite 5s
3. **Volume Alto**: 1000 comandos sequenciais, limite 5s
4. **Concorrência**: 200 comandos em lotes de 25, limite 5s

### Relatórios gerados

- **JSON**: `docs/test-results/performance/performance-report-[timestamp].json`
- **Markdown**: `docs/test-results/performance/performance-report-[timestamp].md`

### Documentação completa

Veja [TESTES_PERFORMANCE.md](TESTES_PERFORMANCE.md) para detalhes completos.

---

## 🚀 Executando Testes

### Todos os testes

```bash
# Testes de funcionalidade
npm run test:chatbot

# Testes de performance
npm run test:performance
```

### Execução sequencial

```bash
npm run test:chatbot && npm run test:performance
```

### Em ambiente Windows (PowerShell)

```powershell
npm run test:chatbot; npm run test:performance
```

---

## 📊 Interpretando Resultados

### Testes de Chat Bot

#### Taxa de Sucesso

- ✅ **90%+**: Excelente
- ⚠️ **70-90%**: Bom, mas pode melhorar
- ❌ **< 70%**: Precisa de atenção

#### Por Categoria

Identifique quais tipos de comandos têm mais problemas:
- Se "Vendas" tem baixa taxa, revise o parser de vendas
- Se "Consultas Financeiras" falha, revise a lógica de consultas

#### Comandos que Falharam

Cada comando que falha mostra:
- Descrição do teste
- Comando testado
- Erro encontrado

Use isso para identificar padrões e corrigir bugs.

---

### Testes de Performance

#### Métricas Principais

**Média**: Tempo médio de resposta
- ✅ < 100ms: Excelente
- ⚠️ 100-500ms: Aceitável
- ❌ > 500ms: Precisa otimização

**P95**: 95% dos comandos respondem em menos tempo
- Deve estar abaixo do limite do cenário

**Máximo**: Comando mais lento
- Identifica outliers que precisam investigação

#### Análise de Tendências

Compare relatórios de diferentes execuções:
- Performance está melhorando ou piorando?
- Há degradação ao longo do tempo?
- Novos comandos estão mais lentos?

---

## 🔧 Troubleshooting

### Testes de Chat Bot

#### Problema: Muitos testes falhando

**Causas possíveis**:
1. Parser não reconhece novos padrões
2. Validação muito restritiva
3. Testes desatualizados

**Soluções**:
1. Revisar casos de teste em `src/lib/chat-bot/__tests__/command-tests.ts`
2. Ajustar parser em `src/lib/chat-bot/command-parser.ts`
3. Ajustar validação em `src/lib/chat-bot/validation.ts`

#### Problema: Erros de sintaxe

```bash
# Verificar TypeScript
npx tsc --noEmit

# Verificar dependências
npm install
```

---

### Testes de Performance

#### Problema: Tempos muito altos

**Causas possíveis**:
1. Sistema sobrecarregado
2. Código ineficiente
3. Dependências lentas

**Soluções**:
1. Executar em ambiente isolado
2. Profiling do código
3. Otimizar algoritmos

#### Problema: Relatórios não gerados

**Soluções**:
```bash
# Criar diretório manualmente
mkdir -p docs/test-results/performance

# Verificar permissões
ls -la docs/test-results/performance/
```

---

## 📝 Adicionando Novos Testes

### Testes de Chat Bot

Edite `src/lib/chat-bot/__tests__/command-tests.ts`:

```typescript
export const novosTestes: TestCase[] = [
  {
    command: 'novo comando de teste',
    expectedIntent: 'intent_esperado',
    expectedEntities: {
      amount: 100,
      productName: 'produto'
    },
    description: 'Descrição do teste',
    shouldSucceed: true
  }
]
```

### Testes de Performance

Os testes de performance usam automaticamente todos os casos de teste definidos. Para adicionar novos cenários, edite `scripts/performance/chatbot-performance.ts`.

---

## 🎯 Boas Práticas

### Executar Regularmente

- ✅ Antes de fazer commit
- ✅ Antes de fazer merge
- ✅ Semanalmente para monitorar performance

### Documentar Problemas

- Crie issues para bugs encontrados
- Documente melhorias sugeridas
- Mantenha histórico de relatórios

### Comparar Resultados

- Mantenha relatórios de baseline
- Compare antes/depois de mudanças
- Identifique regressões rapidamente

---

## 📚 Referências

- [Documentação de Performance](TESTES_PERFORMANCE.md)
- [Estrutura do Projeto](PROJECT_STRUCTURE.md)
- [Roadmap](ROADMAP.md)

---

**Última atualização**: 12 de Novembro de 2025

