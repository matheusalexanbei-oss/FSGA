'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Settings, User } from 'lucide-react'
import { NotificationButton } from './NotificationButton'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { MobileMenu } from './MobileMenu'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const { user, logout } = useHybridAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [businessName, setBusinessName] = useState<string | null>(null)

  const handleSignOut = async () => {
    await logout()
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const userInitials = user?.email
    ?.split('@')[0]
    .substring(0, 2)
    .toUpperCase() || '??'

  // Carregar nome do negócio do perfil
  useEffect(() => {
    if (user?.id) {
      const loadBusinessName = async () => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('users_profile')
            .select('business_name')
            .eq('id', user.id)
            .single()

          if (!error && data?.business_name) {
            setBusinessName(data.business_name)
          }
        } catch (error) {
          // Ignorar erros silenciosamente
        }
      }
      loadBusinessName()
    }
  }, [user?.id])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background backdrop-blur-md shadow-sm px-6 transition-colors duration-200 border-border">

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-background pointer-events-none" />
      
      <div className="flex flex-1 items-center justify-between relative">
        {/* Left side - Mobile Menu */}
        <div className="lg:hidden">
          <MobileMenu />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <NotificationButton />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-200 ring-2 ring-transparent hover:ring-primary/20">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                  <AvatarFallback className="bg-linear-to-br from-primary via-primary/80 to-primary/60 text-white font-semibold shadow-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl">
              <DropdownMenuLabel className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                    {businessName || user?.email || 'Minha Conta'}
                  </p>
                  {businessName && (
                    <p className="text-xs leading-none text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings/profile')} className="hover:bg-primary/5 transition-colors">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="hover:bg-primary/5 transition-colors">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

