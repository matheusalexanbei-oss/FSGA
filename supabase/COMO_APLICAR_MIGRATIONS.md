# 📋 Como Aplicar Migrations no Supabase

## ✅ Migration Aplicada com Sucesso!

A migration `fix_supabase_advisors` foi aplicada via Supabase MCP. Os warnings de **"Function Search Path Mutable"** foram resolvidos! 🎉

---

## 🚀 Métodos para Aplicar Migrations

### **Método 1: Supabase MCP (Mais Rápido - Usado Agora)**

Se você tem o Supabase MCP configurado no Cursor, pode aplicar migrations diretamente:

```bash
# A migration já foi aplicada via MCP
# Não é necessário fazer nada no terminal
```

**Vantagens:**
- ✅ Mais rápido
- ✅ Não precisa configurar nada
- ✅ Aplicação direta no banco

---

### **Método 2: SQL Editor do Dashboard (Recomendado para Iniciantes)**

Se preferir aplicar manualmente via interface:

#### Passo 1: Acessar o SQL Editor
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"** (ícone `</>`)

#### Passo 2: Executar a Migration
1. Clique em **"New Query"**
2. Abra o arquivo: `supabase/migrations/202511120001_fix_supabase_advisors.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole no SQL Editor** do Supabase
5. Clique em **"Run"** (ou pressione `Ctrl + Enter`)

✅ Você deve ver: "Success. No rows returned"

#### Passo 3: Verificar
1. No menu lateral, clique em **"Advisors"** → **"Security Advisor"**
2. Os warnings de **"Function Search Path Mutable"** devem ter desaparecido!

---

### **Método 3: Supabase CLI (Avançado - Requer Configuração)**

Se você tem o Supabase CLI instalado:

#### Passo 1: Instalar Supabase CLI
```bash
# Windows (PowerShell)
npm install -g supabase

# Verificar instalação
supabase --version
```

#### Passo 2: Fazer Login
```bash
supabase login
```

#### Passo 3: Linkar ao Projeto
```bash
# Obter o Project Ref no Dashboard
# Settings → General → Reference ID
supabase link --project-ref seu-project-ref-aqui
```

#### Passo 4: Aplicar Migration
```bash
# Aplicar todas as migrations pendentes
supabase db push

# OU aplicar uma migration específica
supabase migration up --file 202511120001_fix_supabase_advisors.sql
```

**Vantagens:**
- ✅ Versionamento de migrations
- ✅ Controle de versão
- ✅ Fácil rollback

**Desvantagens:**
- ❌ Requer configuração inicial
- ❌ Mais complexo para iniciantes

---

## ⚙️ Configurações Manuais Necessárias

Após aplicar a migration, ainda há **2 warnings** que precisam ser configurados manualmente no Dashboard:

### **1. Leaked Password Protection (Proteção contra Senhas Vazadas)**

#### Como Ativar:
1. Acesse **"Authentication"** → **"Policies"** no menu lateral
2. Ou acesse: `https://supabase.com/dashboard/project/[seu-project]/auth/policies`
3. Procure por **"Password Security"** ou **"Leaked Password Protection"**
4. Ative a opção **"Enable leaked password protection"**
5. Clique em **"Save"**

**O que faz:**
- Verifica se a senha do usuário está na base de dados do HaveIBeenPwned.org
- Previne o uso de senhas comprometidas
- Melhora a segurança do sistema

**Link de Referência:**
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

### **2. Insufficient MFA Options (Opções de MFA Insuficientes)**

#### ⚠️ IMPORTANTE: O TOTP não está em "Providers"!

O TOTP está na seção **"Multi-Factor"**, não em "Providers"!

#### Como Ativar TOTP (Método Principal):
1. Acesse **"Authentication"** → **"Multi-Factor"** no menu lateral
   - ⚠️ **NÃO** é "Providers" - é "Multi-Factor"!
2. Ou acesse: `https://supabase.com/dashboard/project/[seu-project]/auth/mfa`
3. Procure por **"TOTP"** ou **"Time-based One-Time Password"**
4. Ative a opção **"Enable TOTP"** ou **"Allow TOTP"**
5. Clique em **"Save"**

**O que faz:**
- Adiciona uma camada extra de segurança
- Requer autenticação adicional além da senha (código de 6 dígitos)
- Usuários precisam usar app autenticador (Google Authenticator, Authy, etc.)
- Protege contra acessos não autorizados

**Apps Autenticadores Compatíveis:**
- ✅ Google Authenticator
- ✅ Authy
- ✅ 1Password
- ✅ Microsoft Authenticator
- ✅ Qualquer app compatível com TOTP

#### Como Configurar Phone (Opcional):

Para configurar Phone como método de login ou MFA, consulte o guia completo:
👉 **Ver:** `supabase/CONFIGURAR_MFA_E_PHONE.md`

**Resumo Rápido:**
- **Phone como Provider** (login principal): Requer Twilio/MessageBird
- **Phone como MFA** (segundo fator): Pode não estar disponível ainda
- **TOTP** (recomendado): Gratuito e não requer configuração externa

**Link de Referência:**
https://supabase.com/docs/guides/auth/auth-mfa

---

## ✅ Checklist de Verificação

Após aplicar a migration e configurar manualmente:

- [x] Migration `fix_supabase_advisors` aplicada
- [x] Warnings de "Function Search Path Mutable" resolvidos (5 funções)
- [ ] Leaked Password Protection ativado manualmente
- [ ] MFA Options configuradas manualmente
- [ ] Constraint de `notification_logs` atualizada (inclui `*_overdue`)
- [ ] Todas as funções têm `search_path = public` definido

---

## 🧪 Verificar se Funcionou

### 1. Verificar Functions no SQL Editor

Execute este SQL no SQL Editor:

```sql
-- Verificar search_path das functions
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'update_user_cash_balance',
    'update_push_subscriptions_updated_at',
    'check_ai_usage_limit',
    'increment_ai_usage',
    'get_user_ai_limits'
);
```

As functions devem ter `SET search_path = public` na definição.

### 2. Verificar Constraint de notification_logs

Execute este SQL:

```sql
-- Verificar constraint de notification_logs
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.notification_logs'::regclass
AND conname = 'notification_logs_notification_type_check';
```

A constraint deve incluir `recurring_overdue` e `scheduled_overdue`.

### 3. Verificar Security Advisor

1. Acesse **"Advisors"** → **"Security Advisor"** no Dashboard
2. Os warnings de **"Function Search Path Mutable"** devem ter desaparecido
3. Apenas os warnings de **"Leaked Password Protection"** e **"Insufficient MFA Options"** devem aparecer (e esses são configurações manuais)

---

## 🎉 Pronto!

Após aplicar a migration e configurar manualmente:

✅ **5 warnings resolvidos** (Function Search Path Mutable)  
✅ **Constraint atualizada** (notification_logs agora aceita notificações vencidas)  
⚠️ **2 configurações manuais pendentes** (Leaked Password Protection e MFA Options)

---

## 📚 Referências

- [Supabase Security Advisor](https://supabase.com/docs/guides/database/extensions/splinter)
- [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security)
- [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

---

**Dúvidas?** Consulte a documentação do Supabase ou peça ajuda! 🚀

