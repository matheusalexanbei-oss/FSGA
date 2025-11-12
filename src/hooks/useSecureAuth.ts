'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types/user'
import { createClient } from '@/lib/supabase/client'

interface SecureAuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  useSupabase: boolean
}

export function useSecureAuth() {
  const [state, setState] = useState<SecureAuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    useSupabase: false
  })

  const checkAuth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // Verificar se há sessão do Supabase
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
      
      // Se não há sessão válida, usuário não está autenticado
      setState({ 
        user: null, 
        loading: false, 
        isAuthenticated: false, 
        useSupabase: false 
      })
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
    checkAuth()

    const supabase = createClient()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
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
        // Usuário não está autenticado
        setState({ 
          user: null, 
          loading: false, 
          isAuthenticated: false, 
          useSupabase: false 
        })
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // Tentar login no Supabase
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
      
      // Se falhar no Supabase, não permitir login
      setState({ 
        user: null, 
        loading: false, 
        isAuthenticated: false, 
        useSupabase: false 
      })
      
      return { 
        success: false, 
        error: error?.message || 'Erro ao fazer login. Verifique suas credenciais.' 
      }
    } catch (err) {
      console.error('Login error:', err)
      setState(prev => ({ ...prev, loading: false }))
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  const register = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: false, error: error.message }
      }

      if (data.user) {
        setState(prev => ({ ...prev, loading: false }))
        return { 
          success: true, 
          message: 'Conta criada com sucesso! Verifique seu email para confirmar a conta.' 
        }
      }

      setState(prev => ({ ...prev, loading: false }))
      return { success: false, error: 'Erro ao criar conta' }
    } catch (err) {
      console.error('Register error:', err)
      setState(prev => ({ ...prev, loading: false }))
      return { success: false, error: 'Erro ao criar conta' }
    }
  }

  const logout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setState({ 
        user: null, 
        loading: false, 
        isAuthenticated: false, 
        useSupabase: false 
      })
      return { success: true }
    } catch (err) {
      console.error('Logout error:', err)
      return { success: false, error: 'Erro ao fazer logout' }
    }
  }

  return {
    ...state,
    login,
    register,
    logout,
    checkAuth
  }
}



