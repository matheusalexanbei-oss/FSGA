import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Permite injetar um cliente mockado durante testes automatizados
 * Define no escopo global (Node) a propriedade __TEST_SUPABASE_CLIENT__
 */
function getMockedClient() {
  if (typeof globalThis !== 'undefined' && '__TEST_SUPABASE_CLIENT__' in globalThis) {
    const client = (globalThis as any).__TEST_SUPABASE_CLIENT__
    if (client) {
      return client
    }
  }
  return null
}

/**
 * Cliente Supabase para uso em Client Components
 * Este cliente usa cookies do navegador automaticamente
 */
export function createClient() {
  const mocked = getMockedClient()
  if (mocked) {
    return mocked
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}



