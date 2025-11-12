'use client'

import { ChatMessage as ChatMessageType } from '@/lib/chat-bot/types'
import { cn } from '@/lib/utils'
import { Bot, User, CheckCircle2, XCircle, Info } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isBot = message.role === 'bot'
  
  const getIcon = () => {
    if (isUser) return <User className="h-4 w-4" />
    if (message.type === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500" />
    if (message.type === 'error') return <XCircle className="h-4 w-4 text-red-500" />
    return <Bot className="h-4 w-4" />
  }
  
  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg",
        isUser 
          ? "bg-blue-600 dark:bg-blue-700 text-white ml-auto max-w-[80%]" 
          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 max-w-[85%]"
      )}
    >
      <div className={cn(
        "flex-shrink-0 mt-1",
        isUser ? "text-white" : "text-gray-600 dark:text-gray-400"
      )}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "whitespace-pre-wrap break-words text-sm",
            isUser ? "text-white" : "text-gray-900 dark:text-gray-100"
          )}
        >
          {message.content}
        </div>
        {message.timestamp && (
          <div className={cn(
            "text-xs mt-1 opacity-70",
            isUser ? "text-white/70" : "text-gray-500 dark:text-gray-400"
          )}>
            {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  )
}

