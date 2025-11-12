#!/usr/bin/env node

/**
 * Script de Migração para Supabase
 * Este script ajuda a migrar dados do localStorage para o Supabase
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 INICIANDO MIGRAÇÃO PARA SUPABASE')
console.log('=====================================')

// Verificar se existe arquivo .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env.local não encontrado!')
  console.log('📝 Criando arquivo de exemplo...')
  
  const envContent = `# Configurações do Claude API
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui

# Configurações do Supabase (SUBSTITUA PELOS SEUS VALORES)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# Configurações opcionais
NEXT_PUBLIC_APP_URL=http://localhost:3000
`
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Arquivo .env.local criado!')
  console.log('⚠️  IMPORTANTE: Edite o arquivo .env.local com suas chaves do Supabase')
}

// Verificar estrutura de pastas
const srcPath = path.join(process.cwd(), 'src')
const hooksPath = path.join(srcPath, 'hooks')
const componentsPath = path.join(srcPath, 'components')

console.log('\n📁 Verificando estrutura de arquivos...')

if (!fs.existsSync(hooksPath)) {
  console.log('❌ Pasta src/hooks não encontrada')
  process.exit(1)
}

if (!fs.existsSync(componentsPath)) {
  console.log('❌ Pasta src/components não encontrada')
  process.exit(1)
}

console.log('✅ Estrutura de pastas OK')

// Verificar se os novos arquivos foram criados
const supabaseAuthFile = path.join(hooksPath, 'useSupabaseAuth.ts')
const migrationBannerFile = path.join(componentsPath, 'MigrationBanner.tsx')

console.log('\n📄 Verificando arquivos de migração...')

if (!fs.existsSync(supabaseAuthFile)) {
  console.log('❌ Arquivo useSupabaseAuth.ts não encontrado')
  console.log('📝 Execute o comando de migração novamente')
  process.exit(1)
}

if (!fs.existsSync(migrationBannerFile)) {
  console.log('❌ Arquivo MigrationBanner.tsx não encontrado')
  console.log('📝 Execute o comando de migração novamente')
  process.exit(1)
}

console.log('✅ Arquivos de migração encontrados')

// Verificar migrações do Supabase
const supabasePath = path.join(process.cwd(), 'supabase')
const migrationsPath = path.join(supabasePath, 'migrations')

console.log('\n🗄️ Verificando migrações do Supabase...')

if (!fs.existsSync(supabasePath)) {
  console.log('❌ Pasta supabase não encontrada')
  process.exit(1)
}

if (!fs.existsSync(migrationsPath)) {
  console.log('❌ Pasta supabase/migrations não encontrada')
  process.exit(1)
}

const initialSchemaFile = path.join(migrationsPath, '20250116000001_initial_schema.sql')
if (!fs.existsSync(initialSchemaFile)) {
  console.log('❌ Arquivo de migração inicial não encontrado')
  process.exit(1)
}

console.log('✅ Migrações do Supabase encontradas')

console.log('\n🎉 MIGRAÇÃO PREPARADA COM SUCESSO!')
console.log('=====================================')
console.log('')
console.log('📋 PRÓXIMOS PASSOS:')
console.log('')
console.log('1. 📝 Configure suas chaves do Supabase no arquivo .env.local')
console.log('2. 🌐 Acesse https://supabase.com e crie um projeto')
console.log('3. 📊 Execute as migrações no SQL Editor do Supabase')
console.log('4. 🗄️ Configure o Storage para imagens')
console.log('5. 🚀 Reinicie o servidor: npm run dev')
console.log('6. 🔄 Faça login e migre seus dados')
console.log('')
console.log('📖 Guia completo: MIGRACAO_SUPABASE_GUIA.md')
console.log('')
console.log('✅ Tudo pronto para a migração!')


