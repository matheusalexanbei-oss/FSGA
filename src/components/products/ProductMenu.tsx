'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Trash2, Tag, Check, X } from 'lucide-react'

interface ProductMenuProps {
  productId: string
  productName: string
  isSelected: boolean
  onEdit: () => void
  onDelete: () => void
  onMove: () => void
  onSelect?: () => void
  onSelectWithBulk?: () => void // Nova prop para ativar modo bulk
  // Props para ações em massa
  hasSelectedProducts?: boolean
  selectedCount?: number
  onBulkEdit?: () => void
  onBulkDelete?: () => void
  onBulkMove?: () => void
}

export function ProductMenu({ 
  productId, 
  productName, 
  isSelected, 
  onEdit, 
  onDelete, 
  onMove,
  onSelect,
  onSelectWithBulk,
  hasSelectedProducts = false,
  selectedCount = 0,
  onBulkEdit,
  onBulkDelete,
  onBulkMove
}: ProductMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number; align: 'left' | 'right' }>({ x: 0, y: 0, align: 'right' })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation() // Impede que outros eventos sejam disparados
    
    console.log('Menu toggle clicked!') // Debug log
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const menuWidth = 200
      const menuHeight = 200
      
      // Calcular posição X
      let x = rect.right
      let align: 'left' | 'right' = 'left'
      
      if (x + menuWidth > viewportWidth) {
        x = rect.left - menuWidth
        align = 'right'
      }
      
      // Calcular posição Y
      let y = rect.bottom + 8
      
      if (y + menuHeight > viewportHeight) {
        y = rect.top - menuHeight - 8
      }
      
      setMenuPosition({ x, y, align })
    }
    console.log('Setting isOpen to:', !isOpen)
    setIsOpen(!isOpen)
  }


  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        onClick={handleToggleMenu}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 min-w-max"
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{productName}</p>
            </div>

            {/* Selecionar */}
            {onSelect && (
              <button
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300"
                onClick={() => {
                  // Primeiro ativa o modo bulk se não estiver ativo
                  if (onSelectWithBulk) {
                    onSelectWithBulk()
                  }
                  // Depois seleciona/deseleciona o produto
                  onSelect()
                  setIsOpen(false)
                }}
              >
                <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                  {isSelected ? <X className="h-4 w-4 text-blue-600 dark:text-blue-400" /> : <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <span>{isSelected ? 'Desselecionar' : 'Selecionar'}</span>
              </button>
            )}

            {/* Editar */}
            <button
              className="w-full px-3 py-2.5 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300"
              onClick={() => {
                console.log('Edit clicked!')
                if (hasSelectedProducts && onBulkEdit) {
                  onBulkEdit()
                } else {
                  onEdit()
                }
                setIsOpen(false)
              }}
            >
              <div className="p-1 rounded bg-orange-100 dark:bg-orange-900/30">
                <Edit className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span>
                {hasSelectedProducts ? `Editar ${selectedCount} produto(s)` : 'Editar'}
              </span>
            </button>

            {/* Mover */}
            <button
              className="w-full px-3 py-2.5 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300"
              onClick={() => {
                console.log('Move clicked!')
                if (hasSelectedProducts && onBulkMove) {
                  onBulkMove()
                } else {
                  onMove()
                }
                setIsOpen(false)
              }}
            >
              <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/30">
                <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span>
                {hasSelectedProducts ? `Mover ${selectedCount} produto(s)` : 'Mover'}
              </span>
            </button>

            {/* Separador */}
            <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>

            {/* Excluir */}
            <button
              className="w-full px-3 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 transition-colors"
              onClick={() => {
                console.log('Delete clicked!')
                if (hasSelectedProducts && onBulkDelete) {
                  onBulkDelete()
                } else {
                  onDelete()
                }
                setIsOpen(false)
              }}
            >
              <div className="p-1 rounded bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {hasSelectedProducts ? `Excluir ${selectedCount} produto(s)` : 'Excluir'}
              </span>
            </button>
        </div>,
        document.body
      )}
    </>
  )
}
