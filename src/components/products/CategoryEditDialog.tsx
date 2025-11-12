'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CategoryEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  onConfirm: (newName: string) => void
}

export function CategoryEditDialog({ open, onOpenChange, currentName, onConfirm }: CategoryEditDialogProps) {
  const [newName, setNewName] = useState(currentName)

  // Atualizar o nome quando currentName mudar ou quando o dialog abrir
  useEffect(() => {
    if (open) {
      setNewName(currentName)
    }
  }, [currentName, open])

  const handleConfirm = () => {
    if (newName.trim() && newName.trim() !== currentName) {
      onConfirm(newName.trim())
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setNewName(currentName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Digite o novo nome da categoria
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome da Categoria</Label>
            <Input
              id="category-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Digite o nome da categoria"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!newName.trim() || newName.trim() === currentName}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


