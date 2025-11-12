# 📋 DOCUMENTAÇÃO COMPLETA DO FULLSTACK GESTOR AI

## 🚨 INFORMAÇÕES CRÍTICAS E CONFLITOS POTENCIAIS

### ⚠️ CONFLITOS DE ROTEAMENTO
- **PRODUTOS**: `/products` (SEM `/dashboard` prefix)
- **OUTRAS ROTAS**: `/dashboard/financial`, `/dashboard/exports`, `/dashboard/chat`, `/dashboard/settings`
- **PROBLEMA**: Inconsistência no prefixo `/dashboard` - pode causar confusão

### ⚠️ SISTEMA DE AUTENTICAÇÃO HÍBRIDO
- **useHybridAuth**: Combina Supabase + localStorage
- **useLocalAuth**: Apenas localStorage (modo offline)
- **useSecureAuth**: Apenas Supabase
- **CONFLITO**: Múltiplos sistemas de auth podem causar inconsistências

### ⚠️ CONFIGURAÇÃO TAILWIND CSS
- **Tailwind v4**: Configuração específica com `@import 'tailwindcss'`
- **Cores customizadas**: Paleta ERP + cores padrão do Tailwind
- **PROBLEMA**: Configuração complexa pode quebrar com updates

---

## 🏗️ ESTRUTURA DO PROJETO

### 📁 Estrutura de Pastas Principal
```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Rotas de autenticação
│   ├── (dashboard)/             # Rotas do dashboard
│   └── (onboarding)/            # Rotas de onboarding
├── components/
│   ├── layout/                  # Header, Sidebar, etc.
│   ├── products/                # Componentes de produtos
│   ├── ui/                      # ShadCN UI components
│   └── shared/                  # Componentes compartilhados
├── lib/
│   ├── supabase/                # Cliente Supabase
│   ├── utils/                   # Utilitários
│   └── ai/                      # Integração IA
├── hooks/                       # Custom hooks
├── types/                       # TypeScript types
└── config/                      # Configurações
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### Hooks de Autenticação
1. **useHybridAuth** (PRINCIPAL)
   - Combina Supabase + localStorage
   - Fallback automático para localStorage
   - Propriedade `useSupabase` indica qual sistema usar

2. **useLocalAuth**
   - Apenas localStorage
   - Para desenvolvimento offline
   - ID fixo: `user_local_123`

3. **useSecureAuth**
   - Apenas Supabase
   - Para produção

### Fluxo de Autenticação
```
1. Tentativa Supabase primeiro
2. Se falhar, verifica localStorage
3. Se não há sessão, redireciona para login
4. Email deve estar confirmado no Supabase
```

---

## 🗄️ BANCO DE DADOS (SUPABASE)

### Tabelas Principais
- **users_profile**: Perfil do usuário
- **categories**: Categorias de produtos
- **products**: Produtos com imagens
- **financial_transactions**: Transações financeiras

### Storage
- **Bucket**: `product-images`
- **Políticas RLS**: Apenas usuário dono pode acessar

### Migrations
- `20250116000001_initial_schema.sql`: Schema inicial
- `20250116000002_rls_policies.sql`: Políticas de segurança
- `20250116000004_storage_setup.sql`: Configuração storage

---

## 🎨 SISTEMA DE CORES (TAILWIND)

### Paleta ERP Customizada
```css
--erp-dark: 220 100% 13%     /* #001446 */
--erp-medium: 210 100% 24%   /* #02437B */
--erp-light: 195 100% 37%    /* #028BBF */
--erp-soft: 195 50% 70%      /* #98CBDC */
--erp-pale: 195 30% 90%      /* #D8E9F0 */
```

### Cores Padrão Tailwind
- Todas as cores padrão (red, yellow, green, blue, purple, gray) estão definidas
- Cores HSL para componentes ShadCN UI

---

## 📱 COMPONENTES PRINCIPAIS

### Layout
- **Header**: Barra superior com notificações e perfil
- **Sidebar**: Navegação lateral (largura fixa 280px)
- **MainLayout**: Container principal com margin-left

### Produtos
- **ProductForm**: Formulário de cadastro/edição
- **ProductTable**: Tabela de produtos
- **CardsView**: Visualização em cards
- **FolderGridLayout**: Layout tipo pasta
- **ProductMenu**: Menu de 3 pontos com ações
- **CategoryMenu**: Menu de categorias
- **ImageUpload**: Upload de imagens

### Dashboard
- **DashboardPage**: Página principal com KPIs
- **QuickActions**: Ações rápidas (renomeado para "Acesso Rápido")
- **StatsCards**: Cards de estatísticas

---

## 🔧 CONFIGURAÇÕES IMPORTANTES

### Next.js
- **App Router**: Estrutura de pastas com grupos
- **Middleware**: Autenticação automática
- **Environment**: Variáveis Supabase obrigatórias

### Tailwind CSS v4
- **Configuração**: `tailwind.config.ts` com cores customizadas
- **PostCSS**: `postcss.config.mjs` para v4
- **Import**: `@import 'tailwindcss'` no globals.css

### Supabase
- **Client**: Configurado para browser e server
- **Auth**: Integração com Next.js middleware
- **Storage**: Bucket público para imagens

---

## 🚨 PROBLEMAS CONHECIDOS E SOLUÇÕES

### 1. Transparência em Modais
**Problema**: Modais com fundo transparente
**Solução**: Adicionar `bg-white` e `border` aos componentes

### 2. Navegação Inconsistente
**Problema**: Alguns links com `/dashboard` prefix, outros não
**Solução**: Padronizar conforme necessário

### 3. Seleção de Produtos
**Problema**: Funcionalidade de seleção não funcionando
**Solução**: Implementar `onSelect` em todos os componentes

### 4. Cores do Tailwind
**Problema**: Cores customizadas não funcionando
**Solução**: Verificar configuração v4 e reiniciar servidor

---

## 📋 CHECKLIST DE DESENVOLVIMENTO

### Antes de Fazer Mudanças
- [ ] Verificar se está no modo correto (ask/agent)
- [ ] Confirmar estrutura de roteamento
- [ ] Verificar sistema de autenticação em uso
- [ ] Testar cores do Tailwind

### Após Mudanças
- [ ] Reiniciar servidor (`npm run dev`)
- [ ] Testar em diferentes componentes
- [ ] Verificar responsividade
- [ ] Confirmar funcionalidade de autenticação

---

## 🎯 PRÓXIMAS ETAPAS SUGERIDAS

1. **Padronizar Roteamento**: Decidir se usar `/dashboard` prefix ou não
2. **Simplificar Auth**: Considerar usar apenas useHybridAuth
3. **Otimizar Componentes**: Reduzir duplicação de código
4. **Melhorar UX**: Adicionar loading states e error handling
5. **Testes**: Implementar testes unitários e de integração

---

## 📞 COMANDOS ÚTEIS

```bash
# Reiniciar servidor
taskkill /F /IM node.exe 2>$null; Start-Sleep -Seconds 2; npm run dev

# Verificar portas
netstat -an | findstr :3000

# Instalar dependências
npm install

# Build do projeto
npm run build
```

---

*Última atualização: 23/10/2025*
*Versão: 1.0.0*

