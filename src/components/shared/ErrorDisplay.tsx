'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ title = 'Erro', message, onRetry, className }: ErrorDisplayProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 rounded-lg bg-red-50 border border-red-200", className)}>
      <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-700 text-center mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Tentar Novamente
        </Button>
      )}
    </div>
  )
}



