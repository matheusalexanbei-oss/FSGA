'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryName: string
  onConfirm: () => void
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  categoryName,
  onConfirm
}: DeleteCategoryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">Confirmar Exclusão</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tem certeza que deseja excluir a categoria <strong>"{categoryName}"</strong>?
            <br />
            <span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}



