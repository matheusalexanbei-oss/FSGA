'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, Plus, Search, ArrowRight } from 'lucide-react'
import { Category } from '@/types/product'
import { toast } from 'sonner'

interface MoveCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (categoryId: string) => void
  categories: Category[]
  selectedCount: number
  onCreateCategory?: (name: string) => Promise<string | null>
}

export function MoveCategoryDialog({
  open,
  onOpenChange,
  onConfirm,
  categories,
  selectedCount,
  onCreateCategory
}: MoveCategoryDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (!open) {
      setSelectedCategory('')
      setSearchTerm('')
      setIsCreating(false)
      setNewCategoryName('')
    }
  }, [open])

  const handleConfirm = () => {
    if (!selectedCategory) {
      toast.error('Selecione uma categoria')
      return
    }
    onConfirm(selectedCategory)
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Digite um nome para a categoria')
      return
    }

    if (!onCreateCategory) return

    setLoading(true)
    try {
      const categoryId = await onCreateCategory(newCategoryName.trim())
      
      if (categoryId) {
        toast.success('Categoria criada com sucesso!')
        // Mover produtos para a nova categoria
        onConfirm(categoryId)
      } else {
        toast.error('Erro ao criar categoria')
      }
      
      setIsCreating(false)
      setNewCategoryName('')
    } catch (error) {
      toast.error('Erro ao criar categoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border shadow-xl">
        <DialogHeader>
          <DialogTitle>Mover Produtos</DialogTitle>
          <DialogDescription>
            Selecione a categoria de destino para {selectedCount} produto{selectedCount > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isCreating && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="h-[300px] rounded-md border p-2 overflow-y-auto">
                {filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Folder className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria criada ainda'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 border-2 border-blue-500 dark:bg-blue-950'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                        }`}
                      >
                        <Folder className={`h-5 w-5 ${
                          selectedCategory === category.id ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-500">{category.description}</p>
                          )}
                        </div>
                        {selectedCategory === category.id && (
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </>
          )}

          {isCreating && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Nome da Nova Categoria</Label>
                <Input
                  id="category-name"
                  placeholder="Ex: Eletrônicos, Roupas, etc."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCategory}
                  disabled={loading || !newCategoryName.trim()}
                  className="flex-1"
                >
                  Criar e Selecionar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setNewCategoryName('')
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isCreating && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedCategory}>
              Mover {selectedCount} Produto{selectedCount > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}