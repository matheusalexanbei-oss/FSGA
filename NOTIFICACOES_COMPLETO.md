# 🔔 Sistema de Notificações Completo - Documentação

## 📋 Visão Geral

O sistema de notificações agora possui **duas formas de funcionamento**:

1. **Push Notifications** - Quando o usuário NÃO está na aplicação (navegador fechado)
2. **Notificações em Tempo Real** - Quando o usuário ESTÁ na aplicação (pop-ups toast)

## 🎯 Como Funciona

### 1. Push Notifications (Navegador Fechado)

- **Service Worker** (`/public/sw.js`) recebe notificações push do servidor
- Funciona mesmo quando o navegador está fechado
- Requer permissão do usuário e VAPID keys configuradas
- Enviadas pelo endpoint `/api/notifications/process` (via cron job)

### 2. Notificações em Tempo Real (Usuário na Aplicação)

- **Hook `useRealtimeNotifications`** verifica notificações pendentes a cada 2 minutos
- Exibe **toast notifications** usando Sonner quando há transações agendadas
- Verifica também quando a página ganha foco (usuário volta para a aba)
- Não requer permissão do navegador (funciona sempre)

## 🚀 Configuração

### Passo 1: VAPID Keys (Para Push Notifications)

```bash
# Instalar web-push globalmente
npm install -g web-push

# Gerar VAPID keys
web-push generate-vapid-keys
```

Adicione ao `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua-chave-publica-aqui
VAPID_PRIVATE_KEY=sua-chave-privada-aqui
VAPID_EMAIL=mailto:seu-email@exemplo.com
CRON_SECRET=seu-secret-aleatorio-aqui
```

### Passo 2: Service Worker

O Service Worker já está configurado em `/public/sw.js`. Ele será registrado automaticamente quando o usuário ativar as notificações.

### Passo 3: Cron Job (Opcional mas Recomendado)

Para enviar push notifications automaticamente, configure um cron job:

**Vercel (`vercel.json`):**
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

**Serviço Externo:**
```
POST https://seu-dominio.com/api/notifications/process
Headers:
  Authorization: Bearer seu-cron-secret-aqui
```

## 📱 Funcionalidades

### Notificações em Tempo Real

- ✅ Verifica automaticamente a cada 2 minutos
- ✅ Verifica quando a página ganha foco
- ✅ Exibe toast notifications elegantes
- ✅ Marca notificações como enviadas automaticamente
- ✅ Evita duplicatas usando IDs únicos

### Push Notifications

- ✅ Funciona mesmo com navegador fechado
- ✅ Suporta múltiplos dispositivos
- ✅ Remove subscriptions inválidas automaticamente
- ✅ Logs de notificações enviadas

## 🔍 Endpoints da API

### GET `/api/notifications/check`
Verifica notificações que devem ser exibidas AGORA (para tempo real)

**Resposta:**
```json
{
  "notifications": [
    {
      "transaction_id": "uuid",
      "type": "income" | "expense",
      "description": "Descrição",
      "amount": 100.00,
      "scheduled_date": "2025-01-20",
      "days_until": 0,
      "notification_type": "scheduled_day"
    }
  ]
}
``` 

### POST `/api/notifications/mark-sent`
Marca uma notificação como enviada

**Body:**
```json
{
  "transaction_id": "uuid",
  "notification_type": "scheduled_day",
  "scheduled_date": "2025-01-20"
}
```

### GET `/api/notifications/upcoming`
Lista próximas notificações (para o componente de notificações)

### POST `/api/notifications/process`
Processa e envia push notifications (chamado por cron job)

## 🎨 Componentes

### `useRealtimeNotifications`
Hook que verifica e exibe notificações em tempo real.

**Uso:**
```tsx
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

function MyComponent() {
  useRealtimeNotifications() // Ativa automaticamente
  // ...
}
```

### `NotificationButton`
Componente no header que mostra status das notificações e lista próximas.

## 📊 Quando as Notificações São Enviadas

As notificações são enviadas em **3 momentos**:

1. **3 dias antes** da data agendada
2. **1 dia antes** da data agendada  
3. **No dia** da transação

## 🐛 Troubleshooting

### Notificações em tempo real não aparecem

1. Verifique se o hook está sendo chamado no layout:
   ```tsx
   useRealtimeNotifications()
   ```

2. Verifique o console do navegador para erros

3. Verifique se há transações com `scheduled_date` nas datas corretas

4. Verifique se `is_paid` está como `false` ou `null`

### Push notifications não funcionam

1. Verifique se as VAPID keys estão configuradas no `.env.local`
2. Verifique se o usuário permitiu notificações no navegador
3. Verifique se o Service Worker está registrado (DevTools > Application > Service Workers)
4. Verifique se o cron job está configurado e rodando

### Notificações duplicadas

- O sistema previne duplicatas usando `notification_logs`
- Cada notificação só é enviada uma vez por dia
- O hook em tempo real também previne duplicatas usando um Set de IDs

## ✅ Checklist de Implementação

- [x] Service Worker configurado (`/public/sw.js`)
- [x] Hook de notificações em tempo real (`useRealtimeNotifications`)
- [x] API para verificar notificações (`/api/notifications/check`)
- [x] API para marcar como enviada (`/api/notifications/mark-sent`)
- [x] Integração no layout do dashboard
- [x] Toast notifications usando Sonner
- [x] Prevenção de duplicatas
- [x] Verificação quando página ganha foco

## 🎉 Pronto!

O sistema está completo e funcionando. As notificações aparecerão automaticamente quando:
- O usuário está na aplicação (toast notifications)
- O usuário não está na aplicação (push notifications, se configurado)

