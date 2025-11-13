# Script para verificar e corrigir segurança do Git
# Verifica se há arquivos sensíveis sendo rastreados

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICACAO DE SEGURANCA GIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "[OK] Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Git nao esta instalado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Git primeiro." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Verificando arquivos rastreados..." -ForegroundColor Cyan
Write-Host ""

# Verificar arquivos .env
Write-Host "1. Verificando arquivos .env..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String "\.env"
if ($envFiles) {
    Write-Host "[ALERTA] Arquivos .env encontrados sendo rastreados:" -ForegroundColor Red
    $envFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $hasEnvFiles = $true
} else {
    Write-Host "[OK] Nenhum arquivo .env sendo rastreado" -ForegroundColor Green
    $hasEnvFiles = $false
}

Write-Host ""

# Verificar arquivos de setup
Write-Host "2. Verificando arquivos env-setup..." -ForegroundColor Yellow
$setupFiles = git ls-files | Select-String "env-setup"
if ($setupFiles) {
    Write-Host "[ALERTA] Arquivos env-setup encontrados sendo rastreados:" -ForegroundColor Red
    $setupFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $hasSetupFiles = $true
} else {
    Write-Host "[OK] Nenhum arquivo env-setup sendo rastreado" -ForegroundColor Green
    $hasSetupFiles = $false
}

Write-Host ""

# Verificar outros arquivos sensíveis
Write-Host "3. Verificando outros arquivos sensiveis..." -ForegroundColor Yellow
$sensitiveFiles = git ls-files | Select-String -Pattern "key|secret|password|credential|\.pem|\.key" -CaseSensitive:$false
if ($sensitiveFiles) {
    Write-Host "[ALERTA] Arquivos sensiveis encontrados:" -ForegroundColor Red
    $sensitiveFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $hasSensitiveFiles = $true
} else {
    Write-Host "[OK] Nenhum outro arquivo sensivel sendo rastreado" -ForegroundColor Green
    $hasSensitiveFiles = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Resumo
if ($hasEnvFiles -or $hasSetupFiles -or $hasSensitiveFiles) {
    Write-Host "[RESULTADO] ATENCAO: Arquivos sensiveis encontrados!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Acoes recomendadas:" -ForegroundColor Yellow
    Write-Host "1. Remover arquivos do Git: git rm --cached <arquivo>" -ForegroundColor Gray
    Write-Host "2. Verificar se .gitignore esta atualizado" -ForegroundColor Gray
    Write-Host "3. Fazer commit da remoção: git commit -m 'security: remove arquivos sensiveis'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Consulte SEGURANCA_GIT.md para instrucoes detalhadas" -ForegroundColor Cyan
    
    # Oferecer remoção automática
    Write-Host ""
    $remove = Read-Host "Deseja remover automaticamente os arquivos sensiveis do Git? (s/N)"
    if ($remove -eq "s" -or $remove -eq "S") {
        Write-Host ""
        Write-Host "Removendo arquivos sensiveis..." -ForegroundColor Cyan
        
        if ($hasEnvFiles) {
            $envFiles | ForEach-Object {
                Write-Host "Removendo: $_" -ForegroundColor Yellow
                git rm --cached $_ 2>$null
            }
        }
        
        if ($hasSetupFiles) {
            $setupFiles | ForEach-Object {
                Write-Host "Removendo: $_" -ForegroundColor Yellow
                git rm --cached $_ 2>$null
            }
        }
        
        Write-Host ""
        Write-Host "[OK] Arquivos removidos do Git (mas mantidos localmente)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Cyan
        Write-Host "1. Verifique: git status" -ForegroundColor Yellow
        Write-Host "2. Adicione .gitignore: git add .gitignore" -ForegroundColor Yellow
        Write-Host "3. Faca commit: git commit -m 'security: remove arquivos sensiveis'" -ForegroundColor Yellow
    }
} else {
    Write-Host "[RESULTADO] SEGURO: Nenhum arquivo sensivel sendo rastreado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Seu repositorio esta seguro. Pode fazer commit e push com tranquilidade." -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

