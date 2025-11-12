/**
 * Utilitários para exportação em formato Excel usando xlsx
 */

import * as XLSX from 'xlsx'
import type { Product } from '@/types/product'
import type { FinancialTransaction } from '@/types/financial'

export interface ExcelExportOptions {
  filename?: string
  sheetName?: string
  includeHeaders?: boolean
}

/**
 * Exporta produtos para Excel
 */
export function exportProductsToExcel(
  products: Product[],
  options: ExcelExportOptions = {}
): void {
  const {
    filename = 'produtos',
    sheetName = 'Produtos',
    includeHeaders = true
  } = options

  // Preparar dados para Excel
  const data = products.map(product => ({
    'Nome': product.name || '',
    'Descrição': product.description || '',
    'Código': product.code || '',
    'Categoria': product.category?.name || 'Sem Categoria',
    'Preço': product.price || 0,
    'Custo': product.cost || 0,
    'Estoque': product.stock_quantity || 0,
    'Valor Total Estoque': (product.price || 0) * (product.stock_quantity || 0),
    'Data de Criação': product.created_at ? new Date(product.created_at).toLocaleDateString('pt-BR') : '',
    'Última Atualização': product.updated_at ? new Date(product.updated_at).toLocaleDateString('pt-BR') : ''
  }))

  // Criar workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 30 }, // Nome
    { wch: 40 }, // Descrição
    { wch: 15 }, // Código
    { wch: 20 }, // Categoria
    { wch: 12 }, // Preço
    { wch: 12 }, // Custo
    { wch: 10 }, // Estoque
    { wch: 18 }, // Valor Total Estoque
    { wch: 15 }, // Data de Criação
    { wch: 18 }  // Última Atualização
  ]
  ws['!cols'] = colWidths

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Fazer download
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Exporta transações financeiras para Excel
 */
export function exportTransactionsToExcel(
  transactions: FinancialTransaction[],
  options: ExcelExportOptions = {}
): void {
  const {
    filename = 'transacoes_financeiras',
    sheetName = 'Transações',
    includeHeaders = true
  } = options

  // Preparar dados para Excel
  const data = transactions.map(transaction => ({
    'Data': transaction.date ? new Date(transaction.date).toLocaleDateString('pt-BR') : '',
    'Tipo': transaction.type === 'income' ? 'Receita' : 'Despesa',
    'Descrição': transaction.description || '',
    'Categoria': transaction.category || '',
    'Valor': transaction.amount || 0,
    'Método de Pagamento': transaction.payment_method || '',
    'Status': transaction.is_paid === false ? 'Pendente' : 'Pago',
    'Data Agendada': transaction.scheduled_date ? new Date(transaction.scheduled_date).toLocaleDateString('pt-BR') : '',
    'Parcelamento': transaction.is_installment ? `Parcela ${transaction.installment_number}/${transaction.installment_count}` : 'Não',
    'Observações': transaction.notes || '',
    'Data de Criação': transaction.created_at ? new Date(transaction.created_at).toLocaleDateString('pt-BR') : ''
  }))

  // Criar workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // Data
    { wch: 12 }, // Tipo
    { wch: 30 }, // Descrição
    { wch: 20 }, // Categoria
    { wch: 12 }, // Valor
    { wch: 18 }, // Método de Pagamento
    { wch: 12 }, // Status
    { wch: 15 }, // Data Agendada
    { wch: 20 }, // Parcelamento
    { wch: 30 }, // Observações
    { wch: 15 }  // Data de Criação
  ]
  ws['!cols'] = colWidths

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Fazer download
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Exporta múltiplas planilhas para um único arquivo Excel
 */
export function exportMultipleSheetsToExcel(
  sheets: { name: string; data: any[] }[],
  filename: string = 'export'
): void {
  const wb = XLSX.utils.book_new()

  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, name)
  })

  XLSX.writeFile(wb, `${filename}.xlsx`)
}
