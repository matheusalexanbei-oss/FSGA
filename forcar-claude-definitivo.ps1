# Script definitivo para forcar Claude
Write-Host "=== FORCANDO CLAUDE DEFINITIVAMENTE ===" -ForegroundColor Red

# Parar todos os processos do Cursor
Write-Host "Parando processos do Cursor..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*cursor*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Aguardar um pouco
Start-Sleep -Seconds 3

# Definir variaveis de ambiente do sistema
Write-Host "Definindo variaveis de ambiente..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("CURSOR_AI_MODEL", "claude-3.5-sonnet", "Machine")
[Environment]::SetEnvironmentVariable("CURSOR_AI_PROVIDER", "anthropic", "Machine")
[Environment]::SetEnvironmentVariable("CURSOR_AI_AUTO_SELECT", "false", "Machine")
[Environment]::SetEnvironmentVariable("CURSOR_FORCE_CLAUDE", "true", "Machine")

# Definir para o usuario atual tambem
[Environment]::SetEnvironmentVariable("CURSOR_AI_MODEL", "claude-3.5-sonnet", "User")
[Environment]::SetEnvironmentVariable("CURSOR_AI_PROVIDER", "anthropic", "User")
[Environment]::SetEnvironmentVariable("CURSOR_AI_AUTO_SELECT", "false", "User")
[Environment]::SetEnvironmentVariable("CURSOR_FORCE_CLAUDE", "true", "User")

Write-Host "=== CONFIGURACOES APLICADAS ===" -ForegroundColor Green
Write-Host "1. Reinicie o Cursor completamente" -ForegroundColor Cyan
Write-Host "2. Se ainda nao funcionar, use sua API key do Claude" -ForegroundColor Yellow
Write-Host "3. Comando: `$env:ANTHROPIC_API_KEY='sua-chave-aqui'" -ForegroundColor Magenta
