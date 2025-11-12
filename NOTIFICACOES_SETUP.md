# 🔔 Sistema de Notificações Push - Guia de Configuração

Este guia explica como configurar o sistema de notificações push para transações recorrentes e agendadas.

## 📋 Pré-requisitos

1. Node.js instalado
2. Acesso ao terminal
3. Conta no Supabase (se usando Supabase)

## 🔑 Passo 1: Gerar VAPID Keys

As VAPID keys são necessárias para autenticar o servidor que envia notificações push.

### Instalar web-push globalmente (se ainda não tiver):

```bash
npm install -g web-push
```

### Gerar as keys:

```bash
web-push generate-vapid-keys
```

Isso vai gerar algo como:

```
Public Key:
BKx...sua-chave-publica-aqui

Private Key:
xYz...sua-chave-privada-aqui
```

## 🔧 Passo 2: Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# VAPID Keys para Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKx...sua-chave-publica-aqui
VAPID_PRIVATE_KEY=xYz...sua-chave-privada-aqui
VAPID_EMAIL=mailto:seu-email@exemplo.com

# Secret para proteger o endpoint de processamento (opcional mas recomendado)
CRON_SECRET=seu-secret-aleatorio-aqui
```

**⚠️ IMPORTANTE:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` deve começar com `NEXT_PUBLIC_` para ser acessível no cliente
- `VAPID_PRIVATE_KEY` NUNCA deve ser exposta no cliente
- `VAPID_EMAIL` deve ser um email válido no formato `mailto:email@exemplo.com`

## 📦 Passo 3: Instalar Dependências

Instale a biblioteca `web-push`:

```bash
npm install web-push
```

## 🗄️ Passo 4: Aplicar Migration

Aplique a migration do banco de dados:

```bash
# Se usando Supabase CLI
supabase migration up

# Ou execute manualmente o arquivo:
# supabase/migrations/20250118000001_add_notification_system.sql
```

## 🚀 Passo 5: Configurar Cron Job (Opcional mas Recomendado)

Para enviar notificações automaticamente, configure um cron job que chame o endpoint `/api/notifications/process` diariamente.

### Opção 1: Vercel Cron Jobs

Se estiver usando Vercel, adicione ao `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/notifications/process",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Opção 2: Serviço Externo (cron-job.org, EasyCron, etc.)

Configure para chamar:
```
POST https://seu-dominio.com/api/notifications/process
Headers:
  Authorization: Bearer seu-cron-secret-aqui
```

### Opção 3: Teste Manual

Você pode testar manualmente chamando:
```
GET http://localhost:3000/api/notifications/process
```

## ✅ Passo 6: Verificar Funcionamento

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse a página Financeiro (`/financial`)

3. Clique em "Ativar Notificações"

4. Permita notificações quando o navegador solicitar

5. Crie uma transação recorrente ou agendada

6. As notificações serão enviadas:
   - 3 dias antes da data agendada
   - 1 dia antes da data agendada
   - No dia da transação

## 🔍 Como Funciona

### Transações Recorrentes

Quando você cria uma transação recorrente:
- Ela é marcada com `is_recurring: true`
- O intervalo é salvo (`weekly`, `monthly`, `quarterly`)
- A data de término é salva (se houver)

### Transações Agendadas

Quando você cria uma transação agendada:
- Ela tem `scheduled_date` definida
- `is_paid: false` até a data chegar

### Sistema de Notificações

1. **Verificação Diária**: O sistema verifica todas as transações recorrentes e agendadas
2. **Cálculo de Datas**: Calcula quais transações precisam de notificação (3 dias antes, 1 dia antes, hoje)
3. **Prevenção de Duplicatas**: Usa a tabela `notification_logs` para evitar enviar a mesma notificação duas vezes
4. **Envio**: Envia notificação push para todos os dispositivos do usuário que têm subscriptions ativas

## 🐛 Troubleshooting

### Notificações não aparecem

1. Verifique se o Service Worker está registrado:
   - Abra DevTools > Application > Service Workers
   - Deve ver `/sw.js` registrado

2. Verifique as VAPID keys:
   - Certifique-se de que estão corretas no `.env.local`
   - Reinicie o servidor após adicionar as keys

3. Verifique permissões:
   - O usuário deve ter permitido notificações
   - Verifique em Configurações do Navegador > Notificações

### Erro "Subscription expired"

- Isso é normal quando o usuário limpa dados do navegador
- O sistema remove automaticamente subscriptions inválidas
- O usuário precisa reativar as notificações

### Notificações não são enviadas automaticamente

- Verifique se o cron job está configurado
- Verifique os logs do servidor para erros
- Teste manualmente chamando o endpoint

## 📱 Suporte Mobile

O sistema funciona em dispositivos móveis que suportam:
- Service Workers
- Push API
- Notificações do navegador

**Navegadores Suportados:**
- Chrome/Edge (Android, iOS)
- Firefox (Android)
- Safari (iOS 16.4+)

## 🔐 Segurança

- As VAPID keys são usadas para autenticar o servidor
- O endpoint de processamento pode ser protegido com `CRON_SECRET`
- As subscriptions são armazenadas de forma segura no banco
- Cada usuário só recebe notificações de suas próprias transações

## 📚 Recursos Adicionais

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)



