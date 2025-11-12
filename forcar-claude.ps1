# Script para forcar o Cursor a usar Claude
Write-Host "Forcando Cursor a usar Claude..." -ForegroundColor Yellow

# Definir variaveis de ambiente
$env:CURSOR_AI_MODEL = "claude-3.5-sonnet"
$env:CURSOR_AI_PROVIDER = "anthropic"
$env:CURSOR_AI_AUTO_SELECT = "false"

# Definir permanentemente
[Environment]::SetEnvironmentVariable("CURSOR_AI_MODEL", "claude-3.5-sonnet", "User")
[Environment]::SetEnvironmentVariable("CURSOR_AI_PROVIDER", "anthropic", "User")
[Environment]::SetEnvironmentVariable("CURSOR_AI_AUTO_SELECT", "false", "User")

Write-Host "Configuracoes aplicadas!" -ForegroundColor Green
Write-Host "Reinicie o Cursor para aplicar as mudancas" -ForegroundColor Cyan
Write-Host "Se ainda nao funcionar, use sua API key do Claude" -ForegroundColor Yellow