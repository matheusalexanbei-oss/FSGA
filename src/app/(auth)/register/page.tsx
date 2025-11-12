'use client'

import { useState } from 'react'
// import { useRouter } from 'next/navigation' // Removido para evitar warning
import Link from 'next/link'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Chrome, Github, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  // const router = useRouter() // Removido para evitar warning
  const { register } = useHybridAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setIsLoading(false)
      return
    }

    try {
      const result = await register(email, password, name || email.split('@')[0])

      if (result.success) {
        setSuccessMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar.')
        toast.success('Cadastro realizado!', { description: 'Verifique seu e-mail para confirmar a conta.' })
      } else {
        setError(result.error || 'Erro ao cadastrar.')
        toast.error('Erro ao cadastrar', { description: result.error || 'Tente novamente.' })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar.'
      setError(errorMessage)
      toast.error('Erro ao cadastrar', { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError(`Login com ${provider} não disponível no momento. Use email e senha.`)
    toast.info(`Login com ${provider} não disponível`, { description: 'Use email e senha para continuar.' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Preencha os dados para começar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}