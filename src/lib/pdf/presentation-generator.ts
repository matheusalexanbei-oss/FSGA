// Gerador de PDF para Apresentação de Vendas
// Usa jsPDF para criar apresentação profissional

export interface PresentationOptions {
  companyName?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
}

export async function generateSalesPresentationPDF(options: PresentationOptions = {}) {
  // Importação dinâmica para evitar problemas de SSR
  const { default: jsPDF } = await import('jspdf')

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 210] // A4 landscape
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let currentY = margin

  // Função helper para adicionar nova página
  const addNewPage = () => {
    doc.addPage()
    currentY = margin
  }

  // Função helper para adicionar título
  const addTitle = (text: string, size: number = 28, color: [number, number, number] = [15, 23, 42]) => {
    if (currentY > pageHeight - 60) addNewPage()
    doc.setFontSize(size)
    doc.setTextColor(...color)
    doc.setFont('helvetica', 'bold')
    const textWidth = doc.getTextWidth(text)
    doc.text(text, (pageWidth - textWidth) / 2, currentY)
    currentY += size / 2 + 10
    doc.setTextColor(0, 0, 0)
  }

  // Função helper para adicionar subtítulo
  const addSubtitle = (text: string, size: number = 16) => {
    if (currentY > pageHeight - 40) addNewPage()
    doc.setFontSize(size)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    const textWidth = doc.getTextWidth(text)
    doc.text(text, (pageWidth - textWidth) / 2, currentY)
    currentY += size / 2 + 15
    doc.setTextColor(0, 0, 0)
  }

  // Função helper para adicionar texto
  const addText = (text: string, size: number = 12, x: number = margin, align: 'left' | 'center' | 'right' = 'left') => {
    if (currentY > pageHeight - 30) addNewPage()
    doc.setFontSize(size)
    doc.setFont('helvetica', 'normal')
    
    const lines = doc.splitTextToSize(text, contentWidth)
    lines.forEach((line: string) => {
      if (currentY > pageHeight - 20) addNewPage()
      let xPos = x
      if (align === 'center') {
        const textWidth = doc.getTextWidth(line)
        xPos = (pageWidth - textWidth) / 2
      } else if (align === 'right') {
        const textWidth = doc.getTextWidth(line)
        xPos = pageWidth - margin - textWidth
      }
      doc.text(line, xPos, currentY)
      currentY += size / 3 + 2
    })
    currentY += 5
  }

  // Função helper para adicionar lista
  const addBulletList = (items: string[], size: number = 12) => {
    items.forEach(item => {
      if (currentY > pageHeight - 20) addNewPage()
      doc.setFontSize(size)
      doc.setFont('helvetica', 'normal')
      const bulletX = margin + 5
      doc.text('•', bulletX, currentY)
      const lines = doc.splitTextToSize(item, contentWidth - 15)
      doc.text(lines, bulletX + 5, currentY)
      currentY += (lines.length * (size / 3 + 2)) + 3
    })
    currentY += 5
  }

  // Função helper para adicionar destaque
  const addHighlight = (text: string, size: number = 14, color: [number, number, number] = [59, 130, 246]) => {
    if (currentY > pageHeight - 30) addNewPage()
    doc.setFontSize(size)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, contentWidth)
    lines.forEach((line: string) => {
      if (currentY > pageHeight - 20) addNewPage()
      doc.text(line, margin, currentY)
      currentY += size / 3 + 2
    })
    currentY += 5
    doc.setTextColor(0, 0, 0)
  }

  // SLIDE 1: CAPA
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(48)
  doc.setFont('helvetica', 'bold')
  const title = 'FULLSTACK GESTOR AI'
  const titleWidth = doc.getTextWidth(title)
  doc.text(title, (pageWidth - titleWidth) / 2, pageHeight / 2 - 30)
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'normal')
  const subtitle = 'O ERP que transforma sua gestão com Inteligência Artificial'
  const subtitleWidth = doc.getTextWidth(subtitle)
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, pageHeight / 2)
  
  doc.setFontSize(18)
  doc.text('Revolucione sua gestão de produtos e finanças', (pageWidth - doc.getTextWidth('Revolucione sua gestão de produtos e finanças')) / 2, pageHeight / 2 + 25)

  // SLIDE 2: O PROBLEMA
  addNewPage()
  addTitle('DESAFIOS ATUAIS DAS EMPRESAS', 24)
  currentY += 10
  addBulletList([
    'Cadastro manual de produtos - Lento e propenso a erros',
    'Gestão financeira fragmentada - Sem visão consolidada',
    'Falta de automação - Processos manuais e repetitivos',
    'Ausência de insights - Decisões baseadas em intuição',
    'Dificuldade em escalar - Sistemas que não crescem com você'
  ], 14)

  // SLIDE 3: A SOLUÇÃO
  addNewPage()
  addTitle('FULLSTACK GESTOR AI - A SOLUÇÃO COMPLETA', 22)
  currentY += 10
  
  addHighlight('🤖 Catalogação Inteligente em Lotes', 16, [59, 130, 246])
  addText('Cadastre listas completas automaticamente a partir de texto, foto ou arquivo', 12, margin + 10)
  currentY += 5
  
  addHighlight('💰 Dashboard Financeiro', 16, [34, 197, 94])
  addText('Visão 360° do seu negócio com análises e insights em tempo real', 12, margin + 10)
  currentY += 5
  
  addHighlight('🤖 Bot AI para Executar Tarefas', 16, [168, 85, 247])
  addText('Execute funções do app apenas digitando em linguagem coloquial', 12, margin + 10)
  currentY += 5
  
  addHighlight('📊 Gestão Integrada', 16, [236, 72, 153])
  addText('Produtos + Finanças + Estoque - Tudo em um só lugar', 12, margin + 10)

  // SLIDE 4: DIFERENCIAIS COMPETITIVOS
  addNewPage()
  addTitle('O QUE NOS TORNA ÚNICOS', 24)
  currentY += 10
  
  addHighlight('1. CADASTRO DE LISTAS COMPLETAS COM IA', 16, [59, 130, 246])
  addText('Cadastre 50+ produtos de uma vez tirando foto de um catálogo ou nota fiscal. A IA extrai todos os produtos automaticamente.', 12, margin + 10)
  addText('Economia de 80% do tempo de cadastro.', 12, margin + 15, 'left')
  currentY += 10
  
  addHighlight('2. BOT AI QUE EXECUTA AÇÕES', 16, [34, 197, 94])
  addText('"vendi o colar de pérolas" → Cria transação, baixa estoque automaticamente', 12, margin + 10)
  addText('"gastei 50 reais no supermercado" → Registra despesa instantaneamente', 12, margin + 15, 'left')
  currentY += 10
  
  addHighlight('3. TOTALMENTE NA NUVEM', 16, [168, 85, 247])
  addText('Acesse de qualquer lugar • Dados sempre sincronizados • Backup automático', 12, margin + 10)

  // SLIDE 5: FUNCIONALIDADES PRINCIPAIS
  addNewPage()
  addTitle('MÓDULOS COMPLETOS', 24)
  currentY += 10
  
  addHighlight('✅ Gestão de Produtos', 14, [59, 130, 246])
  addBulletList([
    'CRUD completo com imagens',
    'Cadastro em lotes com IA (texto, foto, arquivo)',
    'Categorização inteligente',
    'Controle de estoque',
    'Busca avançada'
  ], 11)
  currentY += 5
  
  addHighlight('✅ Dashboard Financeiro', 14, [34, 197, 94])
  addBulletList([
    'Métricas em tempo real',
    'Gráficos interativos',
    'Transações agendadas',
    'Sistema de notificações',
    'Análises e insights automáticos'
  ], 11)
  currentY += 5
  
  addHighlight('✅ Bot AI', 14, [168, 85, 247])
  addBulletList([
    'Executa tarefas digitando em português',
    'Vendas, despesas, reposições',
    'Transações agendadas',
    'Consultas sobre o negócio'
  ], 11)
  currentY += 5
  
  addHighlight('✅ Exportação', 14, [236, 72, 153])
  addBulletList([
    'Exporte catálogo completo em PDF',
    'Sempre atualizado automaticamente',
    'Pronto para compartilhar'
  ], 11)

  // SLIDE 6: TECNOLOGIA
  addNewPage()
  addTitle('TECNOLOGIA DE PONTA', 24)
  currentY += 10
  
  addHighlight('Frontend:', 14, [59, 130, 246])
  addText('Next.js 14+ • TypeScript • Tailwind CSS • Interface moderna e responsiva', 12, margin + 10)
  currentY += 10
  
  addHighlight('Backend:', 14, [34, 197, 94])
  addText('Supabase (PostgreSQL) • Edge Functions • Autenticação segura • Escalabilidade garantida', 12, margin + 10)
  currentY += 10
  
  addHighlight('IA:', 14, [168, 85, 247])
  addText('Anthropic Claude 3.5 • Processamento inteligente • Respostas precisas', 12, margin + 10)
  currentY += 10
  
  addHighlight('Deploy:', 14, [236, 72, 153])
  addText('Vercel • Performance otimizada • CDN global', 12, margin + 10)

  // SLIDE 7: CASES DE USO
  addNewPage()
  addTitle('IDEAL PARA', 24)
  currentY += 10
  
  addHighlight('✅ E-commerce e Marketplace', 14, [59, 130, 246])
  addBulletList([
    'Catálogo extenso de produtos',
    'Gestão de múltiplos produtos',
    'Integração com vendas online'
  ], 11)
  currentY += 10
  
  addHighlight('✅ Varejo Físico', 14, [34, 197, 94])
  addBulletList([
    'Controle de estoque em tempo real',
    'Gestão financeira integrada',
    'Análise de vendas'
  ], 11)
  currentY += 10
  
  addHighlight('✅ Prestadores de Serviço', 14, [168, 85, 247])
  addBulletList([
    'Controle de receitas e despesas',
    'Gestão financeira completa',
    'Relatórios fiscais'
  ], 11)
  currentY += 10
  
  addHighlight('✅ Empreendedores', 14, [236, 72, 153])
  addBulletList([
    'Comece pequeno, escale rápido',
    'Sem necessidade de equipe técnica',
    'Interface amigável e intuitiva'
  ], 11)

  // SLIDE 8: PLANOS
  addNewPage()
  addTitle('PLANOS E PREÇOS', 24)
  currentY += 10
  
  // GRATUITO
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, currentY, contentWidth, 35, 'F')
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, currentY, contentWidth, 35, 'S')
  
  addHighlight('🆓 GRATUITO', 16, [59, 130, 246])
  addBulletList([
    '10 pontos/mês (reseta dia 1)',
    'Cadastro por IA: 10 pontos cada',
    'Propaganda assistida: +5 pontos (opcional)',
    'Sem acesso ao BOT AI'
  ], 10)
  currentY += 40
  
  // STARTER
  doc.setFillColor(239, 246, 255)
  doc.rect(margin, currentY, contentWidth, 40, 'F')
  doc.setDrawColor(59, 130, 246)
  doc.rect(margin, currentY, contentWidth, 40, 'S')
  
  addHighlight('🚀 STARTER - R$ 29/mês', 16, [59, 130, 246])
  addBulletList([
    '100 pontos/mês',
    'BOT AI: ILIMITADO ✅',
    'Cadastro por IA: 10 pontos cada',
    'Propagandas opcionais: +5 pontos',
    '= 10 cadastros por IA/mês'
  ], 10)
  currentY += 45
  
  // BUSINESS
  doc.setFillColor(240, 253, 244)
  doc.rect(margin, currentY, contentWidth, 35, 'F')
  doc.setDrawColor(34, 197, 94)
  doc.rect(margin, currentY, contentWidth, 35, 'S')
  
  addHighlight('💼 BUSINESS - R$ 79/mês', 16, [34, 197, 94])
  addBulletList([
    'TUDO ILIMITADO ✅',
    'BOT AI: ILIMITADO',
    'Cadastros por IA: ILIMITADOS',
    'SEM propagandas obrigatórias',
    'Dashboard avançado • Insights'
  ], 10)
  currentY += 40
  
  // ENTERPRISE
  addNewPage()
  doc.setFillColor(255, 247, 237)
  doc.rect(margin, currentY, contentWidth, 50, 'F')
  doc.setDrawColor(245, 158, 11)
  doc.rect(margin, currentY, contentWidth, 50, 'S')
  
  addHighlight('🏢 ENTERPRISE - R$ 199/mês', 16, [245, 158, 11])
  addBulletList([
    'Tudo do Business +',
    'Usuários ilimitados',
    'API personalizada',
    'Suporte 24/7',
    'Treinamento dedicado',
    'SLA garantido'
  ], 11)

  // SLIDE 9: ROI
  addNewPage()
  addTitle('RETORNO SOBRE INVESTIMENTO', 24)
  currentY += 10
  
  addHighlight('TEMPO ECONOMIZADO:', 16, [59, 130, 246])
  addBulletList([
    'Cadastro de produtos: 80% mais rápido (listas em lotes)',
    'Gestão financeira: 70% menos tempo (Bot AI)',
    'Relatórios: 100% automatizados'
  ], 12)
  currentY += 15
  
  addHighlight('ECONOMIA FINANCEIRA:', 16, [34, 197, 94])
  addBulletList([
    'Redução de erros: Menos perdas',
    'Otimização de estoque: Menos capital parado',
    'Insights automáticos: Melhor tomada de decisão'
  ], 12)
  currentY += 15
  
  addHighlight('EXEMPLO PRÁTICO:', 16, [168, 85, 247])
  addText('Empresa com 500 produtos:', 12, margin + 10)
  addText('• Cadastro manual: 50 horas', 12, margin + 15)
  addText('• Com IA (listas): 10 horas', 12, margin + 20)
  addText('• Economia: 40 horas = R$ 2.000', 12, margin + 25)
  addText('• Payback: 1 mês', 12, margin + 30)

  // SLIDE 10: SEGURANÇA
  addNewPage()
  addTitle('SEUS DADOS ESTÃO SEGUROS', 24)
  currentY += 10
  addBulletList([
    'Criptografia de ponta a ponta',
    'Backup automático diário',
    'Conformidade com LGPD',
    'Servidores seguros',
    'Row Level Security (RLS)',
    'Auditoria de acessos',
    'Insights processados localmente (sem envio de dados sensíveis)'
  ], 14)

  // SLIDE 11: NOTIFICAÇÕES
  addNewPage()
  addTitle('NUNCA ESQUEÇA NENHUMA TRANSAÇÃO', 24)
  currentY += 10
  
  addHighlight('Sistema de Notificações Inteligente', 16, [59, 130, 246])
  addBulletList([
    'Receitas a receber: Notificação antes do vencimento',
    'Despesas a pagar: Lembrete no dia do pagamento',
    'Estoque baixo: Alertas automáticos',
    'Métricas importantes: Notificações proativas'
  ], 12)
  currentY += 15
  
  addHighlight('Transações Agendadas', 16, [34, 197, 94])
  addText('"vendi produto que será pago mês que vem" → Sistema agenda e notifica automaticamente', 12, margin + 10)
  addText('Nunca perca uma receita ou esqueça uma despesa!', 12, margin + 15)

  // SLIDE 12: EXPORTAÇÃO
  addNewPage()
  addTitle('EXPORTE SEU CATÁLOGO AUTOMATICAMENTE', 24)
  currentY += 10
  
  addHighlight('Catálogo PDF Profissional', 16, [59, 130, 246])
  addBulletList([
    'Gere PDF completo do seu estoque',
    'Inclui: foto, nome, código, preço, descrição',
    'Sempre atualizado automaticamente',
    'Pronto para compartilhar em redes sociais',
    'Economia de tempo: Não precisa criar/atualizar manualmente'
  ], 12)
  currentY += 15
  
  addText('Perfeito para: WhatsApp • Instagram • Email • Catálogos impressos', 12, margin, 'center')

  // SLIDE 13: ROADMAP
  addNewPage()
  addTitle('O QUE ESTÁ POR VIR', 24)
  currentY += 10
  
  addHighlight('Q1 2025:', 14, [59, 130, 246])
  addBulletList([
    'Integração WhatsApp',
    'App mobile (iOS/Android)',
    'Notificações push'
  ], 11)
  currentY += 10
  
  addHighlight('Q2 2025:', 14, [34, 197, 94])
  addBulletList([
    'Integração com marketplaces',
    'Sistema de vendas completo',
    'Marketplace próprio'
  ], 11)
  currentY += 10
  
  addHighlight('Q3 2025:', 14, [168, 85, 247])
  addBulletList([
    'IA para previsão de demanda',
    'Automação de compras',
    'Relatórios fiscais avançados'
  ], 11)

  // SLIDE 14: DEPOIMENTOS
  addNewPage()
  addTitle('O QUE OS CLIENTES DIZEM', 24)
  currentY += 10
  
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, currentY, contentWidth, 25, 'F')
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, currentY, contentWidth, 25, 'S')
  addText('"Reduziu meu tempo de cadastro em 80%! A IA é incrível."', 12, margin + 5)
  currentY += 8
  addText('- Maria Silva, Loja de Joias', 10, margin + 5, 'right')
  currentY += 30
  
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, currentY, contentWidth, 25, 'F')
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, currentY, contentWidth, 25, 'S')
  addText('"Finalmente um sistema que cresce com meu negócio."', 12, margin + 5)
  currentY += 8
  addText('- João Santos, E-commerce', 10, margin + 5, 'right')
  currentY += 30
  
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, currentY, contentWidth, 25, 'F')
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, currentY, contentWidth, 25, 'S')
  addText('"Os insights automáticos me ajudaram a tomar decisões melhores."', 12, margin + 5)
  currentY += 8
  addText('- Ana Costa, Varejo', 10, margin + 5, 'right')

  // SLIDE 15: PRÓXIMOS PASSOS
  addNewPage()
  addTitle('COMECE AGORA MESMO', 24)
  currentY += 10
  
  addHighlight('1️⃣ TESTE GRATUITO', 16, [59, 130, 246])
  addBulletList([
    '10 pontos grátis por mês',
    'Teste cadastro por IA',
    'Sem necessidade de cartão'
  ], 11)
  currentY += 15
  
  addHighlight('2️⃣ DEMONSTRAÇÃO PERSONALIZADA', 16, [34, 197, 94])
  addBulletList([
    'Agende uma call',
    'Veja o sistema em ação',
    'Tire suas dúvidas'
  ], 11)
  currentY += 15
  
  addHighlight('3️⃣ IMPLANTAÇÃO RÁPIDA', 16, [168, 85, 247])
  addBulletList([
    'Setup em minutos',
    'Suporte na migração',
    'Treinamento incluído'
  ], 11)
  
  currentY += 20
  addText('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 12, margin, 'center')
  currentY += 10
  
  if (options.contactEmail) {
    addText(`Email: ${options.contactEmail}`, 12, margin, 'center')
    currentY += 8
  }
  if (options.contactPhone) {
    addText(`WhatsApp: ${options.contactPhone}`, 12, margin, 'center')
    currentY += 8
  }
  if (options.website) {
    addText(`Site: ${options.website}`, 12, margin, 'center')
  }

  // SLIDE 16: CALL TO ACTION FINAL
  addNewPage()
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(36)
  doc.setFont('helvetica', 'bold')
  const ctaTitle = 'TRANSFORME SUA GESTÃO'
  const ctaTitleWidth = doc.getTextWidth(ctaTitle)
  doc.text(ctaTitle, (pageWidth - ctaTitleWidth) / 2, pageHeight / 2 - 30)
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'normal')
  const ctaSubtitle = 'COMECE SEU TESTE GRATUITO HOJE MESMO'
  const ctaSubtitleWidth = doc.getTextWidth(ctaSubtitle)
  doc.text(ctaSubtitle, (pageWidth - ctaSubtitleWidth) / 2, pageHeight / 2)
  
  doc.setFontSize(16)
  doc.text('Sem compromisso • Cancele quando quiser', (pageWidth - doc.getTextWidth('Sem compromisso • Cancele quando quiser')) / 2, pageHeight / 2 + 30)
  
  if (options.website) {
    doc.setFontSize(18)
    doc.text(options.website, (pageWidth - doc.getTextWidth(options.website)) / 2, pageHeight / 2 + 50)
  }

  return doc
}












