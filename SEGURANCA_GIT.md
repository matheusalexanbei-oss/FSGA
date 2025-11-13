# 🔒 Guia de Segurança Git - Verificação e Correção

## ✅ Verificação de Segurança

### 1. Verificar se há arquivos sensíveis sendo rastreados

Execute no PowerShell (no terminal do VS Code ou PowerShell normal):

```powershell
# Verificar arquivos .env
git ls-files | Select-String "\.env"

# Verificar arquivos com palavras-chave sensíveis
git ls-files | Select-String -Pattern "env-setup|key|secret|password|credential" -CaseSensitive:$false

# Ver TODOS os arquivos rastreados (para inspeção manual)
git ls-files
```

**Se não retornar NADA (nenhum resultado):** ✅ **Está seguro!** Nenhum arquivo sensível está sendo rastreado.

**Se retornar arquivos:** ⚠️ **Ação necessária** - Siga os passos abaixo para remover.

---

## 🔄 Como Desfazer o Commit (Método Seguro)

### Opção 1: Desfazer commit mas manter as mudanças (RECOMENDADO)

Este método desfaz o commit mas mantém todos os arquivos e mudanças:

```powershell
# Desfazer o último commit (mantém arquivos e mudanças)
git reset --soft HEAD~1

# Verificar status
git status
```

**O que acontece:**
- ✅ O commit é desfeito
- ✅ Todos os arquivos continuam "staged" (prontos para commit)
- ✅ Nenhum arquivo é perdido
- ✅ Você pode ajustar o .gitignore e fazer um novo commit

### Opção 2: Desfazer commit e "unstage" dos arquivos

```powershell
# Desfazer commit e remover arquivos do stage
git reset HEAD~1

# Verificar status
git status
```

**O que acontece:**
- ✅ O commit é desfeito
- ✅ Arquivos voltam para "untracked" ou "modified"
- ✅ Você precisa fazer `git add` novamente

### Opção 3: Desfazer commit e descartar mudanças (CUIDADO!)

```powershell
# ⚠️ CUIDADO: Isso descarta TODAS as mudanças!
git reset --hard HEAD~1
```

**NÃO USE** a menos que tenha certeza que quer perder todas as mudanças!

---

## 🛡️ Remover Arquivos Sensíveis do Git (se necessário)

Se você encontrou arquivos sensíveis sendo rastreados:

### Passo 1: Remover do Git (mas manter localmente)

```powershell
# Remover arquivo específico
git rm --cached .env
git rm --cached env-setup.txt
git rm --cached env-setup-completo.txt

# Ou remover múltiplos arquivos de uma vez
git rm --cached .env env-setup.txt env-setup-completo.txt
```

### Passo 2: Verificar que o .gitignore está atualizado

O `.gitignore` já foi atualizado com proteções completas. Verifique se inclui:
- `.env`
- `.env.*`
- `env-setup.txt`
- `env-setup-completo.txt`
- Outros padrões sensíveis

### Passo 3: Fazer commit da remoção

```powershell
# Adicionar o .gitignore atualizado
git add .gitignore

# Fazer commit removendo arquivos sensíveis
git commit -m "security: remove arquivos sensíveis e atualizar .gitignore"
```

---

## 📋 Fluxo Completo Recomendado

```powershell
# 1. Verificar o que está sendo rastreado
git ls-files | Select-String "\.env|env-setup"

# 2. Se encontrar arquivos sensíveis, remover do Git
git rm --cached .env env-setup.txt env-setup-completo.txt

# 3. Desfazer o commit anterior (se necessário)
git reset --soft HEAD~1

# 4. Adicionar o .gitignore atualizado
git add .gitignore

# 5. Verificar o que será commitado
git status

# 6. Fazer novo commit seguro
git commit -m "feat: commit inicial do projeto Fullstack Gestor AI (com .gitignore seguro)"
```

---

## ✅ Verificação Final

Após fazer as correções, verifique novamente:

```powershell
# Verificar se arquivos sensíveis ainda estão sendo rastreados
git ls-files | Select-String "\.env|env-setup|key|secret"

# Se não retornar nada, está seguro! ✅
```

---

## 🚨 Importante: Se já fez Push

Se você já fez `git push` e enviou arquivos sensíveis para o GitHub/GitLab:

1. **Remova os arquivos do repositório remoto:**
   ```powershell
   git rm --cached .env
   git commit -m "security: remove arquivos sensíveis"
   git push
   ```

2. **ROTE as chaves expostas:**
   - Gere novas chaves de API
   - Atualize no Supabase/Claude
   - As chaves antigas estão comprometidas

3. **Considere usar GitGuardian ou similar** para monitorar vazamentos

---

## 📝 Checklist de Segurança

- [ ] `.gitignore` atualizado com proteções completas
- [ ] Verificado que nenhum arquivo `.env` está sendo rastreado
- [ ] Verificado que `env-setup.txt` não está sendo rastreado
- [ ] Commit feito sem arquivos sensíveis
- [ ] Se fez push, rotacionou as chaves expostas

---

## 💡 Dica: Arquivo .env.example

Crie um arquivo `.env.example` (sem dados reais) para documentar as variáveis necessárias:

```bash
# .env.example (este arquivo PODE ser commitado)
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

Este arquivo serve como template e pode ser commitado com segurança.

