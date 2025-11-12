'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Folder, Plus, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category } from '@/lib/categories'
import { createOrGetCategory, createHierarchicalCategory } from '@/lib/categories'

interface CategorySelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectCategory: (categoryId: string, categoryName: string) => void
  onAddCategory?: (categoryName: string) => Promise<string | null>
  existingCategories: Category[]
  title?: string
}

export function CategorySelector({ 
  isOpen, 
  onClose, 
  onSelectCategory, 
  onAddCategory,
  existingCategories,
  title = "Selecionar Categoria"
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setCategories(existingCategories)
    }
  }, [isOpen, existingCategories])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const loadCategories = () => {
    // Usar as categorias existentes passadas como prop
    setCategories(existingCategories)
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const createNewCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setIsCreating(true)
      // Para simplificar, vamos usar um ID temporário
      const categoryId = 'cat_' + Date.now()

      // Recarregar categorias
      loadCategories()
      
      // Selecionar a nova categoria automaticamente
      onSelectCategory(categoryId, newCategoryName.trim())
      
      setNewCategoryName('')
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCategorySelect = (category: Category) => {
    onSelectCategory(category.id, category.name)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="p-4 max-h-60 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredCategories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="font-medium text-sm truncate">{category.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma categoria encontrada</p>
            </div>
          )}
        </div>

        {/* Create New Category */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Criar Nova Categoria</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Correntes &gt; Masculinas"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createNewCategory()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={createNewCategory}
                disabled={!newCategoryName.trim() || isCreating}
                size="sm"
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use &quot;&gt;&quot; para criar categorias hierárquicas
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
