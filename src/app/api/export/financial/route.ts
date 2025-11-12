import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FinancialTransaction } from '@/types/financial'

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactions, stats, userName } = body as {
      transactions: FinancialTransaction[]
      stats: {
        totalRevenue: number
        totalExpenses: number
        netProfit: number
        cashBalance: number
        stockValue: number
      }
      userName?: string
    }

    // Gerar PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Cores
    const primaryColor: [number, number, number] = [52, 152, 219] // Azul

    // Cabeçalho
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, pageWidth, 30, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório Financeiro', 14, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 27)

    let yPos = 40

    // Resumo Financeiro
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo Financeiro', 14, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Receita Total: R$ ${stats.totalRevenue.toFixed(2)}`, 14, yPos)
    yPos += 7
    doc.text(`Despesas Totais: R$ ${stats.totalExpenses.toFixed(2)}`, 14, yPos)
    yPos += 7
    doc.text(`Lucro Líquido: R$ ${stats.netProfit.toFixed(2)}`, 14, yPos)
    yPos += 7
    doc.text(`Saldo em Caixa: R$ ${stats.cashBalance.toFixed(2)}`, 14, yPos)
    yPos += 7
    doc.text(`Valor em Estoque: R$ ${stats.stockValue.toFixed(2)}`, 14, yPos)
    yPos += 15

    // Tabela de Transações
    if (transactions.length > 0) {
      const tableData = transactions.slice(0, 50).map(tx => [
        parseLocalDate(tx.date).toLocaleDateString('pt-BR'),
        tx.type === 'income' ? 'Receita' : 'Despesa',
        (tx.description || tx.category || '-').substring(0, 40),
        tx.category || '-',
        `R$ ${tx.amount.toFixed(2)}`
      ])

      autoTable(doc, {
        head: [['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor']],
        body: tableData,
        startY: yPos,
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: {
          fillColor: primaryColor as [number, number, number],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 60 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      })

      const finalY = (doc as any).lastAutoTable?.finalY || yPos
      yPos = finalY + 10
    }

    // Rodapé
    if (yPos > pageHeight - 20) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Relatório gerado por Fullstack Gestor AI - ${userName || 'Usuário'}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    // Gerar buffer do PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio_financeiro_${getLocalDateString()}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar exportação:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar exportação', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

