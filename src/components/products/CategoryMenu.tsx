'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'

interface CategoryMenuProps {
  categoryId: string
  categoryName: string
  onEdit: () => void
  onDelete: () => void
}

export function CategoryMenu({ 
  categoryId, 
  categoryName, 
  onEdit, 
  onDelete
}: CategoryMenuProps) {
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
    e.stopPropagation() // Impede que a pasta seja aberta quando clica no menu
    
    console.log('CategoryMenu toggle clicked!') // Debug log
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const menuWidth = 200 // largura do menu
      const menuHeight = 200 // altura estimada do menu
      
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
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-colors absolute top-2 right-2"
        onClick={handleToggleMenu}
      >
        <MoreVertical className="h-3 w-3" />
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
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{categoryName}</p>
            </div>

            {/* Editar */}
            <button
              className="w-full px-3 py-2.5 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center gap-3 transition-colors text-gray-700 dark:text-gray-300"
              onClick={() => {
                console.log('CategoryMenu: Edit clicked!')
                onEdit()
                setIsOpen(false)
              }}
            >
              <div className="p-1 rounded bg-orange-100 dark:bg-orange-900/30">
                <Edit className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span>Editar Categoria</span>
            </button>

            {/* Separador */}
            <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>

            {/* Excluir */}
            <button
              className="w-full px-3 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 transition-colors"
              onClick={() => {
                console.log('CategoryMenu: Delete clicked!')
                onDelete()
                setIsOpen(false)
              }}
            >
              <div className="p-1 rounded bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-red-600 dark:text-red-400 font-medium">Excluir Categoria</span>
            </button>
        </div>,
        document.body
      )}
    </>
  )
}
