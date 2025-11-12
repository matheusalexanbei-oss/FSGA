# 📦 Script de Instalação de Dependências

## Dependências para Instalar

Execute estes comandos na pasta `fullstackgestorai`:

### 1. Dependências Core (já devem estar instaladas)
```bash
npm install next@latest react@latest react-dom@latest typescript @types/node @types/react @types/react-dom
```

### 2. Supabase
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3. UI e Estilo
```bash
npm install tailwindcss postcss autoprefixer
npm install tailwindcss-animate
npm install clsx tailwind-merge
npm install lucide-react
```

### 4. Formulários e Validação
```bash
npm install react-hook-form zod @hookform/resolvers
```

### 5. Utilitários
```bash
npm install date-fns
npm install zustand
npm install sonner
```

### 6. Gráficos (para Dashboard - Fase 7)
```bash
npm install recharts
```

### 7. ShadCN UI
```bash
npx shadcn@latest init
```

Depois instale os componentes:
```bash
npx shadcn@latest add button input card label form dialog dropdown-menu tabs table select checkbox toast skeleton badge avatar separator
```

## Instalação Rápida (Tudo de Uma Vez)

```bash
# Todas as dependências principais
npm install @supabase/supabase-js @supabase/ssr tailwindcss-animate clsx tailwind-merge lucide-react react-hook-form zod @hookform/resolvers date-fns zustand sonner recharts
```

## Verificar Instalação

Após instalar, verifique se tudo está OK:

```bash
npm run dev
```

Se não houver erros, está tudo pronto! ✅



