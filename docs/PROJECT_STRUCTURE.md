# 📁 Estrutura do Projeto - Fullstack Gestor

## Estrutura de Pastas Recomendada

```
fullstackgestorai/
├── .env.local                          # Variáveis de ambiente (não commitar)
├── .env.example                        # Template de variáveis de ambiente
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
│
├── public/                             # Assets estáticos
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   └── placeholder-product.png
│   └── fonts/
│
├── docs/                               # Documentação
│   ├── context (1).md
│   ├── ROADMAP.md
│   ├── PROJECT_STRUCTURE.md
│   └── API_DOCUMENTATION.md
│
├── supabase/                           # Configurações do Supabase
│   ├── functions/                      # Edge Functions
│   │   ├── process-product-image/
│   │   │   └── index.ts
│   │   ├── ai-chat/
│   │   │   └── index.ts
│   │   └── generate-pdf-catalog/
│   │       └── index.ts
│   ├── migrations/                     # SQL migrations
│   │   ├── 20240101000000_initial_schema.sql
│   │   ├── 20240102000000_add_products_table.sql
│   │   └── 20240103000000_add_rls_policies.sql
│   └── seed.sql                        # Dados iniciais
│
└── src/
    ├── app/                            # Next.js App Router
    │   ├── layout.tsx                  # Root layout
    │   ├── page.tsx                    # Landing page
    │   ├── globals.css
    │   ├── favicon.ico
    │   │
    │   ├── (auth)/                     # Rotas de autenticação (sem layout dashboard)
    │   │   ├── layout.tsx
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── register/
    │   │   │   └── page.tsx
    │   │   └── forgot-password/
    │   │       └── page.tsx
    │   │
    │   ├── (onboarding)/               # Fluxo de onboarding
    │   │   ├── layout.tsx
    │   │   ├── welcome/
    │   │   │   └── page.tsx
    │   │   ├── business-info/
    │   │   │   └── page.tsx
    │   │   └── tour/
    │   │       └── page.tsx
    │   │
    │   ├── (dashboard)/                # Rotas com layout dashboard
    │   │   ├── layout.tsx              # Layout com sidebar e header
    │   │   │
    │   │   ├── dashboard/              # Dashboard principal
    │   │   │   └── page.tsx
    │   │   │
    │   │   ├── products/               # Módulo de produtos
    │   │   │   ├── page.tsx            # Lista de produtos
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx        # Cadastro novo produto
    │   │   │   ├── [id]/
    │   │   │   │   ├── page.tsx        # Detalhes do produto
    │   │   │   │   └── edit/
    │   │   │   │       └── page.tsx    # Editar produto
    │   │   │   ├── import/
    │   │   │   │   └── page.tsx        # Import em lote
    │   │   │   └── categories/
    │   │   │       └── page.tsx        # Gerenciar categorias
    │   │   │
    │   │   ├── financial/              # Módulo financeiro
    │   │   │   ├── page.tsx            # Dashboard financeiro
    │   │   │   ├── transactions/
    │   │   │   │   └── page.tsx        # Lista de transações
    │   │   │   └── reports/
    │   │   │       └── page.tsx        # Relatórios
    │   │   │
    │   │   ├── exports/                # Módulo de exportação
    │   │   │   └── page.tsx
    │   │   │
    │   │   ├── chat/                   # Chat com IA
    │   │   │   └── page.tsx
    │   │   │
    │   │   └── settings/               # Configurações
    │   │       ├── page.tsx
    │   │       ├── profile/
    │   │       │   └── page.tsx
    │   │       ├── business/
    │   │       │   └── page.tsx
    │   │       └── integrations/
    │   │           └── page.tsx
    │   │
    │   └── api/                        # API Routes (se necessário)
    │       └── webhooks/
    │           └── shopify/
    │               └── route.ts
    │
    ├── components/                     # Componentes React
    │   │
    │   ├── ui/                         # Componentes ShadCN
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── table.tsx
    │   │   ├── toast.tsx
    │   │   ├── tabs.tsx
    │   │   ├── select.tsx
    │   │   ├── checkbox.tsx
    │   │   ├── skeleton.tsx
    │   │   └── ...
    │   │
    │   ├── layout/                     # Componentes de layout
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── MobileMenu.tsx
    │   │   ├── Footer.tsx
    │   │   └── UserMenu.tsx
    │   │
    │   ├── auth/                       # Componentes de autenticação
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   ├── ForgotPasswordForm.tsx
    │   │   ├── OAuthButtons.tsx
    │   │   └── ProtectedRoute.tsx
    │   │
    │   ├── products/                   # Componentes de produtos
    │   │   ├── ProductForm.tsx
    │   │   ├── ProductTable.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductGrid.tsx
    │   │   ├── ProductFilters.tsx
    │   │   ├── ImageUpload.tsx
    │   │   ├── BatchImport.tsx
    │   │   └── CategorySelector.tsx
    │   │
    │   ├── dashboard/                  # Componentes do dashboard
    │   │   ├── MetricCard.tsx
    │   │   ├── CashFlowChart.tsx
    │   │   ├── RevenueChart.tsx
    │   │   ├── InventoryChart.tsx
    │   │   ├── ProductsChart.tsx
    │   │   ├── RecentTransactions.tsx
    │   │   └── QuickActions.tsx
    │   │
    │   ├── financial/                  # Componentes financeiros
    │   │   ├── TransactionForm.tsx
    │   │   ├── TransactionTable.tsx
    │   │   ├── FinancialSummary.tsx
    │   │   ├── CategoryBreakdown.tsx
    │   │   └── PeriodSelector.tsx
    │   │
    │   ├── chat/                       # Componentes do chat
    │   │   ├── ChatInterface.tsx
    │   │   ├── ChatMessage.tsx
    │   │   ├── ChatInput.tsx
    │   │   ├── TypingIndicator.tsx
    │   │   └── ChatHistory.tsx
    │   │
    │   ├── exports/                    # Componentes de exportação
    │   │   ├── ExportOptions.tsx
    │   │   ├── ShopifyConnect.tsx
    │   │   ├── PDFPreview.tsx
    │   │   └── ExportHistory.tsx
    │   │
    │   ├── onboarding/                 # Componentes de onboarding
    │   │   ├── Stepper.tsx
    │   │   ├── WelcomeScreen.tsx
    │   │   ├── BusinessSetup.tsx
    │   │   └── AppTour.tsx
    │   │
    │   └── shared/                     # Componentes compartilhados
    │       ├── LoadingSpinner.tsx
    │       ├── ErrorBoundary.tsx
    │       ├── EmptyState.tsx
    │       ├── ConfirmDialog.tsx
    │       ├── Pagination.tsx
    │       ├── SearchBar.tsx
    │       ├── DateRangePicker.tsx
    │       └── FileDropzone.tsx
    │
    ├── lib/                            # Utilitários e configurações
    │   │
    │   ├── supabase/                   # Configuração Supabase
    │   │   ├── client.ts               # Cliente Supabase (client-side)
    │   │   ├── server.ts               # Cliente Supabase (server-side)
    │   │   └── middleware.ts           # Middleware de auth
    │   │
    │   ├── ai/                         # Integrações com IA
    │   │   ├── openai.ts               # Cliente OpenAI
    │   │   ├── claude.ts               # Cliente Anthropic
    │   │   ├── image-recognition.ts    # Lógica de reconhecimento
    │   │   └── chat.ts                 # Lógica do chat
    │   │
    │   ├── pdf/                        # Geração de PDFs
    │   │   ├── catalog-template.tsx
    │   │   └── generator.ts
    │   │
    │   ├── shopify/                    # Integração Shopify
    │   │   ├── client.ts
    │   │   ├── sync.ts
    │   │   └── webhooks.ts
    │   │
    │   └── utils/                      # Funções utilitárias
    │       ├── cn.ts                   # classNames utility
    │       ├── format.ts               # Formatação (datas, moeda)
    │       ├── validators.ts           # Validações customizadas
    │       ├── constants.ts            # Constantes da aplicação
    │       └── helpers.ts              # Funções auxiliares
    │
    ├── hooks/                          # Custom React Hooks
    │   ├── useAuth.ts                  # Hook de autenticação
    │   ├── useProducts.ts              # Hook para produtos
    │   ├── useCategories.ts            # Hook para categorias
    │   ├── useTransactions.ts          # Hook para transações
    │   ├── useDashboard.ts             # Hook para dashboard data
    │   ├── useChat.ts                  # Hook para chat
    │   ├── useSupabase.ts              # Hook para Supabase
    │   └── useDebounce.ts              # Hook para debounce
    │
    ├── types/                          # Definições de tipos TypeScript
    │   ├── database.ts                 # Tipos do banco de dados
    │   ├── supabase.ts                 # Tipos gerados do Supabase
    │   ├── product.ts                  # Tipos de produtos
    │   ├── financial.ts                # Tipos financeiros
    │   ├── user.ts                     # Tipos de usuário
    │   └── index.ts                    # Exports centralizados
    │
    ├── store/                          # State Management (se usar Zustand/Jotai)
    │   ├── authStore.ts
    │   ├── productsStore.ts
    │   └── uiStore.ts
    │
    ├── config/                         # Configurações
    │   ├── site.ts                     # Metadados do site
    │   ├── navigation.ts               # Configuração de navegação
    │   └── features.ts                 # Feature flags
    │
    └── styles/                         # Estilos adicionais
        └── charts.css                  # Estilos customizados para charts
```

## 🗂️ Convenções de Nomenclatura

### Arquivos
- **Componentes React**: PascalCase - `ProductCard.tsx`
- **Utilitários**: camelCase - `formatCurrency.ts`
- **Hooks**: camelCase com prefixo `use` - `useProducts.ts`
- **Tipos**: PascalCase - `Product.ts`
- **Constantes**: camelCase ou UPPER_CASE - `apiConfig.ts` ou `CONSTANTS.ts`

### Componentes
- **Componentes de página**: `page.tsx`
- **Layouts**: `layout.tsx`
- **Loading states**: `loading.tsx`
- **Error boundaries**: `error.tsx`
- **Not found**: `not-found.tsx`

### Rotas
- **Grupos de rotas**: `(nome)` - não afetam URL
- **Rotas dinâmicas**: `[id]` ou `[slug]`
- **Catch-all**: `[...slug]`

## 📝 Organização de Imports

Ordem recomendada nos arquivos:
```typescript
// 1. Imports externos
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Imports de componentes UI
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 3. Imports de componentes locais
import { ProductCard } from '@/components/products/ProductCard'
import { Header } from '@/components/layout/Header'

// 4. Imports de hooks
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'

// 5. Imports de utilitários e tipos
import { formatCurrency } from '@/lib/utils/format'
import type { Product } from '@/types/product'

// 6. Imports de estilos (se houver)
import styles from './styles.module.css'
```

## 🎯 Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/app/*": ["./src/app/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/config/*": ["./src/config/*"]
    }
  }
}
```

## 📦 Estrutura de Componentes

### Anatomia de um Componente Bem Estruturado

```typescript
// components/products/ProductCard.tsx

// Imports
import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/format'
import type { Product } from '@/types/product'

// Tipos/Interfaces
interface ProductCardProps {
  product: Product
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

// Constantes locais (se houver)
const PLACEHOLDER_IMAGE = '/images/placeholder-product.png'

// Componente principal
export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  // Estado
  const [isLoading, setIsLoading] = useState(false)

  // Handlers
  const handleEdit = () => {
    onEdit?.(product.id)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    await onDelete?.(product.id)
    setIsLoading(false)
  }

  // Render
  return (
    <Card>
      <CardContent>
        {/* ... */}
      </CardContent>
      <CardFooter>
        {/* ... */}
      </CardFooter>
    </Card>
  )
}

// Componentes auxiliares (se houver)
function ProductCardSkeleton() {
  return <div>Loading...</div>
}

// Exports nomeados adicionais
export { ProductCardSkeleton }
```

## 🔧 Configurações Importantes

### .env.local (exemplo)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# Shopify (opcional)
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 Recursos Adicionais

- **Documentação Next.js**: https://nextjs.org/docs
- **Documentação Supabase**: https://supabase.com/docs
- **ShadCN UI**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

Esta estrutura garante:
- ✅ Escalabilidade
- ✅ Manutenibilidade
- ✅ Separação de responsabilidades
- ✅ Fácil navegação
- ✅ Padrões consistentes


