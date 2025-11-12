# 📝 Instruções de Configuração - Fullstack Gestor

## Passo a Passo para Começar

Este guia vai te ajudar a configurar todo o ambiente necessário para rodar o Fullstack Gestor.

---

## 1️⃣ Instalar Dependências

Abra o terminal na pasta `fullstackgestorai` e execute:

```bash
npm install
```

### Dependências Principais que Serão Instaladas:

#### Core
- `next` - Framework React
- `react` & `react-dom` - Biblioteca React
- `typescript` - Suporte a TypeScript

#### Supabase
- `@supabase/supabase-js` - Cliente Supabase
- `@supabase/ssr` - SSR para Supabase

#### UI e Estilo
- `tailwindcss` - Framework CSS
- `tailwindcss-animate` - Animações
- `lucide-react` - Ícones
- `clsx` & `tailwind-merge` - Utilitários CSS

#### Formulários e Validação
- `react-hook-form` - Gerenciamento de formulários
- `zod` - Validação de schemas
- `@hookform/resolvers` - Resolvers para validação

#### Utilitários
- `date-fns` - Manipulação de datas
- `zustand` - State management
- `sonner` - Toast notifications
- `recharts` - Gráficos

---

## 2️⃣ Instalar ShadCN UI

O ShadCN UI precisa ser inicializado. Execute:

```bash
npx shadcn@latest init
```

### Durante a inicialização, escolha:
- **Style**: `Default` ou `New York` (sua preferência)
- **Base color**: `Slate` (recomendado) ou `Neutral`
- **CSS variables**: `Yes` ✅

### Instalar Componentes Base

Após a inicialização, instale os componentes essenciais:

```bash
# Componentes básicos
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add label
npx shadcn@latest add form

# Componentes de navegação
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs

# Componentes de dados
npx shadcn@latest add table
npx shadcn@latest add select
npx shadcn@latest add checkbox

# Feedback
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add badge
npx shadcn@latest add avatar

# Utilitários
npx shadcn@latest add separator
```

> **Dica**: Você pode instalar mais componentes depois, conforme necessário. Veja a lista completa em [ui.shadcn.com](https://ui.shadcn.com)

---

## 3️⃣ Configurar Supabase

### 3.1. Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"** e faça login (ou crie uma conta)
3. Clique em **"New Project"**

### 3.2. Configurar o Projeto

Preencha os dados:
- **Name**: `fullstack-gestor` (ou nome de sua preferência)
- **Database Password**: Crie uma senha forte e **SALVE EM LOCAL SEGURO**
- **Region**: `South America (São Paulo)` - para melhor latência no Brasil
- **Pricing Plan**: `Free` (suficiente para desenvolvimento)

Clique em **"Create new project"** e aguarde 2-3 minutos.

### 3.3. Obter as Chaves de API

1. Após criação, você será redirecionado ao Dashboard
2. No menu lateral, vá em: **Settings** → **API**
3. Copie as seguintes informações:

   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** (chave pública - pode ser exposta no frontend)
   - **service_role** (chave privada - NUNCA exponha no frontend!)

### 3.4. Configurar Autenticação

1. No menu lateral, vá em: **Authentication** → **Providers**

#### Email Authentication (já vem habilitado)
- ✅ Já está ativo por padrão
- Configure o **Site URL**: `http://localhost:3000` (desenvolvimento)
- Configure **Redirect URLs**: `http://localhost:3000/**` (permite todos os caminhos)

#### Google OAuth (Recomendado)

1. **Habilite o Provider Google** no Supabase
2. **Crie credenciais no Google Cloud Console**:
   - Acesse [console.cloud.google.com](https://console.cloud.google.com)
   - Crie um novo projeto ou selecione um existente
   - Vá em **APIs & Services** → **Credentials**
   - Clique em **Create Credentials** → **OAuth client ID**
   - Tipo: **Web application**
   - **Authorized redirect URIs**: 
     - Copie a URL de callback do Supabase (mostrada na tela)
     - Será algo como: `https://xxxxx.supabase.co/auth/v1/callback`
   - Clique em **Create**
   - Copie o **Client ID** e **Client Secret**

3. **Configure no Supabase**:
   - Cole o **Client ID** e **Client Secret** no provider Google
   - Salve as alterações

#### GitHub OAuth (Opcional)

1. **Habilite o Provider GitHub** no Supabase
2. **Crie um GitHub OAuth App**:
   - Acesse [github.com/settings/developers](https://github.com/settings/developers)
   - Clique em **New OAuth App**
   - **Application name**: `Fullstack Gestor Dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: 
     - Copie do Supabase (será algo como `https://xxxxx.supabase.co/auth/v1/callback`)
   - Clique em **Register application**
   - Copie o **Client ID**
   - Clique em **Generate a new client secret** e copie

3. **Configure no Supabase**:
   - Cole o **Client ID** e **Client Secret** no provider GitHub
   - Salve as alterações

### 3.5. Configurar Email Templates (Opcional mas Recomendado)

1. Vá em **Authentication** → **Email Templates**
2. Personalize os templates:
   - **Confirm signup**: Email de confirmação
   - **Magic Link**: Login sem senha
   - **Change Email Address**: Confirmação de mudança de email
   - **Reset Password**: Recuperação de senha

Você pode personalizar com a marca do seu negócio!

---

## 4️⃣ Configurar Variáveis de Ambiente

### 4.1. Criar o arquivo `.env.local`

Na raiz do projeto `fullstackgestorai`, crie um arquivo chamado `.env.local`:

```bash
# No terminal (PowerShell)
New-Item -Path .env.local -ItemType File
```

Ou crie manualmente pelo editor.

### 4.2. Adicionar as Variáveis

Abra o arquivo `.env.local` e adicione:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Fullstack Gestor"

# OpenAI (será usado na Fase 6 - deixe comentado por enquanto)
# OPENAI_API_KEY=sk-...
```

**Substitua**:
- `https://seu-projeto.supabase.co` → URL do seu projeto Supabase
- `sua-chave-anon-aqui` → Anon key copiada do Supabase
- `sua-service-role-key-aqui` → Service role key copiada do Supabase

> ⚠️ **IMPORTANTE**: O arquivo `.env.local` já está no `.gitignore` e NÃO será commitado. Nunca compartilhe suas chaves!

---

## 5️⃣ Testar a Instalação

### 5.1. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Você deve ver algo como:
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.5s
```

### 5.2. Acessar no Navegador

Abra [http://localhost:3000](http://localhost:3000)

Se tudo estiver correto, você verá a página inicial do Next.js.

### 5.3. Testar Conexão com Supabase

Crie um arquivo de teste `src/app/test-supabase/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()
        
        setStatus('success')
        setMessage('Conexão com Supabase estabelecida! ✅')
      } catch (err) {
        setStatus('error')
        setMessage(`Erro ao conectar: ${err}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-2xl font-bold">Teste de Conexão Supabase</h1>
        
        {status === 'loading' && (
          <p className="text-muted-foreground">Testando conexão...</p>
        )}
        
        {status === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

Acesse [http://localhost:3000/test-supabase](http://localhost:3000/test-supabase)

Se ver a mensagem de sucesso, está tudo configurado! ✅

---

## 6️⃣ Próximos Passos

Com tudo configurado, você está pronto para:

1. ✅ **Fase 1 Completa**: Ambiente configurado
2. 🔐 **Começar Fase 2**: Implementar autenticação
3. 🗄️ **Fase 3**: Criar schema do banco de dados

Consulte o [ROADMAP.md](./ROADMAP.md) para continuar!

---

## 🆘 Problemas Comuns

### Erro: "Module not found: Can't resolve '@supabase/ssr'"

**Solução**:
```bash
npm install @supabase/ssr
```

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Possíveis causas**:
1. Arquivo `.env.local` não existe ou está no lugar errado
2. Variáveis não estão com os nomes corretos
3. Servidor não foi reiniciado após criar `.env.local`

**Solução**:
1. Verifique se `.env.local` está na raiz do projeto
2. Confirme os nomes das variáveis (devem estar exatos)
3. Reinicie o servidor: Ctrl+C e depois `npm run dev`

### Erro: "Failed to fetch" ao conectar com Supabase

**Possíveis causas**:
1. URL do Supabase incorreta
2. Chaves de API incorretas
3. Projeto Supabase pausado (plano free fica inativo após 1 semana sem uso)

**Solução**:
1. Verifique URL e chaves no Dashboard do Supabase
2. Confirme que o projeto está ativo (vá ao Dashboard)
3. Se pausado, clique em "Restore" no Supabase

### Erro: "Cannot find module 'lucide-react'"

**Solução**:
```bash
npm install lucide-react
```

### Tailwind não está aplicando estilos

**Solução**:
1. Verifique se `tailwind.config.ts` existe
2. Verifique se `globals.css` tem os imports do Tailwind
3. Reinicie o servidor
4. Limpe o cache: `rm -rf .next && npm run dev`

### ShadCN componentes não funcionam

**Solução**:
```bash
# Reinstale o ShadCN
npx shadcn@latest init

# Reinstale os componentes
npx shadcn@latest add button
npx shadcn@latest add card
# ... outros componentes
```

---

## 📚 Recursos Úteis

- 📖 [Documentação Next.js](https://nextjs.org/docs)
- 📖 [Documentação Supabase](https://supabase.com/docs)
- 📖 [Guia ShadCN UI](https://ui.shadcn.com)
- 📖 [Tailwind CSS Docs](https://tailwindcss.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com/)
- 💬 [Next.js Discord](https://discord.gg/nextjs)

---

**Configuração completa! Hora de desenvolver! 🚀**



