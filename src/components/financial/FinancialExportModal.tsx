'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { FinancialTransaction } from '@/types/financial'

interface FinancialExportModalProps {
  isOpen: boolean
  onClose: () => void
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

export function FinancialExportModal({
  isOpen,
  onClose,
  transactions,
  stats,
  userName = 'Usuário'
}: FinancialExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    if (typeof window === 'undefined') {
      toast.error('Exportação disponível apenas no navegador')
      return
    }
    
    setIsExporting(true)
    try {
      const response = await fetch('/api/export/financial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          stats,
          userName
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar PDF')
      }

      // Criar blob e fazer download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Relatório PDF gerado com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório PDF')
    } finally {
      setIsExporting(false)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Exportar Relatório Financeiro</DialogTitle>
          <DialogDescription>
            Gere um relatório financeiro completo em PDF
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            className="w-full h-auto py-6 flex flex-col items-center gap-3"
            variant="outline"
          >
            {isExporting ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <FileText className="w-8 h-8" />
            )}
            <span className="font-semibold text-lg">Exportar Relatório PDF</span>
            <span className="text-xs text-muted-foreground">Relatório completo com tabelas, gráficos e resumo financeiro</span>
          </Button>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {transactions.length} transação(ões) serão exportada(s)
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

