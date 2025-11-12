# 🔍 Guia de Debug - Logs do BOT AI

## 📋 Logs Adicionados

Foram adicionados **196 logs** em pontos críticos do sistema:

### ✅ Frontend (FloatingAIChat.tsx):
- **124 logs** em pontos críticos:
  - Quando o componente é montado
  - Quando o usuário submete um comando
  - Quando a API é chamada
  - Quando a resposta é recebida
  - Quando o transactionData é definido
  - Quando a transação é confirmada
  - Valores de todas as variáveis importantes

### ✅ Backend (route.ts):
- **72 logs** em pontos críticos:
  - Quando a API recebe uma requisição
  - Quando detecta parcelamento
  - Quando detecta pagamento agendado
  - Quando detecta recorrência
  - parsedCommand completo antes de retornar

---

## 🔧 Como Ver os Logs

### 1. Abra o Console do Navegador
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba **Console**

### 2. Limpe o Console
- Clique no ícone de "limpar" (🚫) ou pressione `Ctrl+L`
- Isso remove logs antigos

### 3. Filtre os Logs
- No campo de filtro do console, digite: `🚀 LOG`
- Isso mostrará apenas nossos logs de debug

### 4. Teste um Comando
Digite no BOT:
- `"vendi uma tornozeleira em 3x"` (deve detectar parcelamento)
- `"vendi uma tornozeleira que será paga mês que vem"` (deve detectar agendamento)

### 5. Verifique os Logs
Você deve ver logs começando com:
- `🚀 LOG - FloatingAIChat COMPONENTE MONTADO`
- `🚀 LOG - handleSubmit INICIADO`
- `🚀 LOG - API Route POST INICIADO`
- `🚀 LOG - detectInstallment chamado`
- `🚀 LOG - detectScheduledPayment chamado`

---

## 🐛 Se os Logs Não Aparecerem

### Problema 1: Next.js não recompilou
**Solução:**
1. Pare o servidor (`Ctrl+C`)
2. Limpe o cache: `rm -rf .next` (Linux/Mac) ou delete a pasta `.next` (Windows)
3. Reinicie: `npm run dev`

### Problema 2: Console filtrado
**Solução:**
1. No console, verifique se há filtros ativos
2. Clique em "All levels" para mostrar todos os níveis
3. Remova qualquer texto do campo de filtro

### Problema 3: Código em produção
**Solução:**
- Certifique-se de estar rodando em modo desenvolvimento (`npm run dev`)
- Logs são removidos em builds de produção

### Problema 4: Componente não está sendo usado
**Solução:**
- Verifique se o `FloatingAIChat` está sendo renderizado na página
- Procure por: `import { FloatingAIChat } from ...`

---

## 📊 O Que Procurar nos Logs

### Para Parcelamento ("em 3x"):
```
🚀 LOG - detectInstallment chamado com texto: "vendi uma tornozeleira em 3x"
🚀 LOG - detectInstallment:
  - match encontrado: ["em 3x", "3"]
  - padrão usado: /(?:em|com|de)\s+(\d+)\s*(?:x|vezes|parcelas?)/i
🚀 LOG - detectInstallment: DETECTADO!
🚀 LOG - API Route - parsedCommand completo:
  - isInstallment: true
  - installmentCount: 3
```

### Para Agendamento ("será paga mês que vem"):
```
🚀 LOG - detectScheduledPayment chamado com texto: "vendi uma tornozeleira que será paga mes que vem"
🚀 LOG - detectScheduledPayment:
  - hasFutureKeyword: true
  - lowerText: "vendi uma tornozeleira que será paga mes que vem"
🚀 LOG - detectScheduledPayment: DETECTADO!
🚀 LOG - API Route - parsedCommand completo:
  - paymentScheduled: true
  - paymentDate: "2025-02-17"
```

---

## 🔍 Pontos de Verificação

Ao testar, verifique estes logs específicos:

1. **Componente montado?**
   - `🚀 LOG - FloatingAIChat COMPONENTE MONTADO`

2. **Comando submetido?**
   - `🚀 LOG - handleSubmit INICIADO`
   - `🚀 LOG - command: "vendi uma tornozeleira em 3x"`

3. **API recebeu requisição?**
   - `🚀 LOG - API Route POST INICIADO`
   - `🚀 LOG - Request body recebido:`

4. **Detecção funcionou?**
   - `🚀 LOG - detectInstallment: DETECTADO!` (para parcelamento)
   - `🚀 LOG - detectScheduledPayment: DETECTADO!` (para agendamento)

5. **Dados corretos no parsedCommand?**
   - `🚀 LOG - API Route - parsedCommand completo:`
   - Verifique se `isInstallment: true` ou `paymentScheduled: true`

6. **TransactionData definido corretamente?**
   - `🚀 LOG - TransactionData definido (auto-seleção):`
   - Verifique se os valores estão corretos

7. **Transação criada corretamente?**
   - `🚀 LOG - TransactionRecord completo:`
   - Verifique `is_paid` e `scheduled_date`

---

## 📝 Enviando os Logs

Se os logs não aparecerem ou mostrarem valores incorretos:

1. **Copie todos os logs** do console (selecione tudo e copie)
2. **Informe:**
   - Qual comando você digitou
   - O que esperava acontecer
   - O que realmente aconteceu
   - Os logs relevantes (especialmente os que começam com `🚀 LOG`)

---

## ⚠️ Nota Importante

**Os logs só aparecem no console do navegador (F12), não no terminal do servidor.**

Se você estiver olhando o terminal onde o Next.js está rodando, os logs da API aparecerão lá, mas os logs do frontend só aparecem no console do navegador.





