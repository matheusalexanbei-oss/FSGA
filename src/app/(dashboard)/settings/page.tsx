'use client'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Settings, User, Building, Plug, Bell, BellOff } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Configurações da conta e negócio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil */}
          <AnimatedCard delay={0.1}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Perfil</CardTitle>
                  <CardDescription>Informações pessoais</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Seu nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" />
              </div>
              <Button className="w-full">Salvar Perfil</Button>
            </CardContent>
          </AnimatedCard>

          {/* Empresa */}
          <AnimatedCard delay={0.2}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Empresa</CardTitle>
                  <CardDescription>Dados do seu negócio</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Nome da empresa</Label>
                <Input id="company" placeholder="Nome da sua empresa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" placeholder="Rua, número, bairro" />
              </div>
              <Button className="w-full">Salvar Empresa</Button>
            </CardContent>
          </AnimatedCard>

          {/* Notificações */}
          <AnimatedCard delay={0.3}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>Preferências de notificação</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationSettings />
            </CardContent>
          </AnimatedCard>

          {/* Integrações */}
          <AnimatedCard delay={0.4}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plug className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Integrações</CardTitle>
                  <CardDescription>Conecte com outras plataformas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">S</span>
                    </div>
                    <div>
                      <p className="font-medium">Shopify</p>
                      <p className="text-sm text-muted-foreground">Sincronizar produtos e vendas</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Conectar</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">N</span>
                    </div>
                    <div>
                      <p className="font-medium">Nuvemshop</p>
                      <p className="text-sm text-muted-foreground">Integração com sua loja</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Conectar</Button>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </PageWrapper>
  )
}

// Componente de configurações de notificações
function NotificationSettings() {
  const { preferences, isLoading, updatePreference } = useNotificationPreferences()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Erro ao carregar preferências de notificações
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Notificações Gerais */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-primary" />
            <p className="font-medium">Todas as notificações</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Ativar ou desativar todas as notificações do sistema
          </p>
        </div>
        <Switch
          checked={preferences.notifications_enabled}
          onCheckedChange={(checked) => updatePreference('notifications_enabled', checked)}
          disabled={isLoading}
        />
      </div>

      <Separator />

      {/* Notificações Financeiras */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="h-4 w-4 text-primary" />
              <p className="font-medium">Notificações financeiras</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Notificações sobre transações agendadas e vencidas
            </p>
          </div>
          <Switch
            checked={preferences.notifications_financial_enabled && preferences.notifications_enabled}
            onCheckedChange={(checked) => updatePreference('notifications_financial_enabled', checked)}
            disabled={isLoading || !preferences.notifications_enabled}
          />
        </div>

        {/* Sub-opções de notificações financeiras */}
        {preferences.notifications_financial_enabled && preferences.notifications_enabled && (
          <div className="ml-4 space-y-2 pl-4 border-l-2">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex-1">
                <p className="text-sm font-medium">7 dias antes</p>
                <p className="text-xs text-muted-foreground">
                  Notificar 7 dias antes da quitação
                </p>
              </div>
              <Switch
                checked={preferences.notifications_financial_7days}
                onCheckedChange={(checked) => updatePreference('notifications_financial_7days', checked)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex-1">
                <p className="text-sm font-medium">3 dias antes</p>
                <p className="text-xs text-muted-foreground">
                  Notificar 3 dias antes da quitação
                </p>
              </div>
              <Switch
                checked={preferences.notifications_financial_3days}
                onCheckedChange={(checked) => updatePreference('notifications_financial_3days', checked)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex-1">
                <p className="text-sm font-medium">No dia</p>
                <p className="text-xs text-muted-foreground">
                  Notificar no dia da quitação
                </p>
              </div>
              <Switch
                checked={preferences.notifications_financial_day}
                onCheckedChange={(checked) => updatePreference('notifications_financial_day', checked)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex-1">
                <p className="text-sm font-medium">Transações vencidas</p>
                <p className="text-xs text-muted-foreground">
                  Notificar sobre transações vencidas
                </p>
              </div>
              <Switch
                checked={preferences.notifications_financial_overdue}
                onCheckedChange={(checked) => updatePreference('notifications_financial_overdue', checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Nota informativa */}
      <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
        <p className="text-xs text-muted-foreground">
          <strong>Nota:</strong> As notificações são enviadas automaticamente quando você está no app (toast notifications).
          Para receber notificações push quando o navegador estiver fechado, ative as notificações do navegador.
        </p>
      </div>
    </div>
  )
}




