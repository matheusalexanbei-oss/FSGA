#!/bin/bash

# Script para verificar status do Git

echo "========================================"
echo "VERIFICACAO DO STATUS DO GIT"
echo "========================================"
echo ""

# Verificar branch atual
echo "1. Branch atual:"
git branch --show-current
echo ""

# Verificar status
echo "2. Status do repositório:"
git status
echo ""

# Verificar últimos commits
echo "3. Últimos 3 commits:"
git log --oneline -3
echo ""

# Verificar remote
echo "4. Repositório remoto configurado:"
git remote -v
echo ""

# Verificar se há commits não enviados
echo "5. Commits não enviados (ahead):"
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "none")

if [ "$REMOTE" != "none" ]; then
    git rev-list --left-right --count @...@{u} 2>/dev/null || echo "Não foi possível comparar"
else
    echo "Nenhum remote configurado ou branch não está rastreando remote"
fi

echo ""
echo "========================================"

