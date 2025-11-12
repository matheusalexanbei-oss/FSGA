# Script para configurar Claude API completamente
Write-Host "🚀 Configurando Claude API..." -ForegroundColor Green

# Verificar se a chave está configurada
$apiKey = $env:ANTHROPIC_API_KEY
if (-not $apiKey) {
    Write-Host "❌ ANTHROPIC_API_KEY não encontrada!" -ForegroundColor Red
    Write-Host "💡 Configure com:" -ForegroundColor Yellow
    Write-Host '$env:ANTHROPIC_API_KEY="sk-ant-sua-chave-aqui"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Digite sua chave da API Claude:" -ForegroundColor Yellow
    $userKey = Read-Host
    if ($userKey) {
        $env:ANTHROPIC_API_KEY = $userKey
        Write-Host "✅ Chave configurada para esta sessão!" -ForegroundColor Green
    }
}

# Testar conexão
Write-Host "🔄 Testando conexão com Claude..." -ForegroundColor Yellow
node test-claude-real.js

# Verificar se o servidor está rodando
Write-Host ""
Write-Host "🔄 Iniciando servidor de desenvolvimento..." -ForegroundColor Yellow
Write-Host "💡 Acesse: http://localhost:3000/products/new?ai=true" -ForegroundColor Cyan
Write-Host "💡 Teste o upload de uma imagem de produto!" -ForegroundColor Cyan

# Iniciar servidor
npm run dev









