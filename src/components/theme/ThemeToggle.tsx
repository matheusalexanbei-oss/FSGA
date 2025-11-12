'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evitar hidratação mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Debug: Log mudanças de tema
  React.useEffect(() => {
    if (mounted && theme) {
      console.log('🎨 [ThemeToggle] Tema atual:', theme)
      console.log('🎨 [ThemeToggle] HTML tem classe dark?', document.documentElement.classList.contains('dark'))
      console.log('🎨 [ThemeToggle] Background HTML:', getComputedStyle(document.documentElement).backgroundColor)
      console.log('🎨 [ThemeToggle] Background Body:', getComputedStyle(document.body).backgroundColor)
    }
  }, [theme, mounted])

  const handleThemeChange = (newTheme: string) => {
    console.log('🎨 [ThemeToggle] Mudando tema para:', newTheme)
    setTheme(newTheme)
    
    // Forçar aplicação imediata
    setTimeout(() => {
      const html = document.documentElement
      const body = document.body
      
      if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark')
        console.log('🎨 [ThemeToggle] Classe dark adicionada ao HTML')
      } else {
        html.classList.remove('dark')
        console.log('🎨 [ThemeToggle] Classe dark removida do HTML')
      }
      
      // Aplicar background diretamente
      const rootStyle = getComputedStyle(html)
      const background = rootStyle.getPropertyValue('--background').trim()
      if (background) {
        html.style.backgroundColor = `hsl(${background})`
        body.style.backgroundColor = `hsl(${background})`
        console.log('🎨 [ThemeToggle] Background aplicado:', `hsl(${background})`)
      }
    }, 100)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 transition-all duration-200 hover:bg-primary/10 hover:scale-105"
          aria-label="Alternar tema"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Tema claro"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Tema escuro"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('system')}
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Tema do sistema"
          title="Segue a preferência do sistema operacional (Windows/Mac/Linux)"
        >
          <span className="mr-2 h-4 w-4">💻</span>
          <span>Sistema</span>
          <span className="ml-auto text-xs text-muted-foreground">Auto</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}



