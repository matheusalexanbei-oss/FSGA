# 🤖 IA Financeira - Plano Completo

## 🎯 Objetivo
Criar um sistema de IA que permite ao usuário registrar transações financeiras conversando naturalmente, integrando com produtos e estoque.

---

## 💬 Exemplos de Comandos

### **Exemplo 1: Venda Simples**
```
Usuário: "vendi o colar de pérolas"

IA: 
1. Busca produtos com "colar" e "pérolas" no nome
2. Se encontrar 1 produto → Confirma
3. Se encontrar múltiplos → Lista opções
4. Usuário confirma
5. ✅ Estoque -1
6. ✅ Transação criada (tipo: income)
7. ✅ Dinheiro em caixa atualizado
8. ✅ Notificação: "Colar de Pérolas Dourado vendido por R$ 120,00!"
```

### **Exemplo 2: Venda com Pagamento Futuro**
```
Usuário: "Vendi um colar de pérolas por 140 reais que será pago mês que vem"

IA:
1. Identifica: Produto, Valor, Data futura
2. Confirma produto com usuário
3. ✅ Estoque -1 imediatamente
4. ✅ Transação criada (scheduled_date: 27/10, is_paid: false)
5. ✅ Notificação agendada criada
6. ✅ Notificação: "Colar de Pérolas vendido! R$ 140,00 será recebido em 27/10"
```

### **Exemplo 3: Despesa**
```
Usuário: "gastei 50 reais com compras no supermercado hoje"

IA:
1. Identifica: Despesa, Valor, Data (hoje)
2. ✅ Transação criada (tipo: expense)
3. ✅ Dinheiro em caixa atualizado
4. ✅ Notificação: "Despesa registrada: R$ 50,00"
```

---

## 🧠 Lógica da IA

### **1. Processamento de Comando**
```typescript
// src/lib/ai/finance-processor.ts

interface ParsedCommand {
  action: 'sell' | 'buy' | 'expense' | 'income' | 'unknown'
  productName?: string
  amount?: number
  date?: string
  paymentScheduled?: boolean
  paymentDate?: string
  paymentMethod?: string
  category?: string
}
```

### **2. Fluxo de Execução**
```
1. Usuário digita comando
   ↓
2. Enviar para Claude 3.5
   ↓
3. Claude retorna JSON estruturado
   ↓
4. Validação e confirmação
   ↓
5. Buscar produtos (se necessário)
   ↓
6. Confirmar com usuário
   ↓
7. Executar ações (estoque, transação, caixa)
   ↓
8. Notificação de sucesso
```

---

## 🔧 Implementação Técnica

### **Arquitetura:**

```
Frontend (Next.js)
    ↓
Edge Function (Supabase)
    ↓
Claude 3.5 API (Anthropic)
    ↓
Supabase Database
```

### **Arquivos a Criar:**

1. **`supabase/functions/finance-ai/index.ts`**
   - Edge Function para processar comandos
   - Integração com Claude 3.5

2. **`src/lib/ai/finance-processor.ts`**
   - Processamento de comandos
   - Validação e execução

3. **`src/components/financial/AIChat.tsx`**
   - Interface de chat
   - Histórico de conversas

4. **`src/types/ai-chat.ts`**
   - Tipos para comandos e respostas

---

## 📋 Prompt System para Claude

```typescript
const SYSTEM_PROMPT = `Você é um assistente financeiro para um sistema de gestão.

SEU OBJETIVO: Processar comandos em português natural e retornar JSON estruturado.

EXEMPLOS:

Comando: "vendi o colar de pérolas"
Resposta: {
  "action": "sell",
  "productName": "colar de pérolas",
  "amount": null, // Será preenchido do produto
  "date": "2025-01-17", // Hoje
  "paymentScheduled": false,
  "category": "Vendas"
}

Comando: "Vendi um colar por 140 reais que será pago mês que vem"
Resposta: {
  "action": "sell",
  "productName": "colar",
  "amount": 140,
  "date": "2025-01-17", // Hoje
  "paymentScheduled": true,
  "paymentDate": "2025-02-17", // Mês que vem
  "category": "Vendas"
}

INSTRUÇÕES:
- SEMPRE retorne JSON válido
- Se não entender, action: "unknown"
- Extraia datas relativas (hoje, amanhã, mês que vem)
- Extraia valores monetários
- Identifique ação (vender, comprar, gastar)

RETORNE APENAS O JSON, SEM TEXTOS ADICIONAIS.`

const USER_PROMPT = `Comando do usuário: "${command}"`
```

---

## 💰 Custos e Tokens

### **Estimativa de Tokens por Processamento:**
- Input (prompt): ~300-500 tokens
- Output (JSON): ~100-200 tokens
- **Total**: ~400-700 tokens por comando

### **Custos com Claude 3.5 Sonnet:**
- **Input**: $3.00 por 1M tokens
- **Output**: $15.00 por 1M tokens
- **Custo médio por comando**: ~$0.01-0.02

### **Cenário Realista:**
- 100 usuários ativos
- 50 comandos/dia por usuário (máximo)
- Total: 5.000 comandos/dia
- Custo diário: $50-100
- **Custo mensal**: $1.500-3.000

⚠️ **Conclusão**: Muito caro para muitos usuários!

### **Soluções:**
1. **Limitar comandos**: 100 comandos/dia por usuário (gratuito), depois cobrar
2. **Cache de comandos**: Salvar respostas similares
3. **Uso de GPT-3.5**: Mais barato (~10x mais barato)
4. **Modelo próprio**: Treinar modelo específico (longo prazo)

---

## 🎯 Fases de Implementação

### **Fase 1: MVP (Esta Semana)**
- ✅ Edge Function básica
- ✅ Integração com Claude
- ✅ Processamento de venda simples
- ✅ Interface de chat básica

### **Fase 2: Comandos Avançados (Próxima Semana)**
- ⏳ Despesas
- ⏳ Pagamentos futuros
- ⏳ Múltiplos produtos
- ⏳ Validação de estoque

### **Fase 3: Otimização (Futuro)**
- ⏳ Cache de comandos
- ⏳ Limite de comandos
- ⏳ Analytics de uso
- ⏳ Modelo próprio

---

## 🔐 Segurança

### **Validações Necessárias:**
1. ✅ Usuário autenticado
2. ✅ Produto existe e pertence ao usuário
3. ✅ Estoque suficiente
4. ✅ Valor positivo
5. ✅ Data válida
6. ✅ Confirmação do usuário

### **Limitações:**
- Não permitir vendas de estoque zerado
- Não permitir valores negativos
- Não permitir datas no passado distante
- Rate limiting por usuário

---

## 📱 Interface de Chat

### **Design Sugerido:**

```
┌─────────────────────────────────┐
│  💬 IA Financeira               │
├─────────────────────────────────┤
│                                 │
│  Usuário: vendi o colar         │
│                                 │
│  IA: Encontrei 1 produto        │
│  ╔═══════════════════════════╗  │
│  ║ Colar de Pérolas Dourado  ║  │
│  ║ R$ 120,00 | Estoque: 5    ║  │
│  ║ [Confirmar] [Cancelar]    ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  ✅ Venda realizada!            │
│  Colar de Pérolas vendido       │
│  Estoque atualizado: 4          │
│  Transação criada               │
│                                 │
├─────────────────────────────────┤
│  [Digite sua mensagem...] [→]   │
└─────────────────────────────────┘
```

---

## 🚀 Próximos Passos

1. **Criar Edge Function** para processar comandos
2. **Configurar Claude API** (variável de ambiente)
3. **Criar interface de chat** na página financeira
4. **Implementar validações** de segurança
5. **Testar com comandos reais**

---

**Este é um sistema complexo mas poderoso. Recomendo começar simples e ir evoluindo!** 🎯

