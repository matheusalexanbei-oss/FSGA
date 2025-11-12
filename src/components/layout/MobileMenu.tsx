'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dashboardNav } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Menu */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-screen w-[280px] bg-gray-900 dark:bg-gray-950 text-white shadow-xl lg:hidden"
              aria-label="Menu de navegação mobile"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
                  <span className="text-lg font-bold">Menu</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    aria-label="Fechar menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                  <ul className="space-y-1 px-2">
                    {dashboardNav.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon

                      return (
                        <li key={item.href}>
                          <button
                            onClick={() => handleNavigation(item.href)}
                            className={cn(
                              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 w-full text-left',
                              'transition-colors duration-150',
                              'hover:bg-gray-700 dark:hover:bg-gray-800',
                              isActive && 'bg-gray-700 dark:bg-gray-800 text-white'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute left-0 h-8 w-1 rounded-r-full bg-white" />
                            )}

                            {/* Icon */}
                            <Icon
                              className={cn(
                                'h-5 w-5 transition-colors duration-150',
                                isActive
                                  ? 'text-white'
                                  : 'text-white/70 group-hover:text-white'
                              )}
                              aria-hidden="true"
                            />

                            {/* Label */}
                            <div className="flex flex-col overflow-hidden">
                              <span
                                className={cn(
                                  'text-sm font-medium transition-colors duration-150',
                                  isActive
                                    ? 'text-white'
                                    : 'text-white/90 group-hover:text-white'
                                )}
                              >
                                {item.title}
                              </span>
                              {item.description && (
                                <span className="text-xs text-white/60 truncate">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}







