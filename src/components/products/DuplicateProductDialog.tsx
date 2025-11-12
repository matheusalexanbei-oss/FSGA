'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Edit2, Hash, PackagePlus } from 'lucide-react'
import type { Product } from '@/types/product'

interface DuplicateProductDialogProps {
  isOpen: boolean
  existingProduct: Product
  newProductName: string
  newProductStock: number
  newProductPrice?: number
  onOptionSelected: (option: 'change-name' | 'add-code' | 'merge-stock', data?: { name?: string; code?: string }) => void
  onCancel: () => void
}

export function DuplicateProductDialog({
  isOpen,
  existingProduct,
  newProductName,
  newProductStock,
  newProductPrice,
  onOptionSelected,
  onCancel,
}: DuplicateProductDialogProps) {
  const [selectedOption, setSelectedOption] = useState<'change-name' | 'add-code' | 'merge-stock' | null>(null)
  const [newName, setNewName] = useState(newProductName)
  const [newCode, setNewCode] = useState('')

  const handleConfirm = () => {
    if (selectedOption === 'change-name' && newName.trim()) {
      onOptionSelected('change-name', { name: newName.trim() })
    } else if (selectedOption === 'add-code' && newCode.trim()) {
      onOptionSelected('add-code', { code: newCode.trim() })
    } else if (selectedOption === 'merge-stock') {
      onOptionSelected('merge-stock')
    }
  }

  const handleCancel = () => {
    setSelectedOption(null)
    setNewName(newProductName)
    setNewCode('')
    onCancel()
  }

  const canConfirm = () => {
    if (selectedOption === 'change-name') {
      return newName.trim().length > 0 && newName.trim() !== existingProduct.name
    }
    if (selectedOption === 'add-code') {
      return newCode.trim().length > 0
    }
    if (selectedOption === 'merge-stock') {
      return true
    }
    return false
  }

  // Não renderizar se não houver produto existente ou se não estiver aberto
  if (!existingProduct || !isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" 
        style={{ zIndex: 99999, position: 'fixed' }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Produto com nome duplicado</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Já existe um produto cadastrado com o nome <strong>"{existingProduct.name}"</strong>.
            Escolha uma das opções abaixo:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Produto existente */}
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium mb-1">Produto existente:</p>
            <p className="text-sm text-muted-foreground">
              <strong>{existingProduct.name}</strong>
              {existingProduct.code && <span className="ml-2">({existingProduct.code})</span>}
            </p>
            <div className="flex gap-3 mt-1">
              <p className="text-xs text-muted-foreground">
                Estoque: {existingProduct.stock_quantity} unidades
              </p>
              <p className="text-xs text-muted-foreground">
                Preço: R$ {existingProduct.price?.toFixed(2) || '0,00'}
              </p>
            </div>
          </div>

          {/* Produto novo */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium mb-1 text-blue-900 dark:text-blue-100">Produto novo:</p>
            <p className="text-sm">
              <strong className="text-blue-900 dark:text-blue-100">{newProductName}</strong>
            </p>
            <div className="flex gap-3 mt-1">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Estoque: {newProductStock} unidades
              </p>
              {newProductPrice !== undefined && (
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Preço: R$ {newProductPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Warning de preço diferente */}
          {newProductPrice !== undefined && existingProduct.price && newProductPrice !== existingProduct.price && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Atenção: Preços diferentes!</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Os produtos têm valores diferentes. Ao escolher "Adicionar ao produto existente", o preço do produto já cadastrado será mantido.
                </p>
              </div>
            </div>
          )}

          {/* Opções */}
          <div className="space-y-3">
            {/* Opção 1: Mudar nome */}
            <label
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedOption === 'change-name'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="duplicate-option"
                value="change-name"
                checked={selectedOption === 'change-name'}
                onChange={() => setSelectedOption('change-name')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Edit2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">1. Mudar o nome do produto</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Renomeie o produto que está sendo cadastrado para evitar duplicação
                </p>
                {selectedOption === 'change-name' && (
                  <div className="mt-2">
                    <Label htmlFor="new-name" className="text-xs">Novo nome:</Label>
                    <Input
                      id="new-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Digite o novo nome"
                      className="mt-1"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </label>

            {/* Opção 2: Adicionar código */}
            <label
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedOption === 'add-code'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="duplicate-option"
                value="add-code"
                checked={selectedOption === 'add-code'}
                onChange={() => setSelectedOption('add-code')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4 text-primary" />
                  <span className="font-medium">2. Adicionar um código</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adicione um código único para permitir produtos com mesmo nome e códigos diferentes
                </p>
                {selectedOption === 'add-code' && (
                  <div className="mt-2">
                    <Label htmlFor="new-code" className="text-xs">Código do produto:</Label>
                    <Input
                      id="new-code"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="Ex: ABC123, REF-001"
                      className="mt-1"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </label>

            {/* Opção 3: Adicionar ao existente */}
            <label
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedOption === 'merge-stock'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="duplicate-option"
                value="merge-stock"
                checked={selectedOption === 'merge-stock'}
                onChange={() => setSelectedOption('merge-stock')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <PackagePlus className="h-4 w-4 text-primary" />
                  <span className="font-medium">3. Adicionar ao produto existente</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adicione {newProductStock} unidade(s) ao estoque do produto existente em vez de criar um novo cadastro
                </p>
              </div>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm()}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

