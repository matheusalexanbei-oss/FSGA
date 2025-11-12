'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types/user'

interface LocalAuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useLocalAuth() {
  const [state, setState] = useState<LocalAuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  })

  const checkAuth = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedAuth = localStorage.getItem('isAuthenticated')
      
      if (storedUser && storedAuth === 'true') {
        const user = JSON.parse(storedUser)
        setState({ user, loading: false, isAuthenticated: true })
      } else {
        setState({ user: null, loading: false, isAuthenticated: false })
      }
    } catch (error) {
      console.error('Error checking local auth:', error)
      setState({ user: null, loading: false, isAuthenticated: false })
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    // Simular autenticação local
    const mockUser: User = {
      id: 'user_local_123', // ID consistente para localStorage
      email,
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('isAuthenticated', 'true')
      setState({ user: mockUser, loading: false, isAuthenticated: true })
      return { success: true }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    // Simular registro local
    const mockUser: User = {
      id: 'user_local_123', // ID consistente para localStorage
      email,
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('isAuthenticated', 'true')
      setState({ user: mockUser, loading: false, isAuthenticated: true })
      return { success: true }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      return { success: false, error: 'Erro ao registrar' }
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      setState({ user: null, loading: false, isAuthenticated: false })
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Função para fazer requisições simples (para compatibilidade)
  const simpleRequest = async (url: string, options?: RequestInit) => {
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