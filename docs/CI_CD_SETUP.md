# 🚀 Configuração de CI/CD

Este documento explica como o CI/CD está configurado no projeto e como utilizá-lo.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Workflows Configurados](#workflows-configurados)
3. [Configuração Inicial](#configuração-inicial)
4. [Secrets Necessários](#secrets-necessários)
5. [Como Funciona](#como-funciona)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O projeto utiliza **GitHub Actions** para CI/CD, automatizando:

- ✅ **Lint e validação** de código
- ✅ **Testes automatizados** (chat bot e performance)
- ✅ **Build** do projeto
- ✅ **Deploy** automático na Vercel
- ✅ **Testes de performance** semanais

---

## 🔄 Workflows Configurados

### 1. CI - Continuous Integration (`ci.yml`)

**Quando executa:**
- Push para `main` ou `develop`
- Pull Requests para `main` ou `develop`

**O que faz:**
1. **Lint**: Valida código com ESLint
2. **Type Check**: Verifica tipos TypeScript
3. **Testes Chat Bot**: Executa testes de funcionalidade
4. **Testes Performance**: Executa testes de performance
5. **Build**: Compila o projeto Next.js

**Artefatos gerados:**
- Resultados dos testes
- Relatórios de performance
- Build artifacts

---

### 2. CD - Continuous Deployment (`cd.yml`)

**Quando executa:**
- Push para `main`
- Execução manual (workflow_dispatch)

**O que faz:**
1. Build do projeto
2. Deploy na Vercel (se configurado)
3. Notificação de sucesso/falha

---

### 3. Testes de Performance Agendados (`performance-schedule.yml`)

**Quando executa:**
- Toda segunda-feira às 00:00 UTC
- Execução manual (workflow_dispatch)

**O que faz:**
1. Executa testes de performance
2. Gera relatórios
3. Salva artefatos por 90 dias
4. Comenta em PRs (se aplicável)

---

## ⚙️ Configuração Inicial

### 1. Habilitar GitHub Actions

Os workflows já estão criados em `.github/workflows/`. Eles serão executados automaticamente quando você fizer push para o repositório.

### 2. Configurar Secrets

Acesse: **Settings → Secrets and variables → Actions** no seu repositório GitHub.

Adicione os seguintes secrets:

#### Secrets Obrigatórios para Build/Deploy

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Secrets Opcionais (para deploy na Vercel)

```bash
VERCEL_TOKEN          # Token da Vercel
VERCEL_ORG_ID         # ID da organização Vercel
VERCEL_PROJECT_ID     # ID do projeto Vercel
```

#### Secrets Opcionais (para funcionalidades IA)

```bash
ANTHROPIC_API_KEY     # Chave da API Anthropic (Claude)
OPENAI_API_KEY        # Chave da API OpenAI (se usar)
```

### 3. Como Adicionar Secrets

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret com seu valor

---

## 🔐 Secrets Necessários

### Para CI (Testes e Build)

| Secret | Obrigatório | Descrição |
|--------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Sim | Chave anônima do Supabase |

### Para CD (Deploy)

| Secret | Obrigatório | Descrição |
|--------|-------------|-----------|
| `VERCEL_TOKEN` | ⚠️ Opcional | Token da Vercel para deploy |
| `VERCEL_ORG_ID` | ⚠️ Opcional | ID da organização Vercel |
| `VERCEL_PROJECT_ID` | ⚠️ Opcional | ID do projeto Vercel |

**Nota**: Se não configurar os secrets da Vercel, o deploy automático não funcionará, mas o CI continuará funcionando normalmente.

---

## 🎬 Como Funciona

### Fluxo Automático

```
1. Você faz push/PR
   ↓
2. GitHub Actions detecta
   ↓
3. CI executa:
   - Lint ✅
   - Testes ✅
   - Build ✅
   ↓
4. Se tudo passar:
   - CD faz deploy (se configurado) 🚀
   ↓
5. Notificação de sucesso/falha
```

### Visualizando Execuções

1. Acesse seu repositório no GitHub
2. Clique na aba **Actions**
3. Veja todas as execuções dos workflows
4. Clique em uma execução para ver detalhes

### Badges de Status

Você pode adicionar badges no README para mostrar o status do CI:

```markdown
![CI](https://github.com/seu-usuario/seu-repo/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/seu-usuario/seu-repo/actions/workflows/cd.yml/badge.svg)
```

---

## 🔧 Troubleshooting

### Problema: Workflow não executa

**Causas possíveis:**
1. Branch não está em `main` ou `develop`
2. Workflows não estão no diretório correto (`.github/workflows/`)
3. Sintaxe YAML incorreta

**Soluções:**
```bash
# Verificar estrutura
ls -la .github/workflows/

# Verificar sintaxe YAML
# Use um validador online ou o GitHub Actions
```

---

### Problema: Build falha por falta de secrets

**Erro típico:**
```
Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
```

**Solução:**
1. Adicione os secrets necessários no GitHub
2. Verifique se os nomes estão corretos
3. Faça um novo push para disparar o workflow

---

### Problema: Testes falham no CI mas passam localmente

**Causas possíveis:**
1. Diferenças de ambiente
2. Dependências não instaladas corretamente
3. Variáveis de ambiente faltando

**Soluções:**
```bash
# Testar localmente com npm ci (igual ao CI)
npm ci
npm run test:chatbot
npm run test:performance
```

---

### Problema: Deploy não acontece

**Causas possíveis:**
1. Secrets da Vercel não configurados
2. Branch não é `main`
3. CI falhou antes do deploy

**Soluções:**
1. Configure os secrets da Vercel
2. Verifique se está na branch `main`
3. Verifique se o CI passou

---

## 📊 Monitoramento

### Ver Status dos Workflows

1. **GitHub Actions Tab**: Veja todas as execuções
2. **Badges**: Adicione badges no README
3. **Notificações**: Configure notificações no GitHub

### Artefatos Gerados

Os workflows geram artefatos que ficam disponíveis por:
- **Testes**: 7 dias
- **Performance**: 30 dias (semanais) ou 90 dias (agendados)
- **Build**: 1 dia

Para baixar artefatos:
1. Vá na execução do workflow
2. Role até "Artifacts"
3. Baixe o arquivo desejado

---

## 🎯 Boas Práticas

### 1. Sempre verificar CI antes de merge

- ✅ CI deve passar antes de fazer merge
- ✅ Revisar relatórios de performance
- ✅ Corrigir problemas antes de merge

### 2. Manter secrets seguros

- ❌ Nunca commitar secrets no código
- ✅ Usar GitHub Secrets
- ✅ Rotacionar secrets periodicamente

### 3. Monitorar performance

- ✅ Revisar relatórios semanais
- ✅ Comparar métricas ao longo do tempo
- ✅ Identificar regressões rapidamente

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## ✅ Checklist de Configuração

- [x] Workflows criados
- [ ] Secrets configurados no GitHub
- [ ] Primeira execução do CI bem-sucedida
- [ ] Deploy configurado (opcional)
- [ ] Badges adicionados no README (opcional)
- [ ] Notificações configuradas (opcional)

---

**Última atualização**: 12 de Novembro de 2025

