'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useSecureAuth } from '@/hooks/useSecureAuth'
import type { Product } from '@/types/product'

interface ProductEditDialogProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProduct: Product) => void
}

export function ProductEditDialog({ product, isOpen, onClose, onSave }: ProductEditDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    price: '',
    cost: '',
    stock_quantity: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, useSupabase } = useSecureAuth()

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        code: product.code || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || ''
      })
      setImageFile(product.image_url)
    }
  }, [product, isOpen])

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      if (!user?.id) {
        toast.error('Usuário não autenticado')
        return null
      }

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo inválido. Apenas JPG, PNG, WebP são permitidos.')
        return null
      }

      // Validar tamanho do arquivo (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('O arquivo é muito grande. O tamanho máximo permitido é 10MB.')
        return null
      }

      const supabase = createClient()
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload para Supabase Storage
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro no upload:', error)
        toast.error('Erro ao fazer upload da imagem')
        return null
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return publicUrl

    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload da imagem')
      return null
    }
  }

  const handleFileSelect = async (file: File) => {
    const uploadedUrl = await handleImageUpload(file)
    if (uploadedUrl) {
      setImageFile(uploadedUrl)
      toast.success('Imagem adicionada com sucesso!')
    }
  }

  const handleSave = async () => {
    if (!product || !user?.id) return

    setIsLoading(true)
    try {
      const updatedProduct = {
        ...product,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        code: formData.code.trim() || null,
        price: parseFloat(formData.price) || 0,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        image_url: imageFile,
        updated_at: new Date().toISOString()
      }

      if (useSupabase) {
        const supabase = createClient()
        const { error } = await supabase
          .from('products')
          .update({
            name: updatedProduct.name,
            description: updatedProduct.description,
            code: updatedProduct.code,
            price: updatedProduct.price,
            cost: updatedProduct.cost,
            stock_quantity: updatedProduct.stock_quantity,
            updated_at: updatedProduct.updated_at
          })
          .eq('id', product.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('❌ Erro ao atualizar produto no Supabase:', error)
          toast.error('Erro ao atualizar produto: ' + error.message)
          return
        }
        console.log('✅ Produto atualizado no Supabase')
      } else {
        // Atualizar no localStorage
        const storedProducts = localStorage.getItem(`products_${user.id}`)
        const existingProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : []
        
        const updatedProducts = existingProducts.map(p => 
          p.id === product.id ? updatedProduct : p
        )
        
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
        console.log('✅ Produto atualizado no localStorage')
      }

      onSave(updatedProduct)
      toast.success('Produto atualizado com sucesso!')
      onClose()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Erro ao atualizar produto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-0 bg-white shadow-xl">
        <Card className="w-80 mx-auto rounded-xl">
          <CardHeader className="pb-2">
            <DialogTitle className="text-base text-center">Editar Produto</DialogTitle>
            <DialogDescription className="text-xs text-center text-muted-foreground">
              Edite as informações do produto abaixo
            </DialogDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              {/* Nome */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs text-muted-foreground">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome"
                  className="h-6 text-xs"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs text-muted-foreground">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição"
                  className="h-6 text-xs"
                />
              </div>

              {/* Preço e Estoque */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="price" className="text-xs text-muted-foreground">Preço</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0,00"
                    className="h-6 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="stock" className="text-xs text-muted-foreground">Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    placeholder="0"
                    className="h-6 text-xs"
                  />
                </div>
              </div>

              {/* Botão para adicionar foto */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Foto do Produto</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  disabled={isLoading}
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="w-full h-6 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  📷 {imageFile ? 'Alterar Foto' : 'Adicionar Foto'}
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 mt-4">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={isLoading} 
                size="sm" 
                className="h-9 px-6 text-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isLoading} 
                size="sm" 
                className="h-9 px-6 text-sm bg-blue-600 text-white hover:bg-blue-700 border-0"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
