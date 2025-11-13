#!/bin/bash

# Script para conectar repositório local ao GitHub
# Execute no Git Bash

echo "========================================"
echo "CONECTANDO REPOSITORIO AO GITHUB"
echo "========================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}[ERRO] Git não está instalado!${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] Git encontrado: $(git --version)${NC}"
echo ""

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "Branch atual: $CURRENT_BRANCH"
echo ""

# Perguntar se quer renomear para main
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Deseja renomear a branch '$CURRENT_BRANCH' para 'main'? (s/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[sS]$ ]]; then
        git branch -M main
        CURRENT_BRANCH="main"
        echo -e "${GREEN}[OK] Branch renomeada para 'main'${NC}"
    fi
fi

echo ""

# Verificar se já existe remote
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}[AVISO] Remote 'origin' já existe!${NC}"
    echo "Remote atual:"
    git remote -v
    echo ""
    echo -e "${YELLOW}Deseja remover e adicionar novamente? (s/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[sS]$ ]]; then
        git remote remove origin
        echo -e "${GREEN}[OK] Remote removido${NC}"
    else
        echo "Operação cancelada."
        exit 0
    fi
fi

# Adicionar remote
GITHUB_URL="https://github.com/matheusalexanbei-oss/FSGA.git"
echo "Adicionando remote: $GITHUB_URL"
git remote add origin "$GITHUB_URL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[OK] Remote adicionado com sucesso!${NC}"
else
    echo -e "${RED}[ERRO] Falha ao adicionar remote${NC}"
    exit 1
fi

echo ""
echo "Verificando remote:"
git remote -v
echo ""

# Perguntar se quer fazer push
echo -e "${YELLOW}Deseja fazer push para o GitHub agora? (s/N)${NC}"
read -r response
if [[ "$response" =~ ^[sS]$ ]]; then
    echo ""
    echo "Fazendo push para origin/$CURRENT_BRANCH..."
    git push -u origin "$CURRENT_BRANCH"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}[OK] Push realizado com sucesso!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "Seu código está agora no GitHub:"
        echo "https://github.com/matheusalexanbei-oss/FSGA"
        echo ""
        echo "CI/CD será executado automaticamente!"
        echo "Verifique em: https://github.com/matheusalexanbei-oss/FSGA/actions"
    else
        echo ""
        echo -e "${RED}[ERRO] Falha ao fazer push${NC}"
        echo ""
        echo "Possíveis causas:"
        echo "1. Problema de autenticação (use Personal Access Token)"
        echo "2. Repositório não existe ou sem permissão"
        echo ""
        echo "Tente manualmente:"
        echo "  git push -u origin $CURRENT_BRANCH"
    fi
else
    echo ""
    echo "Push não realizado. Execute manualmente quando quiser:"
    echo "  git push -u origin $CURRENT_BRANCH"
fi

echo ""
echo "========================================"

