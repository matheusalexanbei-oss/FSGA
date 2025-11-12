'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { dashboardNav } from '@/config/navigation'
import { ChevronLeft, ChevronRight, Package2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (href: string) => {
    console.log('Navigating to:', href)
    router.push(href)
  }

  return (
    <aside
      style={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-gray-900 dark:bg-gray-950 text-white",
        "transition-[width] duration-200 ease-out shadow-lg"
      )}
      aria-label="Menu de navegação principal"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <Package2 className="h-7 w-7 text-white" />
              <span className="text-lg font-bold text-white">
                Fullstack Gestor
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto hover:bg-gray-700 dark:hover:bg-gray-800 text-white hover:text-white transition-colors"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4" aria-label="Navegação principal">
          <ul className="space-y-1 px-2" role="list">
            {dashboardNav.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 w-full text-left",
                      "transition-colors duration-150",
                      "hover:bg-gray-700",
                      isActive && "bg-gray-700 text-white"
                    )}
                  >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 h-8 w-1 rounded-r-full bg-white" />
                      )}

                      {/* Icon */}
                      <Icon className={cn(
                        "h-5 w-5 transition-colors duration-150",
                        isActive ? "text-white" : "text-white/70 group-hover:text-white"
                      )} />

                      {/* Label */}
                      {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                          <span className={cn(
                            "text-sm font-medium transition-colors duration-150",
                            isActive ? "text-white" : "text-white/90 group-hover:text-white"
                          )}>
                            {item.title}
                          </span>
                          {item.description && (
                            <span className="text-xs text-white/60 truncate">
                              {item.description}
                            </span>
                          )}
                        </div>
                      )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          {!isCollapsed && (
            <div className="rounded-lg bg-gray-700/20 p-3">
              <p className="text-xs font-medium text-white">Fullstack Gestor</p>
              <p className="text-xs text-white/60">v1.0.0 Beta</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

