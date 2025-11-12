# 🚀 Como Aplicar a Migration de Tarefas

## ⚠️ Erro: Tabela `tasks` não encontrada

Se você está vendo o erro "Erro ao carregar tarefas", significa que a tabela `tasks` ainda não foi criada no Supabase.

## 📋 Passo a Passo para Resolver

### Método 1: SQL Editor (Recomendado - Mais Fácil)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor** (ícone `</>`)
   - Clique em **"New Query"**

3. **Execute a Migration**
   - Abra o arquivo: `supabase/migrations/20250119000001_add_tasks_table.sql`
   - **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
   - Cole no SQL Editor
   - Clique em **"Run"** (ou pressione Ctrl+Enter)

4. **Verifique se Funcionou**
   - Você deve ver a mensagem: `✅ Tasks table created successfully!`
   - Vá em **Table Editor** e verifique se a tabela `tasks` aparece

5. **Recarregue a Página da Agenda**
   - Volte para a aplicação
   - Recarregue a página `/agenda`
   - O erro deve ter sumido! ✅

---

### Método 2: Via CLI (Avançado)

Se você tem o Supabase CLI instalado:

```bash
# Navegar até a pasta do projeto
cd "C:\Users\Matheus\Desktop\Fullstack Gestor AI\fullstackgestorai"

# Fazer login no Supabase
supabase login

# Linkar com seu projeto (substitua pelo seu project-ref)
supabase link --project-ref seu-project-ref

# Aplicar a migration
supabase db push
```

---

## ✅ Verificação

Após executar a migration, você pode verificar se funcionou executando este SQL no SQL Editor:

```sql
-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name = 'tasks';

-- Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks'
AND table_schema = 'public';

-- Verificar RLS policies
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'tasks';
```

---

## 🆘 Problemas Comuns

### Erro: "relation already exists"
**Solução**: A tabela já existe! Isso é bom. Você pode ignorar o erro ou pular a criação da tabela.

### Erro: "permission denied"
**Solução**: Certifique-se de estar executando no SQL Editor do Dashboard (que tem permissões completas).

### Tabela não aparece no Table Editor
**Solução**: 
1. Recarregue a página (F5)
2. Verifique se está vendo o schema `public`
3. Execute o SQL de verificação acima

---

## 📝 Estrutura da Tabela Criada

A migration cria a tabela `tasks` com os seguintes campos:

- `id` (UUID) - Chave primária
- `user_id` (UUID) - Referência ao usuário
- `title` (TEXT) - Título da tarefa
- `description` (TEXT) - Descrição opcional
- `due_date` (DATE) - Data de vencimento
- `due_time` (TIME) - Hora de vencimento
- `is_completed` (BOOLEAN) - Status de conclusão
- `completed_at` (TIMESTAMP) - Data de conclusão
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

---

## 🔒 Segurança

A tabela tem **Row Level Security (RLS)** habilitado, garantindo que:
- ✅ Cada usuário vê apenas suas próprias tarefas
- ✅ Cada usuário pode criar apenas suas próprias tarefas
- ✅ Cada usuário pode editar apenas suas próprias tarefas
- ✅ Cada usuário pode excluir apenas suas próprias tarefas

---

## ✨ Após Aplicar a Migration

Depois de aplicar a migration com sucesso:
1. Recarregue a página `/agenda`
2. O erro deve desaparecer
3. Você poderá criar tarefas normalmente
4. O BOT IA também poderá criar tarefas via comandos de voz


