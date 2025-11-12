'use client'

import { useState, useEffect } from 'react'
import { ChatBot } from './ChatBot'
import { Button } from '@/components/ui/button'
import { MessageSquare, X, Minimize2, Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

interface FloatingChatBotProps {
  userId: string
  products?: Product[]
  onTransactionCreated?: () => void
}

export function FloatingChatBot({ userId, products = [], onTransactionCreated }: FloatingChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Resetar estado quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false)
    }
  }, [isOpen])

  // Garantir que userId existe
  if (!userId) {
    console.warn('FloatingChatBot: userId não fornecido')
    return null
  }


  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <div className="chat-bot-floating">
          <Button
            onClick={() => setIsOpen(true)}
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "flex items-center justify-center",
              "animate-pulse hover:animate-none transition-all",
              "hover:scale-110",
              "border-4 border-blue-400/30",
              "relative overflow-hidden"
            )}
            size="icon"
            aria-label="Abrir BOT AI"
          >
            <Bot className="h-7 w-7 relative z-10" />
            <Sparkles className="h-4 w-4 absolute top-1 right-1 text-blue-200 animate-spin-slow" />
          </Button>
        </div>
      )}

      {/* Janela de Chat (estilo Messenger) */}
      {isOpen && (
        <div
          className={cn(
            "chat-bot-floating bg-white dark:bg-gray-900 rounded-lg shadow-2xl",
            "border border-gray-200 dark:border-gray-700",
            "transition-all duration-300",
            isMinimized 
              ? "w-80 h-12" 
              : "w-96 h-[600px]"
          )}
          style={{ 
            maxHeight: 'calc(100vh - 4rem)',
            maxWidth: 'calc(100vw - 4rem)'
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b border-blue-700 dark:border-blue-500 bg-blue-600 dark:bg-blue-700 text-white rounded-t-lg cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold text-sm">BOT AI</h3>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conteúdo do Chat */}
          {!isMinimized && (
            <div className="h-[calc(600px-57px)]">
              <ChatBot
                userId={userId}
                products={products}
                onTransactionCreated={() => {
                  // Callback original se fornecido
                  onTransactionCreated?.()
                  // Disparar evento customizado para atualizar dados sem reload
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('transaction-updated'))
                    window.dispatchEvent(new CustomEvent('product-updated'))
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}

