# Script para inicializar o repositorio Git
# Execute este script APOS instalar o Git

Write-Host "Inicializando repositorio Git..." -ForegroundColor Cyan

# Verificar se Git esta instalado
try {
    $gitVersion = git --version
    Write-Host "[OK] Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Git nao esta instalado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Git primeiro:" -ForegroundColor Yellow
    Write-Host "   https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Consulte o arquivo GUIA_GIT.md para instrucoes detalhadas" -ForegroundColor Yellow
    exit 1
}

# Verificar se ja existe um repositorio Git
if (Test-Path .git) {
    Write-Host "[AVISO] Repositorio Git ja inicializado!" -ForegroundColor Yellow
    $response = Read-Host "Deseja continuar mesmo assim? (s/N)"
    if ($response -ne "s" -and $response -ne "S") {
        exit 0
    }
} else {
    # Inicializar repositorio
    Write-Host "Inicializando repositorio..." -ForegroundColor Cyan
    git init
    Write-Host "[OK] Repositorio inicializado!" -ForegroundColor Green
}

# Verificar configuracao do usuario
Write-Host ""
Write-Host "Verificando configuracao do Git..." -ForegroundColor Cyan
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "[AVISO] Configuracao do Git nao encontrada!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor, configure seu nome e email:" -ForegroundColor Yellow
    Write-Host "  git config --global user.name 'Seu Nome'" -ForegroundColor Gray
    Write-Host "  git config --global user.email 'seu.email@exemplo.com'" -ForegroundColor Gray
    Write-Host ""
    $configure = Read-Host "Deseja configurar agora? (s/N)"
    
    if ($configure -eq "s" -or $configure -eq "S") {
        $name = Read-Host "Digite seu nome"
        $email = Read-Host "Digite seu email"
        git config --global user.name $name
        git config --global user.email $email
        Write-Host "[OK] Configuracao salva!" -ForegroundColor Green
    }
} else {
    Write-Host "[OK] Usuario: $userName <$userEmail>" -ForegroundColor Green
}

# Adicionar arquivos
Write-Host ""
Write-Host "Adicionando arquivos ao repositorio..." -ForegroundColor Cyan
git add .

# Verificar se ha algo para commitar
$status = git status --porcelain
if (-not $status) {
    Write-Host "[INFO] Nenhuma mudanca para commitar." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "[OK] Repositorio Git configurado com sucesso!" -ForegroundColor Green
    exit 0
}

# Mostrar status
Write-Host ""
Write-Host "Status do repositorio:" -ForegroundColor Cyan
git status --short

# Fazer commit inicial
Write-Host ""
$commitMessage = "feat: commit inicial do projeto Fullstack Gestor AI"
Write-Host "Criando commit inicial..." -ForegroundColor Cyan
Write-Host "   Mensagem: $commitMessage" -ForegroundColor Gray

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Commit criado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Crie um repositorio no GitHub/GitLab" -ForegroundColor Yellow
    Write-Host "   2. Conecte com: git remote add origin <URL_DO_REPOSITORIO>" -ForegroundColor Yellow
    Write-Host "   3. Envie o codigo: git push -u origin main" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Consulte GUIA_GIT.md para mais informacoes" -ForegroundColor Cyan
} else {
    Write-Host "[ERRO] Erro ao criar commit!" -ForegroundColor Red
    exit 1
}

