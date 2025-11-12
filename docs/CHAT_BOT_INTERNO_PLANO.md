# 🤖 Chat Bot Interno - Plano de Implementação

## 🎯 Objetivo

Criar um **chat bot interno** (sem IA externa) que permite ao usuário interagir com o sistema usando comandos em linguagem natural, processados via **pattern matching** e **análise de intenção baseada em regras**.

**Por que bot interno?**
- ✅ **Zero custos operacionais** (sem chamadas a APIs de IA)
- ✅ **Respostas instantâneas** (sem latência de rede)
- ✅ **Previsível e confiável** (comportamento consistente)
- ✅ **Personalizável** (fácil adicionar novos comandos)

---

## 📋 Fase 1: Arquitetura e Estrutura Base

### 1.1 Estrutura de Arquivos

```
src/
├── lib/
│   └── chat-bot/
│       ├── index.ts                 # Entrada principal do bot
│       ├── command-parser.ts         # Parser de comandos (pattern matching)
│       ├── intent-recognizer.ts      # Reconhece intenções do usuário
│       ├── response-builder.ts       # Constrói respostas do bot
│       ├── commands/                 # Handlers de comandos
│       │   ├── products.ts          # Comandos relacionados a produtos
│       │   ├── financial.ts         # Comandos relacionados a finanças
│       │   ├── stock.ts             # Comandos de estoque
│       │   └── help.ts               # Comando de ajuda
│       ├── patterns/                 # Padrões de reconhecimento
│       │   ├── product-patterns.ts   # Padrões para produtos
│       │   ├── financial-patterns.ts # Padrões para finanças
│       │   └── date-patterns.ts      # Padrões para datas
│       └── types.ts                   # Tipos TypeScript
├── components/
│   └── chat/
│       ├── ChatBot.tsx              # Componente principal do chat
│       ├── ChatMessage.tsx          # Componente de mensagem
│       ├── ChatInput.tsx            # Campo de input
│       └── CommandSuggestions.tsx    # Sugestões de comandos
└── app/(dashboard)/
    └── chat/
        └── page.tsx                  # Página do chat (opcional)
```

### 1.2 Tipos Base

```typescript
// src/lib/chat-bot/types.ts

export type Intent = 
  | 'sell_product'
  | 'buy_product'
  | 'register_expense'
  | 'register_income'
  | 'check_stock'
  | 'list_products'
  | 'search_product'
  | 'help'
  | 'unknown'

export interface ParsedCommand {
  intent: Intent
  confidence: number // 0-1
  entities: {
    productName?: string
    productId?: string
    amount?: number
    date?: string
    category?: string
    description?: string
    quantity?: number
  }
  raw: string // Comando original
}

export interface BotResponse {
  message: string
  type: 'success' | 'error' | 'info' | 'question' | 'confirmation'
  data?: any
  suggestions?: string[]
  requiresConfirmation?: boolean
  confirmationData?: any
}

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
  type?: 'success' | 'error' | 'info'
  data?: any
}
```

---

## 📋 Fase 2: Parser de Comandos (Pattern Matching)

### 2.1 Reconhecimento de Intenção

**Estratégia:**
1. **Palavras-chave principais** (alta prioridade)
2. **Contexto** (palavras adjacentes)
3. **Padrões regulares** (para números, datas, etc.)

```typescript
// src/lib/chat-bot/intent-recognizer.ts

const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
  sell_product: [
    /vendi|vender|venda|vendido|vendemos/i,
    /vendi\s+(um|uma|o|a|os|as)?/i,
  ],
  buy_product: [
    /comprei|comprar|compra|comprado/i,
    /adquiri|adquirir|adquirido/i,
  ],
  register_expense: [
    /gastei|gastar|gasto|despesa/i,
    /paguei|pagar|pagamento/i,
  ],
  register_income: [
    /recebi|receber|receita|renda/i,
    /ganhei|ganhar|ganho/i,
  ],
  check_stock: [
    /(tem|tenho|há|existe)\s+(estoque|quantos|quantidade)/i,
    /estoque\s+(do|da|de)/i,
  ],
  list_products: [
    /lista|listar|mostrar|ver\s+(produtos|todos)/i,
  ],
  search_product: [
    /(procura|buscar|busca|encontra|tem)\s+(produto|produtos)/i,
  ],
  help: [
    /ajuda|help|comandos|o\s+que\s+posso/i,
  ],
}

export function recognizeIntent(command: string): ParsedCommand {
  // Normalizar comando (minúsculas, remover acentos opcionalmente)
  const normalized = normalizeCommand(command)
  
  // Detectar intenção
  let bestIntent: Intent = 'unknown'
  let bestConfidence = 0
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        bestIntent = intent as Intent
        bestConfidence = 0.9 // Alta confiança para match de padrão
        break
      }
    }
    if (bestIntent !== 'unknown') break
  }
  
  // Extrair entidades
  const entities = extractEntities(normalized, bestIntent)
  
  return {
    intent: bestIntent,
    confidence: bestConfidence,
    entities,
    raw: command
  }
}
```

### 2.2 Extração de Entidades

```typescript
// src/lib/chat-bot/command-parser.ts

export function extractEntities(command: string, intent: Intent): ParsedCommand['entities'] {
  const entities: ParsedCommand['entities'] = {}
  
  // Extrair valores monetários
  const moneyPattern = /(\d+[,.]?\d*)\s*(reais?|r\$|rs|real)/i
  const moneyMatch = command.match(moneyPattern)
  if (moneyMatch) {
    entities.amount = parseFloat(moneyMatch[1].replace(',', '.'))
  }
  
  // Extrair quantidades
  const quantityPattern = /(\d+)\s*(unidades?|un|pcs?|peças?)/i
  const quantityMatch = command.match(quantityPattern)
  if (quantityMatch) {
    entities.quantity = parseInt(quantityMatch[1])
  }
  
  // Extrair datas relativas
  entities.date = extractRelativeDate(command)
  
  // Extrair nome do produto (após palavras-chave)
  entities.productName = extractProductName(command, intent)
  
  // Extrair categoria
  entities.category = extractCategory(command)
  
  // Extrair descrição (frases após "para" ou "com")
  entities.description = extractDescription(command)
  
  return entities
}

function extractProductName(command: string, intent: Intent): string | undefined {
  // Padrões para identificar produto após palavra-chave
  const patterns = [
    /(?:vendi|comprei|produto|o|a|um|uma)\s+(.+?)(?:\s+(?:por|de|com|para)|$)/i,
    /(?:vendi|comprei)\s+(.+?)(?:\s+por|\s+de|\s+com|\s+para|$)/i,
  ]
  
  for (const pattern of patterns) {
    const match = command.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return undefined
}

function extractRelativeDate(command: string): string | undefined {
  const today = new Date()
  const normalized = command.toLowerCase()
  
  if (normalized.includes('hoje')) {
    return formatDate(today)
  }
  
  if (normalized.includes('amanhã') || normalized.includes('amanha')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDate(tomorrow)
  }
  
  if (normalized.includes('mês que vem') || normalized.includes('mes que vem') || normalized.includes('próximo mês')) {
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return formatDate(nextMonth)
  }
  
  // Padrão para datas específicas: "dia X", "dia X/mês"
  const datePattern = /(?:dia\s+)?(\d{1,2})(?:\/(\d{1,2}))?/
  const dateMatch = command.match(datePattern)
  if (dateMatch) {
    const day = parseInt(dateMatch[1])
    const month = dateMatch[2] ? parseInt(dateMatch[2]) : today.getMonth() + 1
    const year = today.getFullYear()
    return formatDate(new Date(year, month - 1, day))
  }
  
  return formatDate(today) // Default: hoje
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}
```

---

## 📋 Fase 3: Handlers de Comandos

### 3.1 Handler de Venda de Produto

```typescript
// src/lib/chat-bot/commands/products.ts

export async function handleSellProduct(
  command: ParsedCommand,
  userId: string,
  products: Product[]
): Promise<BotResponse> {
  const { productName, amount, date, quantity } = command.entities
  
  // 1. Buscar produto
  if (!productName) {
    return {
      message: "Não consegui identificar qual produto você vendeu. Pode repetir? Exemplo: 'vendi o colar de pérolas'",
      type: 'error',
      suggestions: ['vendi o colar de pérolas', 'vendi um produto']
    }
  }
  
  // Buscar produtos que correspondem ao nome
  const matches = products.filter(p => 
    p.name.toLowerCase().includes(productName.toLowerCase()) ||
    productName.toLowerCase().includes(p.name.toLowerCase())
  )
  
  if (matches.length === 0) {
    return {
      message: `Não encontrei nenhum produto com o nome "${productName}". Quer que eu liste os produtos disponíveis?`,
      type: 'question',
      suggestions: ['sim', 'não', 'listar produtos']
    }
  }
  
  if (matches.length === 1) {
    // Produto único - confirmar e executar
    const product = matches[0]
    return {
      message: `Encontrei o produto "${product.name}". Confirmar venda?`,
      type: 'confirmation',
      requiresConfirmation: true,
      confirmationData: {
        action: 'sell_product',
        productId: product.id,
        productName: product.name,
        amount: amount || product.price,
        quantity: quantity || 1,
        date: date || getLocalDateString()
      }
    }
  }
  
  // Múltiplos produtos - listar opções
  const options = matches.map((p, i) => `${i + 1}. ${p.name} (R$ ${p.price.toFixed(2)})`)
  return {
    message: `Encontrei ${matches.length} produtos. Qual deles você quer vender?\n\n${options.join('\n')}`,
    type: 'question',
    data: { productMatches: matches },
    suggestions: matches.map((_, i) => (i + 1).toString())
  }
}

export async function executeSellProduct(
  data: ConfirmationData,
  userId: string
): Promise<BotResponse> {
  try {
    // 1. Verificar estoque
    const product = await getProduct(data.productId, userId)
    if (!product) {
      return {
        message: "Produto não encontrado.",
        type: 'error'
      }
    }
    
    if (product.stock_quantity < data.quantity) {
      return {
        message: `Estoque insuficiente! Você tem apenas ${product.stock_quantity} unidades disponíveis.`,
        type: 'error'
      }
    }
    
    // 2. Criar transação
    const transaction = await createTransaction({
      user_id: userId,
      type: 'income',
      amount: data.amount * data.quantity,
      date: data.date,
      description: `Venda: ${data.productName} x${data.quantity}`,
      product_id: data.productId,
      is_paid: true
    })
    
    // 3. Atualizar estoque
    await updateStock(data.productId, userId, -data.quantity)
    
    // 4. Atualizar caixa
    await updateCashBalance(userId, data.amount * data.quantity)
    
    return {
      message: `✅ Venda registrada com sucesso!\n\n${data.productName} x${data.quantity}\nR$ ${(data.amount * data.quantity).toFixed(2)}`,
      type: 'success',
      data: { transaction, product }
    }
  } catch (error) {
    return {
      message: `Erro ao registrar venda: ${error.message}`,
      type: 'error'
    }
  }
}
```

### 3.2 Handler de Despesa

```typescript
// src/lib/chat-bot/commands/financial.ts

export async function handleRegisterExpense(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  const { amount, date, description, category } = command.entities
  
  if (!amount) {
    return {
      message: "Não consegui identificar o valor da despesa. Pode informar? Exemplo: 'gastei 50 reais no supermercado'",
      type: 'error',
      suggestions: ['50 reais', 'R$ 50']
    }
  }
  
  const expenseDescription = description || 
    command.raw.replace(/gastei|gastar|gasto|paguei|pagar/i, '').trim() ||
    'Despesa registrada'
  
  return {
    message: `Confirmar despesa?\n\nValor: R$ ${amount.toFixed(2)}\nDescrição: ${expenseDescription}\nData: ${formatDateString(date || getLocalDateString())}`,
    type: 'confirmation',
    requiresConfirmation: true,
    confirmationData: {
      action: 'register_expense',
      amount,
      date: date || getLocalDateString(),
      description: expenseDescription,
      category
    }
  }
}

export async function executeRegisterExpense(
  data: ConfirmationData,
  userId: string
): Promise<BotResponse> {
  try {
    const transaction = await createTransaction({
      user_id: userId,
      type: 'expense',
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      is_paid: true
    })
    
    await updateCashBalance(userId, -data.amount)
    
    return {
      message: `✅ Despesa registrada com sucesso!\n\nR$ ${data.amount.toFixed(2)}\n${data.description}`,
      type: 'success',
      data: { transaction }
    }
  } catch (error) {
    return {
      message: `Erro ao registrar despesa: ${error.message}`,
      type: 'error'
    }
  }
}
```

### 3.3 Handler de Consulta de Estoque

```typescript
// src/lib/chat-bot/commands/stock.ts

export async function handleCheckStock(
  command: ParsedCommand,
  userId: string,
  products: Product[]
): Promise<BotResponse> {
  const { productName } = command.entities
  
  if (!productName) {
    // Listar todos os produtos com estoque baixo
    const lowStock = products.filter(p => p.stock_quantity <= 5)
    
    if (lowStock.length === 0) {
      return {
        message: "✅ Todos os produtos têm estoque adequado!",
        type: 'success'
      }
    }
    
    const list = lowStock.map(p => 
      `• ${p.name}: ${p.stock_quantity} unidades`
    ).join('\n')
    
    return {
      message: `⚠️ Produtos com estoque baixo:\n\n${list}`,
      type: 'info',
      data: { lowStockProducts: lowStock }
    }
  }
  
  // Buscar produto específico
  const matches = products.filter(p => 
    p.name.toLowerCase().includes(productName.toLowerCase())
  )
  
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
      ? `✅ ${product.stock_quantity} unidades disponíveis`
      : '❌ Sem estoque'
    
    return {
      message: `Produto: ${product.name}\n${status}\nPreço: R$ ${product.price.toFixed(2)}`,
      type: 'info',
      data: { product }
    }
  }
  
  // Múltiplos produtos
  const list = matches.map(p => 
    `${p.name}: ${p.stock_quantity} unidades`
  ).join('\n')
  
  return {
    message: `Encontrei ${matches.length} produtos:\n\n${list}`,
    type: 'info',
    data: { productMatches: matches }
  }
}
```

---

## 📋 Fase 4: Componente de Chat

### 4.1 Componente Principal

```typescript
// src/components/chat/ChatBot.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { CommandSuggestions } from './CommandSuggestions'
import { recognizeIntent } from '@/lib/chat-bot/intent-recognizer'
import { processCommand } from '@/lib/chat-bot'
import type { Product } from '@/types/product'

interface ChatBotProps {
  userId: string
  products?: Product[]
  onTransactionCreated?: () => void
}

export function ChatBot({ userId, products = [], onTransactionCreated }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Mensagem de boas-vindas
    setMessages([{
      id: 'welcome',
      role: 'bot',
      content: '👋 Olá! Como posso ajudar?\n\nVocê pode:\n• Registrar vendas\n• Registrar despesas\n• Consultar estoque\n• Listar produtos\n\nDigite "ajuda" para ver todos os comandos.',
      timestamp: new Date(),
      type: 'info'
    }])
  }, [])
  
  const handleSendMessage = async (content: string) => {
    // Verificar se é confirmação
    if (pendingConfirmation) {
      const normalized = content.toLowerCase().trim()
      if (normalized === 'sim' || normalized === 'confirmar' || normalized === 's' || normalized === 'y') {
        await handleConfirmation(true)
        return
      } else if (normalized === 'não' || normalized === 'n' || normalized === 'cancelar') {
        await handleConfirmation(false)
        return
      }
    }
    
    // Verificar se é seleção numérica de produto
    const number = parseInt(content.trim())
    if (!isNaN(number) && pendingConfirmation?.data?.productMatches) {
      const selectedIndex = number - 1
      if (selectedIndex >= 0 && selectedIndex < pendingConfirmation.data.productMatches.length) {
        await handleProductSelection(selectedIndex)
        return
      }
    }
    
    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    // Processar comando
    setIsLoading(true)
    try {
      const response = await processCommand(content, userId, products)
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
        type: response.type,
        data: response.data
      }
      
      setMessages(prev => [...prev, botMessage])
      
      if (response.requiresConfirmation) {
        setPendingConfirmation(response.confirmationData)
      } else {
        setPendingConfirmation(null)
      }
      
      // Callback se transação foi criada
      if (response.type === 'success' && response.data?.transaction) {
        onTransactionCreated?.()
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `Erro: ${error.message}`,
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleConfirmation = async (confirmed: boolean) => {
    if (!pendingConfirmation) return
    
    if (!confirmed) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'bot',
        content: 'Operação cancelada.',
        timestamp: new Date(),
        type: 'info'
      }])
      setPendingConfirmation(null)
      return
    }
    
    // Executar ação confirmada
    setIsLoading(true)
    try {
      const response = await executeConfirmedAction(pendingConfirmation, userId, products)
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
        type: response.type,
        data: response.data
      }
      
      setMessages(prev => [...prev, botMessage])
      
      if (response.data?.transaction) {
        onTransactionCreated?.()
      }
    } catch (error) {
      // ...
    } finally {
      setIsLoading(false)
      setPendingConfirmation(null)
    }
  }
  
  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Chat Bot</h2>
      </div>
      
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-2 w-2 bg-current rounded-full animate-pulse" />
            <span>Processando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Sugestões de comandos */}
      {!isLoading && messages.length > 1 && (
        <CommandSuggestions 
          onSelect={handleSendMessage}
          lastIntent={messages[messages.length - 1]?.data?.intent}
        />
      )}
      
      {/* Input */}
      <ChatInput 
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder={pendingConfirmation ? "Digite 'sim' para confirmar ou 'não' para cancelar" : "Digite um comando..."}
      />
    </div>
  )
}
```

---

## 📋 Fase 5: Integração e Testes

### 5.1 Integrar no Layout Principal

```typescript
// src/app/(dashboard)/financial/page.tsx (ou onde for necessário)

import { ChatBot } from '@/components/chat/ChatBot'

// No componente:
<ChatBot 
  userId={user.id}
  products={products}
  onTransactionCreated={() => {
    loadData() // Recarregar dados
    toast.success('Transação criada via chat!')
  }}
/>
```

### 5.2 Testes de Comandos

**Comandos a testar:**
1. `"vendi o colar de pérolas"`
2. `"gastei 50 reais no supermercado hoje"`
3. `"tem estoque do colar?"`
4. `"vendi um produto por 140 reais que será pago mês que vem"`
5. `"lista produtos"`
6. `"ajuda"`

---

## 📋 Fase 6: Melhorias e Expansão

### 6.1 Sugestões Inteligentes

- Memorizar comandos frequentes do usuário
- Sugerir produtos baseado no histórico
- Auto-completar nomes de produtos

### 6.2 Aprendizado Contextual

- Manter contexto da conversa (últimos produtos mencionados)
- Entender referências como "ele", "esse produto", "o mesmo"

### 6.3 Comandos Avançados

- `"quanto vendi este mês"`
- `"qual produto vendeu mais"`
- `"quais produtos estão sem estoque"`

---

## ⏱️ Estimativa de Implementação

| Fase | Tarefas | Tempo Estimado |
|------|---------|----------------|
| Fase 1 | Estrutura e tipos | 2 horas |
| Fase 2 | Parser e reconhecimento | 4 horas |
| Fase 3 | Handlers de comandos | 6 horas |
| Fase 4 | Componente de chat | 4 horas |
| Fase 5 | Integração e testes | 3 horas |
| Fase 6 | Melhorias (opcional) | 4 horas |
| **Total** | | **~23 horas (3 dias)** |

---

## ✅ Checklist de Implementação

- [ ] Criar estrutura de arquivos
- [ ] Implementar tipos TypeScript
- [ ] Criar `intent-recognizer.ts`
- [ ] Criar `command-parser.ts`
- [ ] Implementar handler de vendas
- [ ] Implementar handler de despesas
- [ ] Implementar handler de receitas
- [ ] Implementar handler de consulta de estoque
- [ ] Implementar handler de ajuda
- [ ] Criar componente `ChatBot.tsx`
- [ ] Criar componente `ChatMessage.tsx`
- [ ] Criar componente `ChatInput.tsx`
- [ ] Criar componente `CommandSuggestions.tsx`
- [ ] Integrar no dashboard financeiro
- [ ] Testar todos os comandos
- [ ] Documentar comandos disponíveis
- [ ] Adicionar sugestões contextuais (opcional)

---

## 📝 Notas Importantes

1. **Sem IA Externa**: Todo processamento é feito localmente via pattern matching
2. **Confirmações**: Sempre confirmar ações críticas (vendas, despesas)
3. **Fallback**: Se não entender, pedir esclarecimento ao usuário
4. **Extensibilidade**: Fácil adicionar novos comandos seguindo o padrão
5. **Performance**: Tudo é síncrono (exceto operações de banco)

---

## 🚀 Próximos Passos

1. Começar pela Fase 1 (estrutura)
2. Implementar parser básico (Fase 2)
3. Criar primeiro handler (vendas) para validar fluxo
4. Expandir para outros comandos
5. Integrar UI
6. Testar e refinar

