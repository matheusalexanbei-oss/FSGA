# 🚀 Fullstack Gestor AI

Sistema ERP completo com catalogação de produtos assistida por IA

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)

---

## ✨ Funcionalidades Implementadas

### ✅ Fase 1: Configuração Inicial
- Next.js 14+ com App Router
- TypeScript configurado
- Tailwind CSS + ShadCN UI
- Estrutura de pastas organizada

### ✅ Fase 2: Sistema de Autenticação
- Login e Registro
- Autenticação com Supabase
- Proteção de rotas
- OAuth (Google, GitHub)
- Recuperação de senha

### ✅ Fase 3: Database Schema
- Tabelas: users_profile, products, categories, financial_transactions
- RLS (Row Level Security) configurado
- Migrations aplicadas
- Políticas de segurança

### ✅ Fase 4: Layout e Navegação
- Sidebar animada e colapsável
- Header com perfil do usuário
- Navegação fluida entre páginas
- Animações com Framer Motion
- Design responsivo

### ✅ Fase 5: Módulo de Cadastro de Produtos 📦
- **CRUD Completo de Produtos**
  - Cadastro com formulário validado
  - Edição de produtos existentes
  - Deleção com confirmação
  - Listagem em tabela interativa
  
- **Upload de Imagens**
  - Drag & drop de imagens
  - Preview instantâneo
  - Upload para Supabase Storage
  - Validação de tipo e tamanho
  
- **Sistema de Categorias**
  - CRUD completo de categorias
  - Criação inline no formulário
  - Página dedicada de gerenciamento
  
- **Busca e Filtros**
  - Busca em tempo real
  - Filtro por nome, código, categoria
  - Contador de resultados
  
- **Estatísticas**
  - Total de produtos
  - Valor do estoque
  - Produtos em estoque
  
- **UX Premium**
  - Animações fluidas
  - Loading states
  - Empty states
  - Toast notifications
  - Badges de status

---

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fullstack-gestor.git

# Entre na pasta
cd fullstackgestorai

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute as migrations do banco
# Siga as instruções em: supabase/APPLY_MIGRATIONS.md

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:3001**

---

## 🔄 Versionamento com Git

Este projeto usa Git para controle de versão. Se você ainda não tem o Git instalado, siga as instruções abaixo.

### Instalação do Git

1. **Baixe o Git para Windows:**
   - Acesse: https://git-scm.com/download/win
   - Execute o instalador e mantenha as opções padrão

2. **Configure o Git (após instalar):**
   ```bash
   git config --global user.name "Seu Nome"
   git config --global user.email "seu.email@exemplo.com"
   ```

3. **Inicialize o repositório:**
   ```bash
   # Execute o script automatizado
   .\inicializar-git.ps1
   
   # Ou manualmente:
   git init
   git add .
   git commit -m "feat: commit inicial do projeto"
   ```

### 📖 Guia Completo

Para instruções detalhadas sobre Git, branches, commits, pull requests e fluxo de trabalho, consulte:
- **[GUIA_GIT.md](GUIA_GIT.md)** - Guia completo de Git

### Comandos Básicos

```bash
# Ver status das mudanças
git status

# Adicionar arquivos
git add .

# Criar commit
git commit -m "feat: descrição da mudança"

# Ver histórico
git log --oneline

# Criar nova branch
git checkout -b feature/nome-da-funcionalidade
```

---

## 📦 Configuração do Supabase

### 1. Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie as credenciais (URL e anon key)

### 2. Aplicar Migrations
Veja instruções detalhadas em: [`supabase/APPLY_MIGRATIONS.md`](supabase/APPLY_MIGRATIONS.md)

```bash
# Via Dashboard (recomendado)
# 1. Acesse SQL Editor no Supabase Dashboard
# 2. Execute cada migration na ordem:
#    - 20250116000001_initial_schema.sql
#    - 20250116000002_rls_policies.sql
#    - 20250116000003_seed_data.sql
#    - 20250116000004_storage_setup.sql
```

### 3. Configurar Storage
O bucket `product-images` será criado automaticamente pelas migrations.

Se necessário criar manualmente:
- Nome: `product-images`
- Público: Sim
- Limite: 5MB por arquivo

---

## 🗂️ Estrutura do Projeto

```
fullstackgestorai/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── (auth)/            # Autenticação
│   │   ├── (dashboard)/       # Dashboard protegido
│   │   │   ├── dashboard/
│   │   │   ├── products/      # ✅ Módulo de Produtos
│   │   │   ├── financial/
│   │   │   ├── exports/
│   │   │   ├── chat/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── components/            # Componentes React
│   │   ├── auth/
│   │   ├── products/          # ✅ Componentes de Produtos
│   │   ├── layout/
│   │   ├── shared/
│   │   └── ui/               # ShadCN UI
│   ├── lib/                  # Utilitários
│   │   ├── supabase/
│   │   └── utils/
│   ├── types/                # TypeScript types
│   └── config/               # Configurações
├── supabase/
│   ├── migrations/           # Migrations SQL
│   └── APPLY_MIGRATIONS.md
├── docs/                     # Documentação
│   ├── ROADMAP.md
│   ├── PROJECT_STRUCTURE.md
│   └── ...
└── public/                   # Assets estáticos
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14+** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **ShadCN UI** - Componentes
- **Framer Motion** - Animações
- **React Hook Form** - Formulários
- **Zod** - Validação

### Backend
- **Supabase**
  - PostgreSQL (Banco de dados)
  - Auth (Autenticação)
  - Storage (Armazenamento)
  - RLS (Segurança)
  - Edge Functions (Serverless)

### IA (Em desenvolvimento)
- **OpenAI GPT-4 Vision** - Reconhecimento de imagens
- **Anthropic Claude** - Chat e análises

### Deploy
- **Vercel** - Hospedagem
- **GitHub Actions** - CI/CD

---

## 📚 Documentação

- [📖 Roadmap Completo](docs/ROADMAP.md)
- [🏗️ Estrutura do Projeto](docs/PROJECT_STRUCTURE.md)
- [⚙️ Setup Instructions](docs/SETUP_INSTRUCTIONS.md)
- [🚀 Quick Start](docs/QUICK_START.md)
- [📋 Índice](docs/INDEX.md)

### Testes
- [🧪 Guia Completo de Testes](docs/GUIA_TESTES.md)
- [⚡ Testes de Performance](docs/TESTES_PERFORMANCE.md)

### CI/CD
- [🚀 Configuração de CI/CD](docs/CI_CD_SETUP.md)

### Fases Concluídas
- [✅ Fase 1 - Configuração](FASE1_CONCLUIDA.md)
- [✅ Fase 2 - Autenticação](FASE2_CONCLUIDA.md)
- [✅ Fase 3 - Database](FASE3_CONCLUIDA.md)
- [✅ Fase 4 - Layout](FASE4_CONCLUIDA.md)
- [✅ Fase 5 - Produtos](FASE5_CONCLUIDA.md)

---

## 🎊 Sistema Totalmente Funcional! 

**Status Atual:**
- ✅ Autenticação completa
- ✅ Sistema de produtos com upload de imagens
- ✅ Categorização
- ✅ Busca em tempo real
- ✅ Interface animada e moderna
- ✅ Zero bugs críticos

**Você pode começar a usar o sistema agora mesmo!**

---

## 🎯 Próximas Fases

### 🤖 Fase 6: IA para Reconhecimento de Produtos (📋 Planejada)
- Reconhecimento automático por imagem
- Sugestão de categoria e preço
- Processamento em lote
- OCR de notas fiscais

### 📊 Fase 7: Dashboard Financeiro
- Gráficos interativos
- Métricas em tempo real
- Transações financeiras
- Análises e insights

### 💬 Fase 8: Chat IA
- Consultas inteligentes
- Análises de dados
- Recomendações
- Insights proativos

### 📤 Fase 9: Sistema de Exportação
- Export CSV/Excel
- Integração Shopify
- Geração de catálogos PDF
- Sincronização com ERPs

---

## 📋 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor dev
npm run build            # Build de produção
npm run start            # Iniciar produção
npm run lint             # Rodar linter

# Testes
npm run test:chatbot     # Testes de funcionalidade do chat bot
npm run test:performance # Testes de performance

# Tipos
npm run type-check       # Verificar tipos TypeScript

# Supabase
npx supabase status      # Ver status
npx supabase db reset    # Resetar banco (cuidado!)
```

---

## 🧪 Testando o Sistema

### Testes Automatizados

O projeto inclui testes automatizados para validar funcionalidade e performance:

```bash
# Testes de funcionalidade do chat bot
npm run test:chatbot

# Testes de performance
npm run test:performance
```

**Documentação completa**:
- 📖 [Guia Completo de Testes](docs/GUIA_TESTES.md)
- ⚡ [Testes de Performance](docs/TESTES_PERFORMANCE.md)

### Testes Manuais

#### Produtos
1. Acesse `/products`
2. Clique em "Novo Produto"
3. Preencha os dados
4. Faça upload de uma imagem
5. Selecione ou crie uma categoria
6. Clique em "Cadastrar Produto"

#### Categorias
1. Acesse `/products/categories`
2. Clique em "Nova Categoria"
3. Digite nome e descrição
4. Clique em "Criar"

#### Busca
1. Na lista de produtos
2. Digite no campo de busca
3. Veja os resultados filtrarem em tempo real

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Minha nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Commits Semânticos
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: seu-email@exemplo.com

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

---

## 🐛 Reportar Bugs

Encontrou um bug? Por favor, abra uma [issue](https://github.com/seu-usuario/fullstack-gestor/issues).

---

## 💡 Suporte

Precisa de ajuda? Entre em contato:
- 📧 Email: seu-email@exemplo.com
- 💬 Discord: [Servidor Discord](#)
- 📖 Docs: [Documentação Completa](docs/INDEX.md)

---

**Desenvolvido com ❤️ e ☕**

🚀 **Status**: Fase 5 Concluída - Sistema 100% Funcional! Fase 6 Planejada!

📅 **Última atualização**: Outubro 2025
