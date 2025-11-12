'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FolderPlus } from 'lucide-react'

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => Promise<void>
}

export function CreateCategoryDialog({ open, onOpenChange, onCreate }: CreateCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!categoryName.trim()) return
    
    setIsLoading(true)
    try {
      await onCreate(categoryName.trim())
      setCategoryName('')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-950/30 p-2">
              <FolderPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-xl">Nova Categoria</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Digite o nome da nova categoria
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome da Categoria</Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ex: Eletrônicos, Roupas, etc."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!categoryName.trim() || isLoading}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



