/**
 * Utilitários para exportação em formato CSV
 */

export interface ExportOptions {
  filename?: string
  includeHeaders?: boolean
  delimiter?: string
}

/**
 * Converte um array de objetos em CSV
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  options: ExportOptions = {}
): string {
  const {
    includeHeaders = true,
    delimiter = ','
  } = options

  const rows: string[] = []

  // Adicionar cabeçalhos
  if (includeHeaders) {
    const headers = columns.map(col => escapeCSVValue(col.label, delimiter))
    rows.push(headers.join(delimiter))
  }

  // Adicionar dados
  data.forEach(item => {
    const values = columns.map(col => {
      const value = item[col.key]
      return escapeCSVValue(formatCSVValue(value), delimiter)
    })
    rows.push(values.join(delimiter))
  })

  return rows.join('\n')
}

/**
 * Escapa valores CSV (trata vírgulas, aspas e quebras de linha)
 */
function escapeCSVValue(value: any, delimiter: string = ','): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)
  
  // Se contém vírgula, aspas ou quebra de linha, precisa ser envolvido em aspas
  if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escapar aspas duplicando-as
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Formata valores para CSV
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não'
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('pt-BR')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Faz download de um arquivo CSV
 */
export function downloadCSV(content: string, filename: string = 'export.csv'): void {
  // Adicionar BOM para UTF-8 (ajuda Excel a reconhecer acentuação)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

