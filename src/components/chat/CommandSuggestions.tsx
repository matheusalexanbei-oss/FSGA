'use client'

import { Button } from '@/components/ui/button'
import { Lightbulb, Sparkles } from 'lucide-react'

interface CommandSuggestionsProps {
  suggestions?: string[]
  onSelect: (command: string) => void
  lastIntent?: string
  showLabel?: boolean
}

export function CommandSuggestions({ 
  suggestions = [], 
  onSelect, 
  lastIntent,
  showLabel = true 
}: CommandSuggestionsProps) {
  if (suggestions.length === 0) return null
  
  // Categorizar sugestões por tipo
  const categorizedSuggestions = suggestions.map(suggestion => {
    const lower = suggestion.toLowerCase()
    let category = 'other'
    let icon = null
    
    if (lower.includes('vendi') || lower.includes('venda')) {
      category = 'sales'
    } else if (lower.includes('gastei') || lower.includes('comprei') || lower.includes('paguei')) {
      category = 'expenses'
    } else if (lower.includes('recebi') || lower.includes('receita')) {
      category = 'income'
    } else if (lower.includes('estoque') || lower.includes('quant')) {
      category = 'stock'
    } else if (lower.includes('reposição') || lower.includes('repor')) {
      category = 'restock'
    } else if (lower.includes('lucro') || lower.includes('insights') || lower.includes('análise')) {
      category = 'analytics'
    } else if (lower.includes('ajuda') || lower.includes('listar')) {
      category = 'help'
    }
    
    return { suggestion, category }
  })
  
  return (
    <div className="space-y-2 px-4 pb-2">
      {showLabel && (
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Lightbulb className="w-3 h-3" />
          <span>Sugestões:</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {categorizedSuggestions.map(({ suggestion, category }, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(suggestion)}
            className="text-xs h-7 transition-all hover:scale-105 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
            style={{
              borderColor: getCategoryColor(category),
              color: getCategoryColor(category)
            }}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    sales: '#10b981', // green
    expenses: '#ef4444', // red
    income: '#3b82f6', // blue
    stock: '#f59e0b', // amber
    restock: '#8b5cf6', // purple
    analytics: '#6366f1', // indigo
    help: '#6b7280', // gray
    other: '#6b7280' // gray
  }
  return colors[category] || colors.other
}

