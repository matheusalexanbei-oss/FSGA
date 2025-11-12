'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types/user'
import { createClient } from '@/lib/supabase/client'

interface HybridAuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  useSupabase: boolean
}

export function useHybridAuth() {
  const [state, setState] = useState<HybridAuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    useSupabase: false
  })

  const checkAuth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // Primeiro, verificar se há sessão do Supabase
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session?.user && !error) {
        // Verificar se o email foi confirmado
        if (!session.user.email_confirmed_at) {
          console.log('❌ Email não confirmado:', session.user.email)
          setState({ 
            user: null, 
            loading: false, 
            isAuthenticated: false, 
            useSupabase: false 
          })
          return
        }

        // Usuário autenticado e verificado no Supabase
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
          aud: session.user.aud,
          created_at: session.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        console.log('✅ Usuário autenticado e verificado:', user.email)
        setState({ 
          user, 
          loading: false, 
          isAuthenticated: true, 
          useSupabase: true 
        })
        return
      }
      
      // Se não há sessão do Supabase, verificar localStorage
      const storedUser = localStorage.getItem('user')
      const storedAuth = localStorage.getItem('isAuthenticated')
      
      if (storedUser && storedAuth === 'true') {
        const user = JSON.parse(storedUser)
        setState({ 
          user, 
          loading: false, 
          isAuthenticated: true, 
          useSupabase: false 
        })
      } else {
        setState({ 
          user: null, 
          loading: false, 
          isAuthenticated: false, 
          useSupabase: false 
        })
      }
    } catch (err) {
      console.error('Error checking auth:', err)
      setState({ 
        user: null, 
        loading: false, 
        isAuthenticated: false, 
        useSupabase: false 
      })
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      if (isMounted) {
        await checkAuth()
      }
    }

    initializeAuth()

    const supabase = createClient()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      
      if (session?.user) {
        // Verificar se o email foi confirmado
        if (!session.user.email_confirmed_at) {
          console.log('❌ Email não confirmado no listener:', session.user.email)
          setState({ 
            user: null, 
            loading: false, 
            isAuthenticated: false, 
            useSupabase: false 
          })
          return
        }

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
          aud: session.user.aud,
          created_at: session.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        console.log('✅ Usuário autenticado via listener:', user.email)
        setState({ 
          user, 
          loading: false, 
          isAuthenticated: true, 
          useSupabase: true 
        })
      } else {
        // Verificar localStorage quando sessão do Supabase expira
        if (isMounted) {
          checkAuth()
        }
      }
    })

    return () => {
      isMounted = false
      authListener?.subscription.unsubscribe()
    }
  }, []) // Removido checkAuth da dependência para evitar loops

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // Tentar login no Supabase primeiro
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (data.user && !error) {
        // Verificar se o email foi confirmado
        if (!data.user.email_confirmed_at) {
          setState({ 
            user: null, 
            loading: false, 
            isAuthenticated: false, 
            useSupabase: false 
          })
          return { 
            success: false, 
            error: 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.' 
          }
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          app_metadata: data.user.app_metadata,
          user_metadata: data.user.user_metadata,
          aud: data.user.aud,
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        console.log('✅ Login bem-sucedido:', user.email)
        setState({ 
          user, 
          loading: false, 
          isAuthenticated: true, 
          useSupabase: true 
        })
        return { success: true }
      }
      
      // Se falhar no Supabase, usar localStorage
      const mockUser: User = {
        id: 'user_local_123',
        email,
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('isAuthenticated', 'true')
      setState({ 
        user: mockUser, 
        loading: false, 
        isAuthenticated: true, 
        useSupabase: false 
      })
      return { success: true }
    } catch (err) {
      console.error('Login error:', err)
      setState(prev => ({ ...prev, loading: false }))
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // Tentar registro no Supabase primeiro
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
      
      if (data.user && !error) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          app_metadata: data.user.app_metadata,
          user_metadata: data.user.user_metadata,
          aud: data.user.aud,
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        setState({ 
          user, 
          loading: false, 
          isAuthenticated: true, 
          useSupabase: true 
        })
        return { success: true }
      }
      
      // Se falhar no Supabase, usar localStorage
      const mockUser: User = {
        id: 'user_local_123',
        email,
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('isAuthenticated', 'true')
      setState({ 
        user: mockUser, 
        loading: false, 
        isAuthenticated: true, 
        useSupabase: false 
      })
      return { success: true }
    } catch (err) {
      console.error('Register error:', err)
      setState(prev => ({ ...prev, loading: false }))
      return { success: false, error: 'Erro ao registrar' }
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      if (state.useSupabase) {
        const supabase = createClient()
        await supabase.auth.signOut()
      }
      
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      setState({ 
        user: null, 
        loading: false, 
        isAuthenticated: false, 
        useSupabase: false 
      })
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  const simpleRequest = async (_url: string, _options?: RequestInit) => {
    // Implementação básica para compatibilidade
    return { data: null, error: null }
  }

  return { 
    ...state, 
    login, 
    register, 
    logout, 
    simpleRequest,
    checkAuth 
  }
}