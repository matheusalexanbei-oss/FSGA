'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSecureAuth } from '@/hooks/useSecureAuth'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types/product'
import { toast } from 'sonner'
import { ChevronDown, Plus } from 'lucide-react'

interface CategoryInputProps {
  value?: string
  onChange: (categoryName: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CategoryInput({ value, onChange, placeholder = "Digite ou selecione uma categoria", disabled = false }: CategoryInputProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, useSupabase } = useSecureAuth()

  const loadCategories = async () => {
    if (!isAuthenticated || !user) {
      setCategories([])
      return
    }

    try {
      setIsLoading(true)

      if (useSupabase) {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true })

        if (error) {
          console.error('❌ Erro ao carregar categorias:', error)
          setCategories([])
          return
        }

        setCategories(data || [])
      } else {
        const storedCategories = localStorage.getItem(`categories_${user.id}`)
        const data: Category[] = storedCategories ? JSON.parse(storedCategories) : []
        setCategories(data || [])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error)
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [isAuthenticated, user])

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [inputValue, categories])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSelectCategory = (categoryName: string) => {
    setInputValue(categoryName)
    onChange(categoryName)
    setIsOpen(false)
  }

  const handleCreateCategory = async () => {
    if (!inputValue.trim() || !isAuthenticated || !user) return

    // Verificar se já existe
    const exists = categories.some(cat => cat.name.toLowerCase() === inputValue.trim().toLowerCase())
    if (exists) {
      toast.info('Esta categoria já existe')
      return
    }

    try {
      setIsCreating(true)

      if (useSupabase) {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: inputValue.trim(),
            description: null,
            user_id: user.id,
          })
          .select()
          .single()

        if (error) {
          console.error('❌ Erro ao criar categoria:', error)
          toast.error('Erro ao criar categoria')
          return
        }

        toast.success('Categoria criada com sucesso!')
        await loadCategories()
      } else {
        const newCategory: Category = {
          id: 'cat_' + Date.now(),
          name: inputValue.trim(),
          description: null,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }

        const storedCategories = localStorage.getItem(`categories_${user.id}`)
        const existingCategories: Category[] = storedCategories ? JSON.parse(storedCategories) : []
        const updatedCategories = [...existingCategories, newCategory]
        localStorage.setItem(`categories_${user.id}`, JSON.stringify(updatedCategories))

        toast.success('Categoria criada com sucesso!')
        await loadCategories()
      }
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error)
      toast.error('Erro ao criar categoria')
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !categories.some(cat => cat.name.toLowerCase() === inputValue.trim().toLowerCase())) {
      e.preventDefault()
      handleCreateCategory()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled || isCreating}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Carregando categorias...</div>
          ) : filteredCategories.length > 0 ? (
            <>
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category.name)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                >
                  {category.name}
                </button>
              ))}
              {inputValue.trim() && !categories.some(cat => cat.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
                <div className="border-t border-gray-200 p-2">
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isCreating}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm text-blue-600 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Criar "{inputValue.trim()}"
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-3 text-sm text-gray-500">
              {inputValue.trim() ? (
                <div className="space-y-2">
                  <div>Nenhuma categoria encontrada</div>
                  {!categories.some(cat => cat.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={isCreating}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm text-blue-600 font-medium rounded"
                    >
                      <Plus className="h-4 w-4" />
                      Criar "{inputValue.trim()}"
                    </button>
                  )}
                </div>
              ) : (
                'Digite para buscar ou criar uma categoria'
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}



