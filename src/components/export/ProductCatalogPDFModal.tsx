'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText } from 'lucide-react'
import type { Product } from '@/types/product'
import type { Category } from '@/lib/categories'
import { generateProductCatalogPDF, type PDFCatalogOptions } from '@/lib/export/pdf'
import { filterProducts, type ProductFilters } from '@/lib/export/products'
import { toast } from 'sonner'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { createClient } from '@/lib/supabase/client'

interface ProductCatalogPDFModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  categories: Category[]
}

export function ProductCatalogPDFModal({
  isOpen,
  onClose,
  products,
  categories
}: ProductCatalogPDFModalProps) {
  const { user } = useHybridAuth()
  const [layout, setLayout] = useState<'list' | 'grid'>('grid')
  const [includeImages, setIncludeImages] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Novas opções de customização
  const [backgroundColor, setBackgroundColor] = useState('#f5f5f5')
  const [borderColor, setBorderColor] = useState('#e0e0e0')
  const [titleFont, setTitleFont] = useState('helvetica')
  const [categoryFont, setCategoryFont] = useState('helvetica')
  const [imageBorder, setImageBorder] = useState(false) // Nova opção: moldura apenas na foto

  // Log do estado do layout
  useEffect(() => {
    console.log('📊 [Layout State] Layout atual:', layout)
    console.log('📊 [Layout State] IncludeImages:', includeImages)
  }, [layout, includeImages])

  // Carregar perfil do usuário para obter nome do negócio
  useEffect(() => {
    if (isOpen && user?.id) {
      const loadUserProfile = async () => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('users_profile')
            .select('business_name')
            .eq('id', user.id)
            .single()

          if (error) {
            // Ignorar erro silenciosamente se a tabela não existir ou não houver dados
            // PGRST116 = Not Acceptable (406), PGRST301 = No rows returned, 42703 = column does not exist
            const isEmptyError = Object.keys(error).length === 0
            const isIgnoredCode = error.code === 'PGRST116' || error.code === 'PGRST301' || error.code === '42703'
            
            if (!isEmptyError && !isIgnoredCode) {
              console.error('Erro ao carregar perfil:', error)
            }
            return
          }

          if (!data) {
            // Se não houver dados, apenas retornar sem erro
            return
          }

          if (data && typeof data === 'object' && 'business_name' in data) {
            const profileData = data as { business_name?: string }
            setUserProfile(profileData)
            setBusinessName(profileData.business_name || '')
          }
        } catch (error: any) {
          // Ignorar erros silenciosamente se a tabela não existir ou não houver dados
          const isEmptyError = !error || Object.keys(error).length === 0
          const isIgnoredCode = error?.code === 'PGRST116' || error?.code === 'PGRST301' || error?.code === '42703'
          
          if (!isEmptyError && !isIgnoredCode) {
            console.error('Erro ao carregar perfil:', error)
          }
        }
      }
      loadUserProfile()
    }
  }, [isOpen, user?.id])

  // Resetar filtros quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryIds([])
      setSearchTerm('')
      setLayout('grid')
      setIncludeImages(true)
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

  const handleGeneratePDF = async () => {
    try {
      setLoading(true)

      // Aplicar filtros básicos
      const filters: ProductFilters = {
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        searchTerm: searchTerm || undefined,
        inStock: true, // SEMPRE filtrar apenas produtos com estoque > 0
        outOfStock: undefined
      }

      let filtered = filterProducts(products, filters)

      // Filtrar produtos sem foto apenas se includeImages estiver ativo
      const productsWithoutImage: Product[] = []
      if (includeImages) {
        filtered = filtered.filter(product => {
          if (!product.image_url) {
            productsWithoutImage.push(product)
            return false
          }
          return true
        })
        
        if (productsWithoutImage.length > 0) {
          toast.warning(
            `${productsWithoutImage.length} produto(s) sem foto foram excluídos do catálogo`,
            { duration: 5000 }
          )
        }
      }

      if (filtered.length === 0) {
        toast.error('Nenhum produto encontrado com os filtros selecionados')
        return
      }

      // Gerar PDF
      const options: PDFCatalogOptions = {
        filename: `catalogo_${new Date().toISOString().split('T')[0]}.pdf`,
        layout,
        includeImages,
        businessName: businessName || undefined,
        logoUrl: userProfile?.logo_url || undefined,
        backgroundColor,
        borderColor,
        titleFont: titleFont as 'helvetica' | 'times' | 'courier' | 'serif' | undefined,
        categoryFont: categoryFont as 'helvetica' | 'times' | 'courier' | 'serif' | undefined,
        groupByCategory: true,
        imageBorder // Nova opção
      }

      await generateProductCatalogPDF(filtered, options)

      const excludedCount = productsWithoutImage.length
      const message = excludedCount > 0
        ? `Catálogo PDF gerado com ${filtered.length} produto(s)! ${excludedCount} produto(s) sem foto foram excluídos.`
        : `Catálogo PDF gerado com ${filtered.length} produto(s)!`
      
      toast.success(message, { duration: 5000 })
      onClose()
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar catálogo PDF')
    } finally {
      setLoading(false)
    }
  }

  // Calcular produtos filtrados para preview
  const previewFilters: ProductFilters = {
    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    searchTerm: searchTerm || undefined,
    inStock: true, // SEMPRE mostrar apenas produtos com estoque > 0
    outOfStock: undefined
  }
  let previewFiltered = filterProducts(products, previewFilters)
  
  // Filtrar produtos sem foto no preview apenas se includeImages estiver ativo
  const excludedByNoImage = includeImages 
    ? previewFiltered.filter(p => !p.image_url).length 
    : 0
  
  if (includeImages) {
    previewFiltered = previewFiltered.filter(p => p.image_url)
  }
  
  const filteredCount = previewFiltered.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Gerar Catálogo PDF</DialogTitle>
          <DialogDescription>
            Configure as opções para gerar seu catálogo de produtos em PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nome do Negócio */}
          <div className="space-y-2">
            <Label htmlFor="business-name">Nome do Negócio (opcional)</Label>
            <Input
              id="business-name"
              placeholder="Meu Negócio"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          {/* Layout */}
          <div className="space-y-2">
            <Label htmlFor="layout">Layout do Catálogo</Label>
            <Select 
              value={layout} 
              onValueChange={(value) => {
                console.log('🔍 [Select] onValueChange chamado com:', value)
                console.log('🔍 [Select] Tipo do valor:', typeof value)
                if (value === 'list' || value === 'grid') {
                  console.log('✅ [Select] Valor válido, atualizando layout para:', value)
                  setLayout(value as 'list' | 'grid')
                } else {
                  console.warn('⚠️ [Select] Valor inválido recebido:', value)
                }
              }}
            >
              <SelectTrigger
                id="layout" 
                className="w-full"
                onClick={() => console.log('🖱️ [Select] Trigger clicado')}
              >
                <SelectValue placeholder="Selecione o layout" />
              </SelectTrigger>
              <SelectContent 
                className="z-[100001]"
                position="popper"
                sideOffset={5}
              >
                <SelectItem value="list">
                  Lista (Tabela - sem fotos)
                </SelectItem>
                <SelectItem value="grid">
                  Grade 2 colunas (com fotos)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {includeImages 
                ? 'O catálogo incluirá fotos, nomes e preços dos produtos'
                : 'O catálogo incluirá apenas nomes e preços dos produtos'}
            </p>
          </div>

          {/* Incluir Imagens */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-images"
              checked={includeImages}
              onCheckedChange={(checked) => {
                console.log('☑️ [Checkbox] Incluir imagens alterado para:', checked)
                setIncludeImages(checked === true)
              }}
            />
            <label
              htmlFor="include-images"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Incluir imagens dos produtos
            </label>
          </div>

          {/* Cores e Fontes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="bg-color">Cor de Fundo</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="bg-color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                  placeholder="#f5f5f5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="border-color">Cor das Molduras (apenas na foto)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="border-color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="flex-1"
                  placeholder="#e0e0e0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="image-border"
                  checked={imageBorder}
                  onChange={(e) => setImageBorder(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="image-border" className="cursor-pointer">
                  Adicionar moldura nas fotos
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title-font">Fonte do Título</Label>
              <Select value={titleFont} onValueChange={setTitleFont}>
                <SelectTrigger id="title-font" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100001]">
                  <SelectItem value="helvetica">Helvetica (Sans-serif Moderna)</SelectItem>
                  <SelectItem value="times">Times (Serif Clássica)</SelectItem>
                  <SelectItem value="serif">Serif Elegante</SelectItem>
                  <SelectItem value="courier">Courier (Monoespaçada)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-font">Fonte das Categorias</Label>
              <Select value={categoryFont} onValueChange={setCategoryFont}>
                <SelectTrigger id="category-font" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100001]">
                  <SelectItem value="helvetica">Helvetica (Sans-serif Moderna)</SelectItem>
                  <SelectItem value="times">Times (Serif Clássica)</SelectItem>
                  <SelectItem value="serif">Serif Elegante</SelectItem>
                  <SelectItem value="courier">Courier (Monoespaçada)</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2 bg-background dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma categoria disponível</p>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-categories-pdf"
                      checked={selectedCategoryIds.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategoryIds([])
                        }
                      }}
                    />
                    <label
                      htmlFor="all-categories-pdf"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Todas as categorias
                    </label>
                  </div>
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-pdf-${category.id}`}
                        checked={selectedCategoryIds.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={`category-pdf-${category.id}`}
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

          {/* Informação sobre filtros automáticos */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Filtros Automáticos</p>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
              <p>• Apenas produtos com estoque &gt; 0 serão incluídos</p>
              {includeImages && (
                <p>• Produtos sem foto serão excluídos automaticamente</p>
              )}
              <p>• O catálogo incluirá {includeImages ? 'fotos, ' : ''}nomes e preços</p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium mb-1">Preview</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredCount}</span> de {products.length} produto(s) serão incluídos no PDF
            </p>
            {excludedByNoImage > 0 && (
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ {excludedByNoImage} produto(s) sem foto serão excluídos
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleGeneratePDF} disabled={loading || filteredCount === 0}>
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Gerando PDF...' : 'Gerar PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

