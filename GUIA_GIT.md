# Guia de Instalação e Uso do Git

## 📥 Instalação do Git

### Windows

1. **Baixe o Git para Windows:**
   - Acesse: https://git-scm.com/download/win
   - Ou baixe diretamente: https://github.com/git-for-windows/git/releases/latest
   - Escolha a versão mais recente (ex: `Git-2.43.0-64-bit.exe`)

2. **Instale o Git:**
   - Execute o instalador baixado
   - Durante a instalação, mantenha as opções padrão (recomendado)
   - Importante: Marque a opção "Add Git to PATH" se aparecer
   - Clique em "Next" até finalizar

3. **Verifique a instalação:**
   - Abra um novo PowerShell ou Terminal
   - Execute: `git --version`
   - Deve aparecer algo como: `git version 2.43.0`

### Configuração Inicial (após instalar)

Configure seu nome e email (substitua pelos seus dados):

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

## 🚀 Inicializando o Repositório

Após instalar o Git, execute no diretório do projeto:

```bash
# 1. Inicializar o repositório
git init

# 2. Adicionar todos os arquivos (exceto os ignorados pelo .gitignore)
git add .

# 3. Fazer o primeiro commit
git commit -m "feat: commit inicial do projeto Fullstack Gestor AI"
```

## 📚 Conceitos Básicos do Git

### **Branch (Ramo)**
Uma linha de desenvolvimento paralela. Permite trabalhar em funcionalidades isoladas sem afetar o código principal.

- **Branch principal:** Geralmente chamada `main` ou `master` - contém o código estável
- **Branch de feature:** Ex: `feature/chatbot-tests` - para desenvolver novas funcionalidades
- **Branch de hotfix:** Ex: `hotfix/correcao-bug` - para correções urgentes

### **Commit**
Um "checkpoint" que salva um conjunto de mudanças com uma mensagem descritiva.

```bash
# Ver o status das mudanças
git status

# Adicionar arquivos específicos
git add arquivo.ts

# Ou adicionar todos os arquivos modificados
git add .

# Criar um commit
git commit -m "feat: adiciona testes do chatbot"
```

### **Push e Pull**
- **Push:** Envia seus commits locais para o repositório remoto (GitHub, GitLab, etc.)
- **Pull:** Baixa mudanças do repositório remoto para sua máquina local

### **Pull Request (PR)**
Uma solicitação para mesclar mudanças de uma branch para outra. Permite revisão de código antes de integrar.

## 🔄 Fluxo de Trabalho Recomendado

### 1. Criar uma Branch para Nova Funcionalidade

```bash
# Criar e mudar para nova branch
git checkout -b feature/nome-da-funcionalidade

# Ou (Git 2.23+)
git switch -c feature/nome-da-funcionalidade
```

### 2. Trabalhar e Fazer Commits

```bash
# Fazer alterações nos arquivos...

# Ver o que mudou
git status
git diff

# Adicionar mudanças
git add .

# Fazer commit
git commit -m "feat: descrição do que foi feito"
```

### 3. Enviar para o Repositório Remoto

```bash
# Primeira vez (configurar upstream)
git push -u origin feature/nome-da-funcionalidade

# Próximas vezes
git push
```

### 4. Criar Pull Request
- No GitHub/GitLab, abra uma PR da sua branch para `main`
- Aguarde revisão e aprovação
- Após merge, delete a branch local: `git branch -d feature/nome-da-funcionalidade`

## 📝 Convenções de Mensagens de Commit

Use prefixos para organizar:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `test:` Testes
- `refactor:` Refatoração de código
- `style:` Formatação (não afeta funcionalidade)
- `chore:` Tarefas de manutenção

Exemplos:
```bash
git commit -m "feat: adiciona testes automatizados do chatbot"
git commit -m "fix: corrige validação de produtos no bot"
git commit -m "docs: atualiza guia de testes"
```

## 🛡️ Comandos de Segurança

### Ver Histórico
```bash
# Ver commits
git log

# Ver commits de forma compacta
git log --oneline

# Ver mudanças de um commit específico
git show <hash-do-commit>
```

### Desfazer Mudanças

```bash
# Descartar mudanças em arquivo não commitado
git checkout -- arquivo.ts

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descarta mudanças)
git reset --hard HEAD~1
```

### Criar Backup (Tag)

```bash
# Criar tag para versão
git tag -a v1.0.0 -m "Versão 1.0.0 - Funcionalidades básicas"

# Enviar tags para remoto
git push origin v1.0.0
```

## 🔗 Conectar com GitHub/GitLab

### 1. Criar Repositório no GitHub
- Acesse github.com e crie um novo repositório
- **NÃO** inicialize com README (já temos arquivos)

### 2. Conectar Repositório Local ao Remoto

```bash
# Adicionar repositório remoto (substitua pela URL do seu repositório)
git remote add origin https://github.com/seu-usuario/fullstackgestorai.git

# Verificar remotos configurados
git remote -v

# Enviar código para o remoto
git push -u origin main
```

## 📋 Checklist de Segurança

- ✅ Fazer commits frequentes (não deixar acumular)
- ✅ Usar mensagens de commit descritivas
- ✅ Criar branches para funcionalidades grandes
- ✅ Fazer push regularmente para backup
- ✅ Nunca commitar arquivos sensíveis (.env com senhas)
- ✅ Revisar mudanças antes de commitar (`git diff`)

## 🆘 Comandos Úteis

```bash
# Ver status atual
git status

# Ver diferenças
git diff

# Ver histórico gráfico
git log --graph --oneline --all

# Listar branches
git branch

# Mudar de branch
git checkout nome-da-branch

# Ver configurações
git config --list

# Buscar ajuda
git help <comando>
```

## 📖 Recursos Adicionais

- **Documentação oficial:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

