'use client'

import { useState, KeyboardEvent, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export interface ChatInputRef {
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ onSend, disabled = false, placeholder = "Digite um comando..." }, ref) => {
    const [input, setInput] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus()
      }
    }))
    
    const handleSubmit = () => {
      if (input.trim() && !disabled) {
        onSend(input.trim())
        setInput('')
        // Focar novamente após enviar
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
    
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    }
    
    // Focar automaticamente quando o componente montar
    useEffect(() => {
      inputRef.current?.focus()
    }, [])
    
    return (
      <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          size="icon"
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'

