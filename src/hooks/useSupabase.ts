'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function useSupabase() {
  const [supabase, setSupabase] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
    } catch (error) {
      console.error('Erro ao inicializar cliente Supabase:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { supabase, isLoading }
}

