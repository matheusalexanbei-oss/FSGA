import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Database, 
  Cloud,
  Save,
  RefreshCcw
} from "lucide-react";

const Configuracoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Configurações da conta e negócio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil */}
        <Card>
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
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Empresa */}
        <Card>
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
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Empresa
            </Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-mail de vendas</p>
                  <p className="text-sm text-muted-foreground">Receber notificações de novas vendas</p>
                </div>
                <Button variant="outline" size="sm">Ativo</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Estoque baixo</p>
                  <p className="text-sm text-muted-foreground">Alertas quando estoque estiver baixo</p>
                </div>
                <Button variant="outline" size="sm">Ativo</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Relatórios semanais</p>
                  <p className="text-sm text-muted-foreground">Resumo semanal por e-mail</p>
                </div>
                <Button variant="outline" size="sm">Inativo</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sincronização */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Sincronização</CardTitle>
                <CardDescription>Gerenciar dados e backup</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dados Locais</p>
                    <p className="text-sm text-muted-foreground">Sincronizados</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Supabase</p>
                    <p className="text-sm text-muted-foreground">Conectado</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Fazer Backup Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;



