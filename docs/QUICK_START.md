# 🚀 Guia de Início Rápido - Fullstack Gestor

## Começando o Desenvolvimento - Fase 1

Este guia irá ajudá-lo a configurar o ambiente de desenvolvimento e iniciar a construção do Fullstack Gestor.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- ✅ **npm** ou **yarn** ou **pnpm**
- ✅ **Git**
- ✅ **VS Code** (recomendado) com extensões:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript

---

## 📋 Passo 1: Verificar Instalação Atual

Primeiro, vamos verificar o que já está configurado:

```bash
# Navegue até o diretório do projeto
cd "C:\Users\Matheus\Desktop\Fullstack Gestor AI\fullstackgestorai"

# Verifique as dependências instaladas
npm list --depth=0
```

---

## 🎨 Passo 2: Instalar ShadCN UI

O ShadCN UI é nossa biblioteca de componentes. Vamos configurá-lo:

```bash
# Inicializar ShadCN
npx shadcn@latest init

# Durante a instalação, escolha:
# - Style: New York ou Default (sua preferência)
# - Base color: Slate ou Neutral
# - CSS variables: Yes
```

Agora instale os componentes base que usaremos:

```bash
# Componentes essenciais
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add toast
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add checkbox
npx shadcn@latest add skeleton
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add separator
```

---

## 🗄️ Passo 3: Configurar Supabase

### 3.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: fullstack-gestor
   - **Database Password**: (escolha uma senha forte e salve!)
   - **Region**: South America (São Paulo) - para melhor latência
5. Aguarde a criação (2-3 minutos)

### 3.2. Obter as Chaves de API

1. No painel do projeto, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (URL)
   - **anon public** (Anon Key)
   - **service_role** (Service Role Key - não exponha!)

### 3.3. Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Configure:
   - **Email**: Habilite (já vem habilitado)
   - **Google OAuth**: 
     - Habilite
     - Siga o guia para criar credenciais no Google Cloud Console
   - **GitHub OAuth** (opcional):
     - Habilite
     - Crie OAuth App no GitHub

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# No diretório fullstackgestorai/
touch .env.local
```

Adicione o seguinte conteúdo (substitua com suas chaves):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# OpenAI (vamos configurar depois na Fase 6)
# OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Fullstack Gestor"
```

Crie também um `.env.example` para documentar:

```bash
# No diretório fullstackgestorai/
touch .env.example
```

Conteúdo do `.env.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Fullstack Gestor"
```

**IMPORTANTE**: Adicione `.env.local` ao `.gitignore`!

```bash
# Verifique se já está no .gitignore
cat .gitignore | grep .env.local

# Se não estiver, adicione:
echo ".env.local" >> .gitignore
```

---

## 📦 Passo 5: Instalar Dependências Adicionais

Instale as bibliotecas que usaremos:

```bash
# Cliente do Supabase
npm install @supabase/supabase-js @supabase/ssr

# Gerenciamento de formulários e validação
npm install react-hook-form zod @hookform/resolvers

# Utilitários
npm install date-fns clsx tailwind-merge

# Icons
npm install lucide-react

# State management (opcional, mas recomendado)
npm install zustand

# Charts (para o dashboard - Fase 7)
npm install recharts

# Toast notifications
npm install sonner
```

---

## 🏗️ Passo 6: Criar Estrutura de Pastas

Execute os seguintes comandos para criar a estrutura base:

```bash
# Bibliotecas e utilitários
mkdir -p src/lib/supabase
mkdir -p src/lib/utils
mkdir -p src/lib/ai
mkdir -p src/lib/pdf
mkdir -p src/lib/shopify

# Hooks customizados
mkdir -p src/hooks

# Tipos TypeScript
mkdir -p src/types

# Componentes
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/auth
mkdir -p src/components/products
mkdir -p src/components/dashboard
mkdir -p src/components/financial
mkdir -p src/components/chat
mkdir -p src/components/exports
mkdir -p src/components/onboarding
mkdir -p src/components/shared

# Configurações
mkdir -p src/config

# Store (state management)
mkdir -p src/store

# Supabase
mkdir -p supabase/functions
mkdir -p supabase/migrations
```

---

## 🎨 Passo 7: Configurar Tailwind CSS

Atualize o arquivo `tailwind.config.ts` com o tema personalizado:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 🔧 Passo 8: Criar Arquivos Utilitários Base

### 8.1. Utilitário cn (classNames)

Crie `src/lib/utils/cn.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 8.2. Cliente Supabase

Crie `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Crie `src/lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component での set は無視
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component での remove は無視
          }
        },
      },
    }
  )
}
```

### 8.3. Configuração do Site

Crie `src/config/site.ts`:

```typescript
export const siteConfig = {
  name: "Fullstack Gestor",
  description: "Sistema ERP com catalogação de produtos assistida por IA",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "https://github.com/seu-usuario/fullstack-gestor",
  },
}
```

---

## 🎯 Passo 9: Testar o Setup

Agora vamos testar se tudo está funcionando:

```bash
# Limpar cache e reinstalar (se necessário)
rm -rf .next
rm -rf node_modules
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

Abra o navegador em `http://localhost:3000`

Se você ver a página Next.js padrão, está tudo certo! ✅

---

## 🧪 Passo 10: Teste da Conexão com Supabase

Vamos criar uma página de teste rápida.

Crie `src/app/test-supabase/page.tsx`:

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
        const { data, error } = await supabase.from('_test').select('*').limit(1)
        
        if (error && error.code !== 'PGRST204') {
          // PGRST204 = tabela não existe (esperado)
          setStatus('error')
          setMessage(`Erro: ${error.message}`)
        } else {
          setStatus('success')
          setMessage('Conexão com Supabase estabelecida com sucesso! ✅')
        }
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

Acesse `http://localhost:3000/test-supabase` para verificar a conexão.

---

## ✅ Checklist de Conclusão da Fase 1

Antes de prosseguir para a Fase 2, certifique-se de que:

- ✅ Next.js está rodando sem erros
- ✅ Tailwind CSS está configurado
- ✅ ShadCN UI está instalado com componentes base
- ✅ Supabase está configurado
- ✅ Variáveis de ambiente estão corretas
- ✅ Estrutura de pastas criada
- ✅ Teste de conexão Supabase passou
- ✅ Todas as dependências instaladas

---

## 🚀 Próximos Passos

Com a Fase 1 completa, você está pronto para:

1. **Fase 2**: Implementar o sistema de autenticação completo
2. **Fase 3**: Criar o schema do banco de dados
3. **Fase 4**: Desenvolver o layout e navegação

Consulte o arquivo `ROADMAP.md` para detalhes completos de cada fase.

---

## 🆘 Problemas Comuns

### Erro: "Cannot find module '@supabase/ssr'"
```bash
npm install @supabase/ssr
```

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Verifique se o arquivo `.env.local` está na raiz do projeto
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### Erro de CORS no Supabase
- Verifique se a URL no `.env.local` está correta
- Confirme que as chaves de API estão corretas

### Tailwind não está aplicando estilos
- Verifique o `tailwind.config.ts`
- Confirme que os paths estão corretos
- Reinicie o servidor

---

## 📚 Recursos Úteis

- 📖 [Documentação Next.js](https://nextjs.org/docs)
- 📖 [Documentação Supabase](https://supabase.com/docs)
- 📖 [ShadCN UI](https://ui.shadcn.com)
- 📖 [Tailwind CSS](https://tailwindcss.com/docs)
- 💬 [Discord da Comunidade Next.js](https://discord.gg/nextjs)

---

**Pronto para começar? Boa sorte! 🚀**

Se precisar de ajuda, consulte o `ROADMAP.md` ou entre em contato com a equipe.


