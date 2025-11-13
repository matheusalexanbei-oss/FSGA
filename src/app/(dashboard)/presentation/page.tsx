'use client'

import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileDown, Sparkles, Mail, Phone, Globe } from 'lucide-react'
import { generateSalesPresentationPDF } from '@/lib/pdf/presentation-generator'
import { toast } from 'sonner'

export default function PresentationPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    companyName: 'Fullstack Gestor AI',
    contactEmail: 'contato@fullstackgestor.ai',
    contactPhone: '(11) 99999-9999',
    website: 'www.fullstackgestor.ai'
  })

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true)
      
      // Gerar PDF (função é async)
      const doc = await generateSalesPresentationPDF({
        companyName: formData.companyName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        website: formData.website
      })
      
      // Baixar PDF
      doc.save('Apresentacao-Fullstack-Gestor-AI.pdf')
      
      toast.success('PDF gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Apresentação de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gere uma apresentação profissional em PDF para vender o produto
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Configuração */}
          <AnimatedCard delay={0.1}>
            <CardHeader>
              <CardTitle>Configurações da Apresentação</CardTitle>
              <CardDescription>
                Personalize as informações de contato que aparecerão no PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Fullstack Gestor AI"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email de Contato
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contato@fullstackgestor.ai"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone/WhatsApp
                </Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.fullstackgestor.ai"
                />
              </div>

              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Gerar e Baixar PDF
                  </>
                )}
              </Button>
            </CardContent>
          </AnimatedCard>

          {/* Informações sobre a Apresentação */}
          <AnimatedCard delay={0.2}>
            <CardHeader>
              <CardTitle>Sobre a Apresentação</CardTitle>
              <CardDescription>
                Conteúdo incluído no PDF gerado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Capa Profissional</p>
                    <p className="text-sm text-muted-foreground">
                      Design moderno com branding da empresa
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Problemas e Soluções</p>
                    <p className="text-sm text-muted-foreground">
                      Apresenta desafios e como resolvemos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Diferenciais Competitivos</p>
                    <p className="text-sm text-muted-foreground">
                      IA para cadastros em lotes e Bot AI
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Funcionalidades Completas</p>
                    <p className="text-sm text-muted-foreground">
                      Todos os módulos e recursos do sistema
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Planos e Preços</p>
                    <p className="text-sm text-muted-foreground">
                      Estrutura completa de pricing atualizada
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">ROI e Economia</p>
                    <p className="text-sm text-muted-foreground">
                      Retorno sobre investimento e exemplos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Segurança e Conformidade</p>
                    <p className="text-sm text-muted-foreground">
                      LGPD, criptografia e backups
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Call to Action</p>
                    <p className="text-sm text-muted-foreground">
                      Convite para teste gratuito
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Total:</strong> 16 slides profissionais prontos para apresentação
                </p>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Dicas de Uso */}
        <AnimatedCard delay={0.3}>
          <CardHeader>
            <CardTitle>💡 Dicas de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Para Apresentações ao Vivo</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use em projetor ou tela compartilhada</li>
                  <li>• Formato landscape ideal para telas</li>
                  <li>• Navegue entre slides usando PDF viewer</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Para Envio por Email</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Anexe o PDF em emails de proposta</li>
                  <li>• Compartilhe via link (Google Drive, etc)</li>
                  <li>• Inclua no material de apresentação</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </PageWrapper>
  )
}













