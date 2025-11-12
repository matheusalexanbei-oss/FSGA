'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'
import { useEffect } from 'react'

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    // Garantir que o background seja aplicado após a hidratação
    const applyTheme = () => {
      const html = document.documentElement
      const body = document.body
      
      // Usar as variáveis CSS diretamente
      const rootStyle = getComputedStyle(html)
      const background = rootStyle.getPropertyValue('--background').trim()
      
      if (background) {
        const bgColor = `hsl(${background})`
        html.style.backgroundColor = bgColor
        body.style.backgroundColor = bgColor
        
        // Aplicar também em elementos principais do layout
        const mainElements = document.querySelectorAll('main, [role="main"]')
        mainElements.forEach((el) => {
          (el as HTMLElement).style.backgroundColor = bgColor
        })
        
        const layoutContainers = document.querySelectorAll('[class*="bg-gray-50"], [class*="bg-gray-900"]')
        layoutContainers.forEach((el) => {
          const element = el as HTMLElement
          if (html.classList.contains('dark')) {
            element.style.backgroundColor = bgColor
          }
        })
        
        console.log('🎨 [ThemeProvider] Background aplicado:', bgColor)
        console.log('🎨 [ThemeProvider] HTML tem classe dark?', html.classList.contains('dark'))
      }
    }
    
    // Aplicar imediatamente
    applyTheme()
    
    // Aplicar após um pequeno delay para garantir que o CSS está carregado
    const timeoutId = setTimeout(applyTheme, 100)
    const timeoutId2 = setTimeout(applyTheme, 500)
    
    // Observar mudanças no tema
    const observer = new MutationObserver(() => {
      setTimeout(applyTheme, 50)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(timeoutId2)
      observer.disconnect()
    }
  }, [])
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}



