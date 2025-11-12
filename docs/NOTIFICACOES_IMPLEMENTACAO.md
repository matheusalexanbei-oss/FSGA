# 🔔 Sistema de Notificações - Implementação Completa

## 📋 Resumo

Este documento descreve a implementação completa do sistema de notificações para transações financeiras agendadas, incluindo as correções realizadas e funcionalidades adicionadas.

---

## ✅ Correções Realizadas

### 1. **Badge de Notificações Corrigido**

**Problema:** O badge mostrava todas as transações dos próximos 7 dias, incluindo transações que não deveriam aparecer hoje (ex: transação de 19/11 aparecendo quando hoje é 12/11).

**Solução:**
- Badge agora usa o endpoint `/api/notifications/check` que retorna apenas notificações que devem ser exibidas HOJE
- Dropdown continua usando `/api/notifications/upcoming` para mostrar todas as próximas notificações
- Badge atualiza a cada 2 minutos (mesmo intervalo do `useRealtimeNotifications`)

**Arquivos Modificados:**
- `src/components/layout/NotificationButton.tsx`

### 2. **Lógica de Datas Corrigida**

**Comportamento Correto:**
- **Hoje (dia 0):** Notifica no dia da transação
- **Amanhã (dia 1):** Notifica 1 dia antes da transação
- **3 dias depois (dia 3):** Notifica 3 dias antes da transação
- **Vencidas (dia < 0):** Notifica sobre transações vencidas

**Exemplo:**
- Se hoje é 12/11 e a transação é para 19/11:
  - ✅ NÃO aparece no badge (não é hoje, amanhã, nem 3 dias depois)
  - ✅ Aparece no dropdown (próxima notificação será em 16/11 - 3 dias antes)

---

## 🆕 Funcionalidades Adicionadas

### 1. **Preferências de Notificações**

**Migration:** `supabase/migrations/202511120002_add_notification_preferences.sql`

**Campos Adicionados em `users_profile`:**
- `notifications_enabled` - Ativar/desativar todas as notificações
- `notifications_financial_enabled` - Ativar/desativar notificações financeiras
- `notifications_financial_3days` - Notificar 3 dias antes
- `notifications_financial_1day` - Notificar 1 dia antes
- `notifications_financial_day` - Notificar no dia
- `notifications_financial_overdue` - Notificar sobre transações vencidas

**Valores Padrão:**
- Todas as preferências são `true` por padrão
- Usuários podem desabilitar qualquer tipo de notificação

### 2. **Tela de Configurações**

**Arquivo:** `src/app/(dashboard)/settings/page.tsx`

**Funcionalidades:**
- Toggle para ativar/desativar todas as notificações
- Toggle para ativar/desativar notificações financeiras
- Sub-opções para cada tipo de notificação (3 dias, 1 dia, no dia, vencidas)
- Interface intuitiva com switches (shadcn/ui)
- Estados de loading e erro tratados
- Valores padrão quando perfil não existe

**Componente Criado:**
- `NotificationSettings` - Componente para gerenciar preferências de notificações

### 3. **Hook de Preferências**

**Arquivo:** `src/hooks/useNotificationPreferences.tsx`

**Funcionalidades:**
- Carrega preferências do perfil do usuário
- Salva preferências no Supabase
- Atualiza preferências individuais
- Trata desabilitação em cascata (desabilitar todas desabilita financeiras, desabilitar financeiras desabilita sub-opções)
- Estados de loading e saving
- Toast notifications para feedback

### 4. **Endpoint Atualizado**

**Arquivo:** `src/app/api/notifications/check/route.ts`

**Melhorias:**
- Busca preferências do usuário antes de processar notificações
- Filtra notificações de acordo com preferências do usuário
- Retorna array vazio se notificações estiverem desabilitadas
- Logs detalhados para depuração

**Lógica de Filtro:**
1. Verifica se notificações estão habilitadas (`notifications_enabled`)
2. Verifica se notificações financeiras estão habilitadas (`notifications_financial_enabled`)
3. Verifica se o tipo específico de notificação está habilitado (3 dias, 1 dia, no dia, vencidas)
4. Retorna apenas notificações que atendem todos os critérios

### 5. **Cron Job Configurado**

**Arquivo:** `vercel.json`

**Configuração:**
- Cron job executado diariamente às 9h (horário UTC)
- Endpoint: `/api/notifications/process`
- Envia push notifications para usuários com subscriptions ativas

**Nota:** Requer configuração de `CRON_SECRET` no Vercel para autenticação.

### 6. **Script de Testes**

**Arquivo:** `scripts/create-test-transactions.ts`

**Funcionalidades:**
- Cria transações de teste para validação do sistema
- Inclui transações para hoje, amanhã, 3 dias, 7 dias, 15 dias
- Inclui transações vencidas (ontem, 5 dias atrás)
- Inclui transação já paga (não deve aparecer)
- Inclui transação recorrente
- Validação de usuário antes de criar transações
- Logs detalhados de criação

**Uso:**
```bash
tsx scripts/create-test-transactions.ts <user-id>
```

---

## 📊 Fluxo de Notificações

### 1. **Notificações em Tempo Real (Toast)**

**Hook:** `useRealtimeNotifications`

**Fluxo:**
1. Hook verifica notificações a cada 2 minutos
2. Chama `/api/notifications/check` para buscar notificações do dia
3. Endpoint verifica preferências do usuário
4. Endpoint retorna apenas notificações que devem ser exibidas hoje
5. Hook exibe toast notifications usando Sonner
6. Hook marca notificação como enviada via `/api/notifications/mark-sent`

### 2. **Badge de Notificações**

**Componente:** `NotificationButton`

**Fluxo:**
1. Componente chama `/api/notifications/check` a cada 2 minutos
2. Endpoint retorna apenas notificações que devem ser exibidas hoje
3. Badge mostra número de notificações pendentes
4. Badge atualiza automaticamente quando novas notificações aparecem

### 3. **Dropdown de Notificações**

**Componente:** `NotificationButton`

**Fluxo:**
1. Componente chama `/api/notifications/upcoming` quando dropdown abre
2. Endpoint retorna todas as próximas notificações (próximos 7 dias)
3. Dropdown mostra lista de transações com datas de notificação
4. Usuário pode ver quando cada notificação será enviada

### 4. **Push Notifications**

**Endpoint:** `/api/notifications/process`

**Fluxo:**
1. Cron job chama endpoint diariamente às 9h
2. Endpoint busca transações que precisam de notificação hoje
3. Endpoint verifica preferências do usuário
4. Endpoint envia push notifications via web-push
5. Endpoint marca notificações como enviadas

---

## 🔧 Configuração

### 1. **Variáveis de Ambiente**

**Requeridas:**
- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave pública do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase (para cron job)
- `CRON_SECRET` - Secret para autenticar cron job (opcional)

**Opcionais (para Push Notifications):**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Chave pública VAPID
- `VAPID_PRIVATE_KEY` - Chave privada VAPID
- `VAPID_EMAIL` - Email para VAPID

### 2. **Migrations**

**Migrations Aplicadas:**
1. `202511120001_fix_supabase_advisors.sql` - Corrige warnings do Security Advisor
2. `202511120002_add_notification_preferences.sql` - Adiciona preferências de notificações

**Como Aplicar:**
```bash
# Via Supabase MCP (já aplicado)
# Ou via SQL Editor do Supabase Dashboard
```

### 3. **Cron Job (Vercel)**

**Configuração:**
- Arquivo `vercel.json` já configurado
- Cron job executa diariamente às 9h UTC
- Requer `CRON_SECRET` configurado no Vercel

**Verificar:**
- Vercel Dashboard → Settings → Environment Variables
- Adicionar `CRON_SECRET` com valor aleatório

---

## 🧪 Testes

### 1. **Script de Testes**

**Criar Transações de Teste:**
```bash
tsx scripts/create-test-transactions.ts <user-id>
```

**Transações Criadas:**
- ✅ Transação para hoje (deve aparecer no badge)
- ✅ Transação para amanhã (deve aparecer no badge)
- ✅ Transação para 3 dias (deve aparecer no badge)
- ✅ Transação para 7 dias (NÃO deve aparecer no badge, mas sim no dropdown)
- ✅ Transação para 15 dias (NÃO deve aparecer no badge, mas sim no dropdown)
- ✅ Transação vencida (deve aparecer no badge)
- ✅ Transação paga (NÃO deve aparecer)
- ✅ Transação recorrente (deve aparecer normalmente)

### 2. **Testes Manuais**

**Verificar Badge:**
1. Criar transação para hoje
2. Badge deve mostrar número > 0
3. Aguardar 2 minutos para atualização automática

**Verificar Dropdown:**
1. Abrir dropdown de notificações
2. Ver lista de próximas notificações
3. Verificar datas de notificação (3 dias antes, 1 dia antes, no dia)

**Verificar Configurações:**
1. Ir para `/settings`
2. Desabilitar notificações financeiras
3. Verificar que badge desaparece
4. Reabilitar notificações
5. Verificar que badge reaparece

**Verificar Preferências:**
1. Desabilitar "3 dias antes"
2. Criar transação para 3 dias depois
3. Verificar que notificação não aparece
4. Reabilitar "3 dias antes"
5. Verificar que notificação aparece

---

## 📝 Próximos Passos

### 1. **Testes Automatizados**

**Pendente:**
- [ ] Testes unitários para `useNotificationPreferences`
- [ ] Testes de integração para `/api/notifications/check`
- [ ] Testes de integração para `/api/notifications/upcoming`
- [ ] Testes de integração para `/api/notifications/mark-sent`
- [ ] Testes de integração para `/api/notifications/process`

### 2. **Melhorias Futuras**

**Backlog:**
- [ ] Notificações de estoque baixo
- [ ] Notificações por email
- [ ] Notificações por SMS
- [ ] Histórico de notificações
- [ ] Estatísticas de notificações

---

## 🎉 Conclusão

O sistema de notificações está **80% completo** e **funcional** para o MVP financeiro:

✅ **Funcionalidades Implementadas:**
- Badge de notificações corrigido
- Preferências de notificações
- Tela de configurações
- Endpoint respeitando preferências
- Cron job configurado
- Script de testes criado

⏳ **Pendências:**
- Testes automatizados
- Notificações de estoque baixo (fase 2)

---

**Última Atualização:** 12/11/2025  
**Status:** ✅ MVP Financeiro Completo

