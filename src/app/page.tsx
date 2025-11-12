import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Package, DollarSign, Download, MessageSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold tracking-tight">
            Fullstack Gestor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema ERP moderno com catalogação de produtos assistida por IA.
            Simplifique o gerenciamento do seu negócio.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Package className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Gestão de Produtos</CardTitle>
              <CardDescription>
                Catalogação inteligente com reconhecimento por IA
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Dashboard Financeiro</CardTitle>
              <CardDescription>
                Análises e insights em tempo real do seu negócio
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Exportações</CardTitle>
              <CardDescription>
                Integração com Shopify e geração de catálogos PDF
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Chat IA</CardTitle>
              <CardDescription>
                Consultas inteligentes sobre seus dados
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Status */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>🎉 Status do Projeto</CardTitle>
            <CardDescription>Acompanhe o progresso do desenvolvimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-sm">✅ Fase 1: Configuração Inicial - Completa</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm">🔄 Fase 2: Sistema de Autenticação - Em andamento</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-gray-300 rounded-full" />
                <span className="text-sm text-muted-foreground">⏳ Fase 3: Database Schema</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-gray-300 rounded-full" />
                <span className="text-sm text-muted-foreground">⏳ Fase 4: Layout e Navegação</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
