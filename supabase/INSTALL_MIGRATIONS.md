# 🗄️ Guia de Instalação das Migrations do Database

## 📋 Como Executar as Migrations no Supabase

Siga este guia passo a passo para criar todas as tabelas no seu banco de dados Supabase.

---

## 🚀 Método 1: SQL Editor (Recomendado - Mais Fácil)

### Passo 1: Acessar o SQL Editor

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. No menu lateral esquerdo, clique em **SQL Editor** (ícone de `</>`)

### Passo 2: Executar Migration 1 - Schema Inicial

1. Clique em **"New Query"**
2. Abra o arquivo `supabase/migrations/20250116000001_initial_schema.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole no SQL Editor** do Supabase
5. Clique em **"Run"** (ou pressione `Ctrl + Enter`)

✅ Você deve ver mensagens de sucesso:
```
✅ Initial schema created successfully!
   - users_profile table created
   - categories table created
   - products table created
   - financial_transactions table created
```

### Passo 3: Executar Migration 2 - RLS Policies

1. Clique em **"New Query"** novamente
2. Abra o arquivo `supabase/migrations/20250116000002_rls_policies.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole no SQL Editor** do Supabase
5. Clique em **"Run"**

✅ Você deve ver mensagens de sucesso:
```
✅ RLS policies created successfully!
   - All tables have RLS enabled
   - Users can only access their own data
```

### Passo 4: Verificar Tabelas Criadas

1. No menu lateral, clique em **Table Editor** (ícone de tabela)
2. Você deve ver 4 novas tabelas:
   - ✅ `users_profile`
   - ✅ `categories`
   - ✅ `products`
   - ✅ `financial_transactions`

---

## 🔧 Método 2: Supabase CLI (Avançado)

Se preferir usar a linha de comando:

### Instalação do Supabase CLI

```bash
npm install -g supabase
```

### Executar Migrations

```bash
# Fazer login no Supabase
supabase login

# Linkar com seu projeto
supabase link --project-ref seu-project-ref

# Executar migrations
supabase db push
```

---

## 🧪 Testar se Funcionou

### 1. Verificar no Table Editor

Acesse **Table Editor** e você deve ver as 4 tabelas.

### 2. Testar com SQL

No SQL Editor, execute:

```sql
-- Ver estrutura das tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('users_profile', 'categories', 'products', 'financial_transactions');
```

Deve retornar 4 linhas com os nomes das tabelas.

### 3. Testar RLS

Execute este SQL:

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users_profile', 'categories', 'products', 'financial_transactions');
```

A coluna `rowsecurity` deve ser `true` para todas as tabelas.

### 4. Testar na Aplicação

1. Acesse http://localhost:3001/dashboard
2. O erro **"Error loading profile"** deve ter sumido! ✅
3. A aplicação agora consegue carregar o perfil do usuário

---

## 📊 Estrutura das Tabelas Criadas

### users_profile
```sql
- id (UUID) → Referência ao auth.users
- business_name (TEXT)
- business_type (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### categories
```sql
- id (UUID)
- user_id (UUID) → Referência ao auth.users
- name (TEXT)
- description (TEXT)
- created_at (TIMESTAMP)
```

### products
```sql
- id (UUID)
- user_id (UUID) → Referência ao auth.users
- category_id (UUID) → Referência a categories
- name (TEXT)
- description (TEXT)
- code (TEXT)
- price (DECIMAL)
- cost (DECIMAL)
- stock_quantity (INTEGER)
- image_url (TEXT)
- ai_processed (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### financial_transactions
```sql
- id (UUID)
- user_id (UUID) → Referência ao auth.users
- type (ENUM: 'income' | 'expense')
- amount (DECIMAL)
- description (TEXT)
- category (TEXT)
- date (DATE)
- created_at (TIMESTAMP)
```

---

## 🔒 Segurança - RLS Configurado

Todas as tabelas têm **Row Level Security (RLS)** habilitado com as seguintes políticas:

✅ Usuários podem **ver** apenas seus próprios dados  
✅ Usuários podem **criar** apenas seus próprios dados  
✅ Usuários podem **atualizar** apenas seus próprios dados  
✅ Usuários podem **deletar** apenas seus próprios dados  

Isso garante que:
- User A **NÃO** pode ver produtos do User B
- User A **NÃO** pode editar categorias do User B
- Cada usuário tem seus dados isolados e protegidos

---

## ⚡ Triggers Automáticos

### Auto-Create Profile
Quando um novo usuário se registra, um perfil vazio é criado automaticamente na tabela `users_profile`.

### Auto-Update Timestamps
Sempre que um registro é atualizado, o campo `updated_at` é atualizado automaticamente.

---

## 🆘 Problemas Comuns

### Erro: "relation already exists"

**Solução**: As tabelas já foram criadas. Você pode:
1. Ignorar o erro (tudo ok!)
2. Ou deletar as tabelas e rodar novamente

Para deletar todas as tabelas:
```sql
DROP TABLE IF EXISTS public.financial_transactions CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users_profile CASCADE;
DROP TYPE IF EXISTS transaction_type;
```

Depois execute as migrations novamente.

### Erro: "permission denied"

**Solução**: Certifique-se de estar usando o **service_role key** ou executando as migrations no SQL Editor do Dashboard (que já tem permissões).

### Tabelas não aparecem no Table Editor

**Solução**: 
1. Recarregue a página (F5)
2. Verifique se está vendo o schema `public`
3. Execute o SQL de teste para confirmar que as tabelas existem

---

## ✅ Checklist de Conclusão

Antes de continuar, confirme que:

- [x] Migration 1 executada com sucesso
- [x] Migration 2 executada com sucesso
- [x] 4 tabelas aparecem no Table Editor
- [x] RLS está habilitado (verificado com SQL)
- [x] Erro "Error loading profile" sumiu da aplicação
- [x] Dashboard carrega sem erros

---

## 🎉 Próximo Passo

Com o database configurado, estamos prontos para a **Fase 4: Layout e Navegação**!

Vamos criar:
- 🎨 Sidebar com menu
- 📱 Header com perfil do usuário
- 🔍 Navegação entre páginas
- 📱 Design responsivo

---

**Boa sorte! Se tiver problemas, consulte a seção de troubleshooting ou peça ajuda!** 🚀



