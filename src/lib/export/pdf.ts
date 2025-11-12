/**
 * Utilitários para geração de PDF usando jsPDF
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Product } from '@/types/product'

export interface PDFCatalogOptions {
  filename?: string
  layout?: 'list' | 'grid'
  includeImages?: boolean
  businessName?: string
  logoUrl?: string
  backgroundColor?: string
  borderColor?: string
  titleFont?: 'helvetica' | 'times' | 'courier' | 'serif'
  categoryFont?: 'helvetica' | 'times' | 'courier' | 'serif'
  groupByCategory?: boolean
  imageBorder?: boolean // Nova opção: moldura apenas na foto
}

/**
 * Converte uma URL de imagem para base64
 */
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Erro ao converter imagem para base64:', error)
    return null
  }
}

/**
 * Determina se uma cor é escura (retorna true) ou clara (retorna false)
 */
function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  // Calcular luminância relativa (fórmula padrão)
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
  return luminance < 0.5
}

/**
 * Retorna a cor de texto apropriada baseada na cor de fundo
 * Retorna [255, 255, 255] (branco) para fundos escuros
 * Retorna [40, 40, 40] (preto) para fundos claros
 */
function getTextColorForBackground(backgroundColor: string): [number, number, number] {
  return isDarkColor(backgroundColor) ? [255, 255, 255] : [40, 40, 40]
}

/**
 * Converte cor hex para RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [245, 245, 245] // Default cinza claro
}

/**
 * Desenha gradiente de fundo
 */
function drawGradientBackground(
  doc: jsPDF,
  color1: string,
  color2: string
): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const steps = 50
  
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  const stepHeight = pageHeight / steps
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps
    const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * ratio)
    const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * ratio)
    const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * ratio)
    
    doc.setFillColor(r, g, b)
    doc.rect(0, i * stepHeight, pageWidth, stepHeight, 'F')
  }
}

export async function generateProductCatalogPDF(
  products: Product[],
  options: PDFCatalogOptions = {}
): Promise<void> {
  const {
    filename = `catalogo_${new Date().toISOString().split('T')[0]}.pdf`,
    layout = 'grid',
    includeImages = true,
    businessName,
    logoUrl,
    backgroundColor = '#f5f5f5',
    borderColor = '#e0e0e0',
    titleFont = 'helvetica',
    categoryFont = 'helvetica',
    groupByCategory = true,
    imageBorder = false // Por padrão, sem moldura na foto
  } = options

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Desenhar gradiente de fundo
  const bgColor2 = adjustBrightness(backgroundColor, -10)
  drawGradientBackground(doc, backgroundColor, bgColor2)

  // Obter cor de texto apropriada para o fundo
  const textColor = getTextColorForBackground(backgroundColor)

  let yPosition = 20

  // Adicionar logo (se fornecido)
  if (logoUrl) {
    try {
      const logoBase64 = await imageUrlToBase64(logoUrl)
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 15, yPosition, 30, 15)
        yPosition += 20
      }
    } catch (error) {
      console.error('Erro ao adicionar logo:', error)
    }
  }

  // Título sem linha decorativa
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  
  // Título com fonte customizada (centralizado)
  doc.setFontSize(28)
  // Usar 'times' se titleFont for 'serif', senão usar a fonte selecionada
  const finalTitleFont = titleFont === 'serif' ? 'times' : titleFont
  doc.setFont(finalTitleFont as any, 'bold')
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  const titleText = businessName || 'Catálogo de Produtos'
  const titleWidth = doc.getTextWidth(titleText)
  doc.text(titleText, (pageWidth - titleWidth) / 2, yPosition)
  yPosition += 8 // Reduzido de 18 para 8

  // Agrupar produtos por categoria se solicitado
  if (groupByCategory) {
    await generateGroupedLayout(doc, products, layout, includeImages, yPosition, backgroundColor, borderColor, categoryFont, imageBorder, textColor)
  } else {
    if (layout === 'list') {
      await generateListLayout(doc, products, includeImages, yPosition, borderColor, backgroundColor, categoryFont, textColor)
    } else {
      await generateGridLayout(doc, products, includeImages, yPosition, borderColor, backgroundColor, categoryFont, imageBorder, textColor)
    }
  }

  // Salvar PDF
  doc.save(filename)
}

/**
 * Ajusta brilho de uma cor hex
 */
function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  const r = Math.max(0, Math.min(255, rgb[0] + percent))
  const g = Math.max(0, Math.min(255, rgb[1] + percent))
  const b = Math.max(0, Math.min(255, rgb[2] + percent))
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')}`
}

/**
 * Calcula a altura necessária para uma linha de produtos (2 produtos) no layout grid
 */
function calculateGridRowHeight(
  doc: jsPDF,
  products: Product[],
  startIndex: number,
  includeImages: boolean,
  itemWidth: number,
  textPadding: number,
  productFont: string
): number {
  if (startIndex >= products.length) return 0
  
  const product1 = products[startIndex]
  const product2 = products[startIndex + 1]
  const textSpacing = 4 // Mesmo valor usado em generateGridLayout (aumentado)
  const spacing = 2 // Mesmo valor usado em generateGridLayout
  
  // Calcular altura do primeiro produto
  doc.setFontSize(12)
  doc.setFont(productFont as any, 'bold')
  const name1 = product1.name || 'Sem nome'
  const nameWidth = itemWidth
  const nameLines1 = doc.splitTextToSize(name1, nameWidth)
  const actualNameHeight1 = nameLines1.length * 5.5
  
  let imageHeight1 = 0
  let imageWidth1 = itemWidth
  if (includeImages && product1.image_url) {
    imageWidth1 = itemWidth
    imageHeight1 = imageWidth1
  }
  
  let cardHeight1 = 0
  if (includeImages && product1.image_url) {
    cardHeight1 += imageHeight1 + textSpacing
  }
  cardHeight1 += actualNameHeight1 + textSpacing + 7
  
  // Calcular altura do segundo produto (se existir)
  let cardHeight2 = 0
  if (product2) {
    const name2 = product2.name || 'Sem nome'
    const nameLines2 = doc.splitTextToSize(name2, nameWidth)
    const actualNameHeight2 = nameLines2.length * 5.5
    
    let imageHeight2 = 0
    let imageWidth2 = itemWidth
    if (includeImages && product2.image_url) {
      imageWidth2 = itemWidth
      imageHeight2 = imageWidth2
    }
    
    cardHeight2 = 0
    if (includeImages && product2.image_url) {
      cardHeight2 += imageHeight2 + textSpacing
    }
    cardHeight2 += actualNameHeight2 + textSpacing + 7
  }
  
  return Math.max(cardHeight1, cardHeight2) + spacing
}

/**
 * Agrupa produtos por categoria e gera layout
 * Garante que o título da categoria sempre apareça junto com pelo menos alguns produtos
 */
async function generateGroupedLayout(
  doc: jsPDF,
  products: Product[],
  layout: 'list' | 'grid',
  includeImages: boolean,
  startY: number,
  backgroundColor: string,
  borderColor: string,
  categoryFont: string,
  imageBorder: boolean,
  textColor: [number, number, number]
): Promise<void> {
  // Agrupar produtos por categoria
  const grouped = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Sem Categoria'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  let yPosition = startY
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Preparar fonte para cálculo de altura
  const productFont = categoryFont === 'serif' ? 'times' : categoryFont
  const itemWidth = layout === 'grid' ? (pageWidth - 40 - 2) / 2 : pageWidth - 30 // spacing reduzido para 2
  const textPadding = 1.5 // Reduzido para melhor aproveitamento de espaço
  const categoryTitleHeight = 18 + 2 + 2 // altura do título + espaçamento antes (2) + depois (2)

  // Ordenar categorias alfabeticamente
  const sortedCategories = Object.keys(grouped).sort()

  for (const categoryName of sortedCategories) {
    const categoryProducts = grouped[categoryName]
    
    // Calcular altura mínima necessária (título + pelo menos 1 linha de produtos)
    let minHeightNeeded = categoryTitleHeight
    if (layout === 'grid' && categoryProducts.length > 0) {
      // Calcular altura para pelo menos 2 produtos (1 linha)
      const firstRowHeight = calculateGridRowHeight(doc, categoryProducts, 0, includeImages, itemWidth, textPadding, productFont)
      minHeightNeeded += firstRowHeight
    } else if (layout === 'list' && categoryProducts.length > 0) {
      // Para lista, estimar altura de 1 produto (~15mm)
      minHeightNeeded += 15
    }
    
    // Verificar se título + pelo menos alguns produtos cabem na página atual
    // Se não couber, criar nova página ANTES de escrever o título
    if (yPosition + minHeightNeeded > pageHeight - 20) {
      doc.addPage()
      const bgColor2 = adjustBrightness(backgroundColor, -10)
      drawGradientBackground(doc, backgroundColor, bgColor2)
      yPosition = 20
    }

    // Título da categoria (sem fundo, apenas texto)
    yPosition += 2 // Reduzido ainda mais
    doc.setFontSize(18)
    const catFont = categoryFont === 'serif' ? 'times' : categoryFont
    doc.setFont(catFont as any, 'bold')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text(categoryName, margin, yPosition)
    yPosition += 2 // Reduzido ainda mais - próxima categoria começa logo após

    // Gerar produtos da categoria
    if (layout === 'list') {
      await generateListLayout(doc, categoryProducts, includeImages, yPosition, borderColor, backgroundColor, categoryFont, textColor)
      yPosition = (doc as any).lastAutoTable?.finalY || yPosition + categoryProducts.length * 8
    } else {
      const finalY = await generateGridLayout(doc, categoryProducts, includeImages, yPosition, borderColor, backgroundColor, categoryFont, imageBorder, textColor)
      yPosition = finalY
    }
  }
}

/**
 * Layout de lista (tabela) - apenas nome, foto e preço
 */
async function generateListLayout(
  doc: jsPDF,
  products: Product[],
  includeImages: boolean,
  startY: number,
  borderColor: string = '#e0e0e0',
  backgroundColor: string = '#f5f5f5',
  categoryFont: string = 'helvetica',
  textColor: [number, number, number] = [40, 40, 40]
): Promise<void> {
  const tableData = []

  for (const product of products) {
    const row = [
      product.name || '',
      `R$ ${product.price.toFixed(2).replace('.', ',')}`
    ]
    tableData.push(row)
  }

  const borderRgb = hexToRgb(borderColor)
  const bgColor2 = adjustBrightness(backgroundColor, -10)
  
  autoTable(doc, {
    startY,
    head: [['Nome', 'Preço']],
    body: tableData,
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [borderRgb[0], borderRgb[1], borderRgb[2]],
      lineWidth: 0.3
    },
    headStyles: {
      fillColor: [borderRgb[0], borderRgb[1], borderRgb[2]],
      textColor: 255,
      fontStyle: 'bold',
      lineColor: [borderRgb[0], borderRgb[1], borderRgb[2]]
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
      textColor: [30, 30, 30]
    },
    margin: { top: startY },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto', halign: 'right' }
    },
    didDrawPage: (data: any) => {
      // Redesenhar fundo em cada página que o autoTable criar
      drawGradientBackground(doc, backgroundColor, bgColor2)
    }
  })
}

/**
 * Layout de grade (com imagens pequenas) - Foto > Nome > Preço
 */
async function generateGridLayout(
  doc: jsPDF,
  products: Product[],
  includeImages: boolean,
  startY: number,
  borderColor: string = '#e0e0e0',
  backgroundColor: string = '#f5f5f5',
  categoryFont: string = 'helvetica',
  imageBorder: boolean = false,
  textColor: [number, number, number] = [40, 40, 40]
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const spacing = 2 // Reduzido ainda mais para evitar espaços grandes
  const itemWidth = (pageWidth - margin * 2 - spacing) / 2
  const textSpacing = 4 // Espaçamento aumentado entre imagem e texto para evitar invasão
  let y = startY

  // Preparar fonte para produtos
  const productFont = categoryFont === 'serif' ? 'times' : categoryFont
  const pageHeight = doc.internal.pageSize.getHeight()

  // Processar produtos em pares (2 por linha) para garantir simetria e uso eficiente do espaço
  for (let i = 0; i < products.length; i += 2) {
    const product1 = products[i]
    const product2 = products[i + 1]
    
    // Calcular altura do primeiro card
    doc.setFontSize(12)
    doc.setFont(productFont as any, 'bold')
    const name1 = product1.name || 'Sem nome'
    const nameWidth = itemWidth // Texto ocupa toda a largura do item
    const nameLines1 = doc.splitTextToSize(name1, nameWidth)
    const actualNameHeight1 = nameLines1.length * 5.5
    
    let imageHeight1 = 0
    let imageWidth1 = itemWidth
    if (includeImages && product1.image_url) {
      imageWidth1 = itemWidth
      imageHeight1 = imageWidth1
    }
    
    // Calcular altura total do card
    let cardHeight1 = 0
    if (includeImages && product1.image_url) {
      cardHeight1 += imageHeight1 + textSpacing // Imagem + espaçamento
    }
    cardHeight1 += actualNameHeight1 + textSpacing + 7 // Nome + espaçamento + preço
    
    // Calcular altura do segundo card (se existir)
    let cardHeight2 = 0
    let nameLines2: string[] = []
    let imageHeight2 = 0
    let imageWidth2 = itemWidth
    if (product2) {
      doc.setFontSize(12)
      doc.setFont(productFont as any, 'bold')
      const name2 = product2.name || 'Sem nome'
      nameLines2 = doc.splitTextToSize(name2, nameWidth)
      const actualNameHeight2 = nameLines2.length * 5.5
      if (includeImages && product2.image_url) {
        imageWidth2 = itemWidth
        imageHeight2 = imageWidth2
      }
      cardHeight2 = 0
      if (includeImages && product2.image_url) {
        cardHeight2 += imageHeight2 + textSpacing
      }
      cardHeight2 += actualNameHeight2 + textSpacing + 7
    }
    
    // Altura máxima da linha (maior dos dois cards) - garante simetria
    const rowHeight = Math.max(cardHeight1, cardHeight2)
    
    // Verificar se a linha completa cabe na página atual
    if (y + rowHeight + spacing > pageHeight - 20) {
      doc.addPage()
      const bgColor2 = adjustBrightness(backgroundColor, -10)
      drawGradientBackground(doc, backgroundColor, bgColor2)
      y = 20
    }
    
    const rowY = y
    
    // Desenhar primeiro card
    const x1 = margin
    let currentY = rowY
    
    // Imagem do primeiro produto
    if (includeImages && product1.image_url) {
      try {
        const imageBase64 = await imageUrlToBase64(product1.image_url)
        if (imageBase64) {
          const imageX = x1
          const imageY = currentY
          
          // Desenhar moldura APENAS ao redor da imagem (se imageBorder estiver ativado)
          if (imageBorder) {
            const borderRgb = hexToRgb(borderColor)
            doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2])
            doc.setLineWidth(1.6)
            doc.rect(imageX, imageY, imageWidth1, imageHeight1, 'D')
          }
          
          doc.addImage(imageBase64, 'JPEG', imageX, imageY, imageWidth1, imageHeight1)
          currentY += imageHeight1 + textSpacing
        }
      } catch (error) {
        console.error('Erro ao adicionar imagem:', error)
      }
    }
    
    // Nome do primeiro produto
    doc.setFontSize(12)
    doc.setFont(productFont as any, 'bold')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text(nameLines1, x1, currentY)
    currentY += actualNameHeight1 + textSpacing
    
    // Preço do primeiro produto
    doc.setFontSize(11)
    doc.setFont(productFont as any, 'bold')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text(`R$ ${product1.price.toFixed(2).replace('.', ',')}`, x1, currentY)
    
    // Desenhar segundo card (se existir) - alinhado na mesma linha com mesma altura
    if (product2) {
      const x2 = margin + itemWidth + spacing
      currentY = rowY // Começar na mesma altura do primeiro card
      
      // Imagem do segundo produto
      if (includeImages && product2.image_url) {
        try {
          const imageBase64 = await imageUrlToBase64(product2.image_url)
          if (imageBase64) {
            const imageX = x2
            const imageY = currentY
            
            // Desenhar moldura APENAS ao redor da imagem (se imageBorder estiver ativado)
            if (imageBorder) {
              const borderRgb = hexToRgb(borderColor)
              doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2])
              doc.setLineWidth(1.6)
              doc.rect(imageX, imageY, imageWidth2, imageHeight2, 'D')
            }
            
            doc.addImage(imageBase64, 'JPEG', imageX, imageY, imageWidth2, imageHeight2)
            currentY += imageHeight2 + textSpacing
          }
        } catch (error) {
          console.error('Erro ao adicionar imagem:', error)
        }
      }
      
      // Nome do segundo produto
      doc.setFontSize(12)
      doc.setFont(productFont as any, 'bold')
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.text(nameLines2, x2, currentY)
      currentY += nameLines2.length * 5.5 + textSpacing
      
      // Preço do segundo produto
      doc.setFontSize(11)
      doc.setFont(productFont as any, 'bold')
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.text(`R$ ${product2.price.toFixed(2).replace('.', ',')}`, x2, currentY)
    }
    
    // Avançar para próxima linha usando altura máxima (garante simetria e elimina espaços)
    y += rowHeight + spacing
  }
  
  return y
}

/**
 * Layout de cards detalhados - foto em destaque, nome e preço abaixo
 * Ajustado para caber até 2 produtos por página
 */
async function generateCardsLayout(
  doc: jsPDF,
  products: Product[],
  includeImages: boolean,
  startY: number,
  borderColor: string = '#e0e0e0',
  backgroundColor: string = '#f5f5f5',
  categoryFont: string = 'helvetica',
  imageBorder: boolean = false,
  textColor: [number, number, number] = [40, 40, 40]
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const spacing = 6 // Reduzido de 10 para 6
  const cardWidth = (pageWidth - margin * 2 - spacing) / 2 // Largura para 2 cards lado a lado
  const textPadding = 4 // Reduzido de 6 para 4
  const priceHeight = 10
  let y = startY

  // Preparar fonte para produtos
  const productFont = categoryFont === 'serif' ? 'times' : categoryFont

  for (let i = 0; i < products.length; i += 2) {
    // Processar 2 cards por vez (uma linha)
    const product1 = products[i]
    const product2 = products[i + 1]
    
    // Calcular altura do primeiro card
    doc.setFontSize(11)
    doc.setFont(productFont as any, 'normal')
    const name1 = product1.name || 'Sem nome'
    const nameWidth = cardWidth
    const nameLines1 = doc.splitTextToSize(name1, nameWidth)
    const actualNameHeight1 = nameLines1.length * 4.5
    
    // Calcular altura da imagem (largura da janela mantendo proporção)
    let imageHeight1 = 0
    let imageWidth1 = cardWidth
    if (includeImages && product1.image_url) {
      imageWidth1 = cardWidth
      imageHeight1 = cardWidth // Por padrão, quadrada
    }
    
    let totalCardHeight1 = textPadding
    if (includeImages && product1.image_url) {
      totalCardHeight1 += imageHeight1 + 3 // Reduzido espaçamento após imagem
    }
    totalCardHeight1 += actualNameHeight1 + 3 + priceHeight + textPadding // Reduzido espaçamento entre nome e preço
    
    // Calcular altura do segundo card (se existir)
    let totalCardHeight2 = 0
    let nameLines2: string[] = []
    let imageHeight2 = 0
    let imageWidth2 = cardWidth
    if (product2) {
      const name2 = product2.name || 'Sem nome'
      nameLines2 = doc.splitTextToSize(name2, nameWidth)
      const actualNameHeight2 = nameLines2.length * 4.5
      if (includeImages && product2.image_url) {
        imageWidth2 = cardWidth
        imageHeight2 = cardWidth
      }
      totalCardHeight2 = textPadding
      if (includeImages && product2.image_url) {
        totalCardHeight2 += imageHeight2 + 3 // Reduzido espaçamento após imagem
      }
      totalCardHeight2 += actualNameHeight2 + 3 + priceHeight + textPadding // Reduzido espaçamento entre nome e preço
    }
    
    // Altura máxima da linha (maior dos dois cards) - garantir simetria
    const rowHeight = Math.max(totalCardHeight1, totalCardHeight2)
    
    // Verificar se precisa de nova página
    if (y + rowHeight + spacing > pageHeight - 20) {
      doc.addPage()
      const bgColor2 = adjustBrightness(backgroundColor, -10)
      drawGradientBackground(doc, backgroundColor, bgColor2)
      y = 20
    }
    
    const cardY = y
    
    // Desenhar primeiro card (sem moldura do card, apenas conteúdo)
    const x1 = margin
    let currentY = cardY + textPadding
    
    // Imagem do primeiro produto (solta, ocupando largura disponível)
    if (includeImages && product1.image_url) {
      try {
        const imageBase64 = await imageUrlToBase64(product1.image_url)
        if (imageBase64) {
          const imageX = x1
          
          // Aplicar moldura apenas na foto se solicitado
          if (imageBorder) {
            const borderRgb = hexToRgb(borderColor)
            doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2])
            doc.setLineWidth(1.6) // Aumentado para 2x mais grosso (de 0.8 para 1.6)
            doc.rect(imageX, currentY, imageWidth1, imageHeight1, 'D')
          }
          
          // Imagem sem fundo branco (solta)
          doc.addImage(imageBase64, 'JPEG', imageX, currentY, imageWidth1, imageHeight1)
          currentY += imageHeight1 + 3 // Reduzido espaçamento após imagem
        }
      } catch (error) {
        console.error('Erro ao adicionar imagem:', error)
        if (includeImages) {
          currentY += textPadding
        }
      }
    }
    
    // Nome do primeiro produto
    doc.setFontSize(11)
    doc.setFont(productFont as any, 'normal')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text(nameLines1, x1, currentY)
    currentY += actualNameHeight1 + 3 // Reduzido espaçamento após nome
    
    // Preço do primeiro produto
    doc.setFontSize(12)
    doc.setFont(productFont as any, 'bold')
    const priceText1 = `R$ ${product1.price.toFixed(2).replace('.', ',')}`
    const priceWidth1 = doc.getTextWidth(priceText1)
    const priceX1 = x1 + (cardWidth - priceWidth1) / 2
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text(priceText1, priceX1, currentY)
    
    // Desenhar segundo card (se existir)
    if (product2) {
      const x2 = margin + cardWidth + spacing
      currentY = cardY + textPadding
      
      // Imagem do segundo produto (solta, ocupando largura disponível)
      if (includeImages && product2.image_url) {
        try {
          const imageBase64 = await imageUrlToBase64(product2.image_url)
          if (imageBase64) {
            const imageX = x2
            
            // Aplicar moldura apenas na foto se solicitado
            if (imageBorder) {
              const borderRgb = hexToRgb(borderColor)
              doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2])
              doc.setLineWidth(1.6) // Aumentado para 2x mais grosso (de 0.8 para 1.6)
              doc.rect(imageX, currentY, imageWidth2, imageHeight2, 'D')
            }
            
            // Imagem sem fundo branco (solta)
            doc.addImage(imageBase64, 'JPEG', imageX, currentY, imageWidth2, imageHeight2)
            currentY += imageHeight2 + 3 // Reduzido espaçamento após imagem
          }
        } catch (error) {
          console.error('Erro ao adicionar imagem:', error)
          if (includeImages) {
            currentY += textPadding
          }
        }
      }
      
      // Nome do segundo produto
      doc.setFontSize(11)
      doc.setFont(productFont as any, 'normal')
      const actualNameHeight2 = nameLines2.length * 4.5
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.text(nameLines2, x2, currentY)
      currentY += actualNameHeight2 + 3 // Reduzido espaçamento após nome
      
      // Preço do segundo produto
      doc.setFontSize(12)
      doc.setFont(productFont as any, 'bold')
      const priceText2 = `R$ ${product2.price.toFixed(2).replace('.', ',')}`
      const priceWidth2 = doc.getTextWidth(priceText2)
      const priceX2 = x2 + (cardWidth - priceWidth2) / 2
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.text(priceText2, priceX2, currentY)
    }
    
    // Avançar para próxima linha
    y += rowHeight + spacing
  }
  
  return y
}
