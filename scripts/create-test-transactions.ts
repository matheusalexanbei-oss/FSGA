/**
 * Script para criar transações de teste para validação do sistema de notificações
 * 
 * Uso:
 *   tsx scripts/create-test-transactions.ts
 * 
 * Ou execute no SQL Editor do Supabase:
 *   SELECT create_test_notifications('seu-user-id-aqui');
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TestTransaction {
  user_id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  scheduled_date: string
  is_paid: boolean
  is_recurring?: boolean
  recurring_interval?: 'weekly' | 'monthly' | 'quarterly'
  payment_method?: string
  notes?: string
}

/**
 * Criar transações de teste para um usuário
 */
async function createTestTransactions(userId: string) {
  console.log('🔔 Criando transações de teste para usuário:', userId)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calcular datas para testes
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)
  
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)
  
  const fifteenDaysLater = new Date(today)
  fifteenDaysLater.setDate(today.getDate() + 15)
  
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  const fiveDaysAgo = new Date(today)
  fiveDaysAgo.setDate(today.getDate() - 5)

  const testTransactions: TestTransaction[] = [
    // Notificação hoje (dia da transação)
    {
      user_id: userId,
      type: 'income',
      amount: 500.00,
      description: 'Receita de venda - Hoje',
      scheduled_date: today.toISOString().split('T')[0],
      is_paid: false,
      payment_method: 'PIX'
    },
    
    // Notificação amanhã (1 dia antes)
    {
      user_id: userId,
      type: 'expense',
      amount: 150.00,
      description: 'Despesa com fornecedor - Amanhã',
      scheduled_date: tomorrow.toISOString().split('T')[0],
      is_paid: false,
      payment_method: 'Cartão'
    },
    
    // Notificação em 3 dias (3 dias antes)
    {
      user_id: userId,
      type: 'income',
      amount: 1000.00,
      description: 'Receita recorrente - 3 dias',
      scheduled_date: threeDaysLater.toISOString().split('T')[0],
      is_paid: false,
      is_recurring: true,
      recurring_interval: 'monthly',
      payment_method: 'PIX'
    },
    
    // Transação futura (7 dias) - não deve aparecer hoje
    {
      user_id: userId,
      type: 'expense',
      amount: 300.00,
      description: 'Despesa futura - 7 dias',
      scheduled_date: sevenDaysLater.toISOString().split('T')[0],
      is_paid: false,
      payment_method: 'Dinheiro'
    },
    
    // Transação futura (15 dias) - não deve aparecer hoje
    {
      user_id: userId,
      type: 'income',
      amount: 2000.00,
      description: 'Receita futura - 15 dias',
      scheduled_date: fifteenDaysLater.toISOString().split('T')[0],
      is_paid: false,
      payment_method: 'PIX'
    },
    
    // Transação vencida (ontem)
    {
      user_id: userId,
      type: 'expense',
      amount: 250.00,
      description: 'Despesa vencida - Ontem',
      scheduled_date: yesterday.toISOString().split('T')[0],
      is_paid: false,
      payment_method: 'Cartão'
    },
    
    // Transação vencida (5 dias atrás)
    {
      user_id: userId,
      type: 'income',
      amount: 800.00,
      description: 'Receita vencida - 5 dias atrás',
      scheduled_date: fiveDaysAgo.toISOString().split('T')[0],
      is_paid: false,
      payment_method: 'PIX'
    },
    
    // Transação já paga (não deve aparecer)
    {
      user_id: userId,
      type: 'income',
      amount: 600.00,
      description: 'Receita paga - Hoje',
      scheduled_date: today.toISOString().split('T')[0],
      is_paid: true,
      payment_method: 'PIX'
    },
    
    // Transação recorrente mensal
    {
      user_id: userId,
      type: 'expense',
      amount: 400.00,
      description: 'Assinatura mensal - Recorrente',
      scheduled_date: tomorrow.toISOString().split('T')[0],
      is_paid: false,
      is_recurring: true,
      recurring_interval: 'monthly',
      payment_method: 'Cartão',
      notes: 'Assinatura mensal de serviço'
    }
  ]

  console.log('📝 Criando', testTransactions.length, 'transações de teste...')

  const results = []
  for (const transaction of testTransactions) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert(transaction)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar transação:', transaction.description, error.message)
        results.push({ success: false, transaction: transaction.description, error: error.message })
      } else {
        console.log('✅ Transação criada:', transaction.description, '- Data:', transaction.scheduled_date)
        results.push({ success: true, transaction: transaction.description, id: data.id })
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao criar transação:', transaction.description, error)
      results.push({ success: false, transaction: transaction.description, error: String(error) })
    }
  }

  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length

  console.log('\n📊 Resumo:')
  console.log('✅ Transações criadas com sucesso:', successCount)
  console.log('❌ Transações com erro:', errorCount)

  return results
}

/**
 * Função principal
 */
async function main() {
  const userId = process.argv[2]

  if (!userId) {
    console.error('❌ Erro: É necessário fornecer o user_id como argumento')
    console.log('Uso: tsx scripts/create-test-transactions.ts <user-id>')
    console.log('\nExemplo:')
    console.log('  tsx scripts/create-test-transactions.ts f2131ae5-acb5-41d2-99d4-4e86166c87be')
    process.exit(1)
  }

  try {
    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError || !user) {
      console.error('❌ Erro: Usuário não encontrado:', userId)
      process.exit(1)
    }

    console.log('✅ Usuário encontrado:', user.user.email)

    // Criar transações de teste
    await createTestTransactions(userId)

    console.log('\n🎉 Transações de teste criadas com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Verifique as notificações no app (badge deve mostrar apenas notificações de hoje)')
    console.log('2. Abra o dropdown de notificações para ver todas as próximas')
    console.log('3. Verifique os logs do console para depuração')
  } catch (error) {
    console.error('❌ Erro ao executar script:', error)
    process.exit(1)
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main()
}

export { createTestTransactions }

