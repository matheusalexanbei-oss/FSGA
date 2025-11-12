'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ResponsiveTableProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

/**
 * Componente wrapper para tabelas responsivas
 * Em mobile, mostra cards ao invés de tabela
 */
export function ResponsiveTable({ 
  children, 
  className,
  title,
  description 
}: ResponsiveTableProps) {
  return (
    <div className={cn("w-full", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-semibold mb-1">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      
      {/* Desktop: Tabela normal */}
      <div className="hidden md:block overflow-x-auto">
        {children}
      </div>
      
      {/* Mobile: Mensagem para scroll horizontal */}
      <div className="md:hidden">
        <div className="text-sm text-muted-foreground mb-2 px-2">
          Deslize horizontalmente para ver mais colunas
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          {children}
        </div>
      </div>
    </div>
  )
}







