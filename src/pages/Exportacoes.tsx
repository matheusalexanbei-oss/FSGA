import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Share2, ShoppingBag } from "lucide-react";

const Exportacoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exportações</h1>
        <p className="text-muted-foreground mt-1">Exportar dados e catálogos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Catálogo PDF</CardTitle>
                <CardDescription>Exporte seu estoque completo em PDF</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gere um catálogo profissional com fotos e preços de todos os seus produtos para compartilhar em redes sociais.
            </p>
            <Button className="w-full">
              <FileDown className="w-4 h-4 mr-2" />
              Gerar Catálogo PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Integração Shopify</CardTitle>
                <CardDescription>Sincronize com sua loja Shopify</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Conecte sua loja Shopify e sincronize produtos, estoque e vendas automaticamente.
            </p>
            <Button variant="outline" className="w-full">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Configurar Shopify
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Integração Nuvemshop</CardTitle>
                <CardDescription>Sincronize com sua Nuvemshop</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Conecte sua loja Nuvemshop e mantenha tudo sincronizado em tempo real.
            </p>
            <Button variant="outline" className="w-full">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Configurar Nuvemshop
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileDown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Exportar Dados</CardTitle>
                <CardDescription>Baixe seus dados em Excel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Exporte seus produtos, estoque e vendas em formato Excel para análise offline.
            </p>
            <Button variant="outline" className="w-full">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar para Excel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Exportacoes;



