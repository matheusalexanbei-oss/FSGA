'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import type { Product } from '@/types/product'
import type { Category } from '@/lib/categories'
import { exportProducts, filterProducts, type ProductFilters } from '@/lib/export/products'
import { toast } from 'sonner'

interface ProductExportModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  categories: Category[]
}

export function ProductExportModal({
  isOpen,
  onClose,
  products,
  categories
}: ProductExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'excel'>('excel')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [inStock, setInStock] = useState<boolean | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  // Resetar filtros quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryIds([])
      setSearchTerm('')
      setInStock(undefined)
      setFormat('excel')
    }
  }, [isOpen])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      }
      return [...prev, categoryId]
    })
  }

  const handleExport = async () => {
    try {
      setLoading(true)

      // Aplicar filtros
      const filters: ProductFilters = {
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        searchTerm: searchTerm || undefined,
        inStock: inStock === true ? true : inStock === false ? undefined : undefined,
        outOfStock: inStock === false ? true : undefined
      }

      const filtered = filterProducts(products, filters)

      if (filtered.length === 0) {
        toast.error('Nenhum produto encontrado com os filtros selecionados')
        return
      }

      // Exportar
      exportProducts(filtered, {
        format,
        filename: `produtos_${new Date().toISOString().split('T')[0]}`
      })

      toast.success(`${filtered.length} produto(s) exportado(s) com sucesso!`)
      onClose()
    } catch (error) {
      console.error('Erro ao exportar produtos:', error)
      toast.error('Erro ao exportar produtos')
    } finally {
      setLoading(false)
    }
  }

  // Calcular produtos filtrados para preview
  const previewFilters: ProductFilters = {
    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    searchTerm: searchTerm || undefined,
    inStock: inStock === true ? true : undefined,
    outOfStock: inStock === false ? true : undefined
  }
  const filteredCount = filterProducts(products, previewFilters).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar Produtos</DialogTitle>
          <DialogDescription>
            Selecione os filtros e formato para exportar seus produtos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Formato de Exportação */}
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={format === 'excel' ? 'default' : 'outline'}
                onClick={() => setFormat('excel')}
                className="flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel (.xlsx)
              </Button>
              <Button
                type="button"
                variant={format === 'csv' ? 'default' : 'outline'}
                onClick={() => setFormat('csv')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                CSV (.csv)
              </Button>
            </div>
          </div>

          {/* Busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Produtos</Label>
            <Input
              id="search"
              placeholder="Nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por Categoria */}
          <div className="space-y-2">
            <Label>Filtrar por Categoria</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma categoria disponível</p>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-categories"
                      checked={selectedCategoryIds.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategoryIds([])
                        }
                      }}
                    />
                    <label
                      htmlFor="all-categories"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Todas as categorias
                    </label>
                  </div>
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategoryIds.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Filtro por Estoque */}
          <div className="space-y-2">
            <Label>Filtrar por Estoque</Label>
            <Select
              value={inStock === undefined ? 'all' : inStock ? 'in-stock' : 'out-of-stock'}
              onValueChange={(value) => {
                if (value === 'all') setInStock(undefined)
                else if (value === 'in-stock') setInStock(true)
                else setInStock(false)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                <SelectItem value="in-stock">Apenas com estoque</SelectItem>
                <SelectItem value="out-of-stock">Apenas sem estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-1">Preview</p>
            <p className="text-sm text-muted-foreground">
              {filteredCount} de {products.length} produto(s) serão exportados
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={loading || filteredCount === 0}>
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Exportando...' : 'Exportar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

