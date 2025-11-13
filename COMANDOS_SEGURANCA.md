# 🔒 Comandos de Segurança Git - Passo a Passo

## 📍 ONDE EXECUTAR OS COMANDOS

**✅ CORRETO:** Terminal do VS Code (aba "Terminal" na parte inferior)
**❌ ERRADO:** PowerShell externo do Windows

### Como abrir o Terminal do VS Code:
1. Menu: `Terminal` → `New Terminal`
2. Ou pressione: `Ctrl + `` (tecla backtick, acima do Tab)
3. Ou clique em "Terminal" na barra inferior do VS Code

---

## ✅ SEQUÊNCIA DE COMANDOS

### 1. Verificar se Git está funcionando
```powershell
git --version
```
**Resultado esperado:** `git version 2.51.2.windows.1` (ou similar)

---

### 2. Remover arquivos sensíveis do Git
```powershell
git rm --cached env-setup-completo.txt env-setup.txt
```
**Resultado esperado:** 
```
rm 'env-setup-completo.txt'
rm 'env-setup.txt'
```

**Nota:** Se aparecer erro sobre `secrets.json` ou `credentials.json`, ignore. Eles não estão sendo rastreados.

---

### 3. Verificar o status
```powershell
git status
```
**Resultado esperado:** Você verá os arquivos como "deleted" (removidos do Git)

---

### 4. Adicionar o .gitignore atualizado
```powershell
git add .gitignore
```

---

### 5. Fazer commit da correção
```powershell
git commit -m "security: remove arquivos sensíveis e atualizar .gitignore"
```

---

### 6. Verificação final
```powershell
git ls-files | Select-String -Pattern "env-setup"
```
**Resultado esperado:** Nenhum resultado (vazio) = ✅ SEGURO!

---

## 🆘 TROUBLESHOOTING

### Problema: "git não é reconhecido"
**Solução:** 
- Use o terminal do VS Code (não PowerShell externo)
- Ou reinicie o VS Code
- Ou feche e abra um novo terminal no VS Code

### Problema: "fatal: pathspec 'arquivo' did not match"
**Solução:** 
- Esse arquivo não está sendo rastreado pelo Git
- Não precisa remover
- Continue com os outros arquivos

### Problema: Não sei onde está o terminal
**Solução:**
- Olhe na parte INFERIOR do VS Code
- Procure pela aba "Terminal" ou "PowerShell"
- Se não aparecer, pressione `Ctrl + ``

---

## ✅ CHECKLIST

- [ ] Terminal do VS Code aberto
- [ ] `git --version` funcionando
- [ ] Arquivos removidos com `git rm --cached`
- [ ] `git status` mostra arquivos como "deleted"
- [ ] `.gitignore` adicionado
- [ ] Commit feito
- [ ] Verificação final: nenhum arquivo sensível encontrado

---

## 📝 RESUMO RÁPIDO

Copie e cole estes comandos no terminal do VS Code, um por vez:

```powershell
# 1. Verificar Git
git --version

# 2. Remover arquivos sensíveis
git rm --cached env-setup-completo.txt env-setup.txt

# 3. Ver status
git status

# 4. Adicionar .gitignore
git add .gitignore

# 5. Fazer commit
git commit -m "security: remove arquivos sensíveis e atualizar .gitignore"

# 6. Verificar (deve retornar vazio)
git ls-files | Select-String -Pattern "env-setup"
```

**Se o último comando não retornar nada, está tudo seguro! ✅**

