'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSecureAuth } from '@/hooks/useSecureAuth'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types/product'
import { toast } from 'sonner'

interface CategorySelectProps {
  value?: string
  onChange: (categoryId: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CategorySelect({ value, onChange, placeholder = "Selecione uma categoria", disabled = false }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const { user, isAuthenticated, useSupabase } = useSecureAuth()

  const loadCategories = async () => {
    if (!isAuthenticated || !user) {
      console.log('🔍 Usuário não autenticado, pulando carregamento de categorias')
      setCategories([])
      return
    }

    try {
      setIsLoading(true)
      console.log('🔍 Carregando categorias...')

      if (useSupabase) {
        // Carregar do Supabase
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('❌ Erro ao carregar categorias do Supabase:', error)
          toast.error('Erro ao carregar categorias')
          setCategories([])
          return
        }

        setCategories(data || [])
        console.log('✅ Categorias carregadas do Supabase:', data?.length || 0)
      } else {
        // Carregar do localStorage
        const storedCategories = localStorage.getItem(`categories_${user.id}`)
        const data: Category[] = storedCategories ? JSON.parse(storedCategories) : []

        setCategories(data || [])
        console.log('✅ Categorias carregadas do localStorage:', data?.length || 0)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error)
      toast.error('Erro ao carregar categorias')
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const createCategory = async (name: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setIsCreating(true)
      console.log('🔍 Criando categoria...')

      if (useSupabase) {
        // Criar no Supabase
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: name.trim(),
            description: null,
            user_id: user.id,
          })
          .select()
          .single()

        if (error) {
          console.error('❌ Erro ao criar categoria no Supabase:', error)
          toast.error('Erro ao criar categoria: ' + error.message)
          return
        }

        console.log('✅ Categoria criada no Supabase:', data)
        toast.success('Categoria criada com sucesso!')

        // Recarregar lista de categorias
        await loadCategories()

        // Selecionar a nova categoria
        onChange(data.id)

      } else {
        // Criar no localStorage
        const newCategory: Category = {
          id: 'cat_' + Date.now(),
          name: name.trim(),
          description: null,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }

        // Carregar categorias existentes
        const storedCategories = localStorage.getItem(`categories_${user.id}`)
        const existingCategories: Category[] = storedCategories ? JSON.parse(storedCategories) : []

        // Adicionar nova categoria
        const updatedCategories = [...existingCategories, newCategory]

        // Salvar no localStorage
        localStorage.setItem(`categories_${user.id}`, JSON.stringify(updatedCategories))

        console.log('✅ Categoria criada no localStorage:', newCategory)
        toast.success('Categoria criada com sucesso!')

        // Recarregar lista de categorias
        await loadCategories()

        // Selecionar a nova categoria
        onChange(newCategory.id)
      }

      // Limpar formulário
      setNewCategoryName('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error)
      toast.error('Erro ao criar categoria')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Nome da categoria é obrigatório')
      return
    }

    createCategory(newCategoryName)
  }

  useEffect(() => {
    loadCategories()
  }, [isAuthenticated, user])

  const selectedCategory = categories.find(cat => cat.id === value)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <select
          id="category"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || disabled}
        >
          <option value="">{isLoading ? 'Carregando...' : placeholder}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {!showCreateForm ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading || disabled}
        >
          + Criar nova categoria
        </Button>
      ) : (
        <div className="space-y-3 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="newCategoryName">Nome da nova categoria</Label>
            <Input
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Digite o nome da categoria"
              disabled={isCreating || disabled}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={isCreating || !newCategoryName.trim() || disabled}
              size="sm"
            >
              {isCreating ? 'Criando...' : 'Criar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateForm(false)
                setNewCategoryName('')
              }}
              disabled={isCreating || disabled}
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {selectedCategory && (
        <div className="text-sm text-gray-600">
          Categoria selecionada: <strong>{selectedCategory.name}</strong>
        </div>
      )}
    </div>
  )
}