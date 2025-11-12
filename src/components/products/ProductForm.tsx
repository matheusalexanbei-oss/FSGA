'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ImageUpload } from './ImageUpload'
import { CategorySelect } from './CategorySelect'
import { DuplicateProductDialog } from './DuplicateProductDialog'
import { useSecureAuth } from '@/hooks/useSecureAuth'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { checkForDuplicateProduct as checkDuplicate } from '@/lib/products/duplicate-check'
import { Loader2 } from 'lucide-react'
import type { Product } from '@/types/product'

// Função para converter valores brasileiros para números
const parseBrazilianNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0
  // Substituir vírgula por ponto e converter para número
  const cleanValue = value.replace(',', '.').replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

// Função para validar números brasileiros
const validateBrazilianNumber = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') return null
  
  const cleanValue = value.replace(',', '.').replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleanValue)
  
  if (isNaN(parsed)) {
    return `${fieldName} deve ser um número válido`
  }
  
  if (parsed < 0) {
    return `${fieldName} deve ser maior ou igual a 0`
  }
  
  return null
}

const productFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  code: z.string().optional(),
  price: z.string().min(1, 'Preço é obrigatório'),
  cost: z.string().optional(),
  stock_quantity: z.string().min(1, 'Quantidade em estoque é obrigatória'),
  category_id: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormProps {
  product?: Product
  initialData?: { [key: string]: unknown }
  onSuccess?: () => void
}

export function ProductForm({ product, initialData, onSuccess }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<string | null>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateProduct, setDuplicateProduct] = useState<Product | null>(null)
  const [pendingProductData, setPendingProductData] = useState<any>(null)

  const { user, isAuthenticated, useSupabase } = useSecureAuth()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: (initialData?.name as string) || product?.name || '',
      description: (initialData?.description as string) || product?.description || '',
      code: product?.code || '',
      price: initialData?.price?.toString() || product?.price?.toString() || '0',
      cost: product?.cost?.toString() || '0',
      stock_quantity: product?.stock_quantity?.toString() || '0',
      category_id: product?.category_id || '',
    },
  })


  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true)

    try {
      if (!user || !isAuthenticated) {
        toast.error('Usuário não autenticado')
        router.push('/login')
        return
      }

      console.log('✅ Usuário autenticado via sistema híbrido:', user.id)

      let imageUrl = product?.image_url || null

      // Use image URL if provided (uploaded via ImageUpload component)
      if (imageFile) {
        imageUrl = imageFile
        // Delete old image if updating
        if (product?.image_url) {
          const oldPath = product.image_url.split('/product-images/')[1]
          if (oldPath) {
            // Simular deleção da imagem antiga
            console.log('Simulando deleção da imagem antiga:', oldPath)
          }
        }
      }

      // Validar valores numéricos
      const priceError = validateBrazilianNumber(values.price, 'Preço')
      const costError = values.cost ? validateBrazilianNumber(values.cost, 'Custo') : null
      const stockError = validateBrazilianNumber(values.stock_quantity, 'Estoque')

      if (priceError) {
        toast.error(priceError)
        return
      }
      if (costError) {
        toast.error(costError)
        return
      }
      if (stockError) {
        toast.error(stockError)
        return
      }

      // Processar valores convertendo strings para números
      const productData = {
        name: values.name,
        description: values.description || null,
        code: values.code || null,
        price: parseBrazilianNumber(values.price),
        cost: values.cost ? parseBrazilianNumber(values.cost) : null,
        stock_quantity: parseBrazilianNumber(values.stock_quantity),
        category_id: values.category_id || null,
        user_id: user.id,
        image_url: imageUrl,
        ai_processed: false,
      }

      // Verificar duplicata ANTES de salvar (apenas para novos produtos)
      if (!product) {
        const duplicate = await checkDuplicate(productData.name, productData.code, user.id, useSupabase)
        if (duplicate) {
          setDuplicateProduct(duplicate)
          setPendingProductData(productData)
          setShowDuplicateDialog(true)
          setIsSubmitting(false)
          return
        }
      }

      if (product) {
        // Atualizar produto existente
        if (useSupabase) {
          const supabase = createClient()
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', product.id)
            .eq('user_id', user.id)

          if (error) {
            console.error('❌ Erro ao atualizar produto no Supabase:', error)
            toast.error('Erro ao atualizar produto')
            return
          }
          console.log('✅ Produto atualizado no Supabase:', productData)
        } else {
          // Atualizar no localStorage
          const storedProducts = localStorage.getItem(`products_${user.id}`)
          const existingProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : []
          
          const updatedProducts = existingProducts.map(p => 
            p.id === product.id ? { ...productData, id: product.id, updated_at: new Date().toISOString() } : p
          )
          
          localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
          console.log('✅ Produto atualizado no localStorage:', productData)
        }
        toast.success('Produto atualizado com sucesso!')
      } else {
        // Criar novo produto
        const newProduct = {
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        if (useSupabase) {
          const supabase = createClient()
          console.log('🔍 Tentando inserir produto no Supabase:', newProduct)
          
          const { data, error } = await supabase
            .from('products')
            .insert(newProduct)
            .select()

          if (error) {
            console.error('❌ Erro ao criar produto no Supabase:', error)
            console.error('❌ Dados do produto:', newProduct)
            toast.error('Erro ao criar produto: ' + error.message)
            return
          }
          console.log('✅ Produto criado no Supabase:', data)
        } else {
          // Criar no localStorage
          const storedProducts = localStorage.getItem(`products_${user.id}`)
          const existingProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : []
          
          const productWithId = {
            ...newProduct,
            id: 'prod_' + Date.now(),
          }
          
          const updatedProducts = [...existingProducts, productWithId]
          localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
          console.log('✅ Produto criado no localStorage:', productWithId)
        }
        toast.success('Produto cadastrado com sucesso!')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/products')
        router.refresh()
      }

    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar produto')
    } finally {
      setIsSubmitting(false)
    }
  }


  // Handler para opções do dialog de duplicata
  const handleDuplicateOption = async (
    option: 'change-name' | 'add-code' | 'merge-stock',
    data?: { name?: string; code?: string }
  ) => {
    if (!pendingProductData || !duplicateProduct || !user) return

    setIsSubmitting(true)
    setShowDuplicateDialog(false)

    try {
      let finalProductData = { ...pendingProductData }

      if (option === 'change-name' && data?.name) {
        // Opção 1: Mudar nome
        finalProductData.name = data.name
      } else if (option === 'add-code' && data?.code) {
        // Opção 2: Adicionar código
        finalProductData.code = data.code
      } else if (option === 'merge-stock') {
        // Opção 3: Adicionar ao produto existente
        const newStock = duplicateProduct.stock_quantity + pendingProductData.stock_quantity
        
        if (useSupabase) {
          const supabase = createClient()
          const { error } = await supabase
            .from('products')
            .update({
              stock_quantity: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', duplicateProduct.id)
            .eq('user_id', user.id)

          if (error) throw error
          
          toast.success(`${pendingProductData.stock_quantity} unidade(s) adicionada(s) ao produto existente!`)
        } else {
          const storedProducts = localStorage.getItem(`products_${user.id}`)
          if (storedProducts) {
            const products: Product[] = JSON.parse(storedProducts)
            const updatedProducts = products.map(p =>
              p.id === duplicateProduct.id
                ? { ...p, stock_quantity: newStock, updated_at: new Date().toISOString() }
                : p
            )
            localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
            
            toast.success(`${pendingProductData.stock_quantity} unidade(s) adicionada(s) ao produto existente!`)
          }
        }
        
        // Disparar evento de atualização
        window.dispatchEvent(new CustomEvent('product-updated'))
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/products')
          router.refresh()
        }
        
        setIsSubmitting(false)
        return
      }

      // Continuar com o cadastro com os dados modificados
      const newProduct = {
        ...finalProductData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (useSupabase) {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .insert(newProduct)
          .select()

        if (error) throw error
        toast.success('Produto cadastrado com sucesso!')
      } else {
        const storedProducts = localStorage.getItem(`products_${user.id}`)
        const existingProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : []
        
        const productWithId = {
          ...newProduct,
          id: 'prod_' + Date.now(),
        }
        
        const updatedProducts = [...existingProducts, productWithId]
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
        toast.success('Produto cadastrado com sucesso!')
      }

      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('product-updated'))

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/products')
        router.refresh()
      }
    } catch (error) {
      console.error('Error handling duplicate option:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar')
    } finally {
      setIsSubmitting(false)
      setPendingProductData(null)
      setDuplicateProduct(null)
    }
  }

  return (
    <>
      {duplicateProduct && (
        <DuplicateProductDialog
          isOpen={showDuplicateDialog}
          existingProduct={duplicateProduct}
          newProductName={pendingProductData?.name || ''}
          newProductStock={pendingProductData?.stock_quantity || 0}
          newProductPrice={pendingProductData?.price}
          onOptionSelected={handleDuplicateOption}
          onCancel={() => {
            setShowDuplicateDialog(false)
            setPendingProductData(null)
            setDuplicateProduct(null)
            setIsSubmitting(false)
          }}
        />
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Imagem do Produto</label>
          <p className="text-sm text-muted-foreground">
            Faça upload de uma imagem para o produto
          </p>
          <ImageUpload
            onImageUploaded={(imageUrl) => setImageFile(imageUrl)}
            onImageRemoved={() => setImageFile(null)}
            currentImageUrl={product?.image_url || undefined}
            disabled={isSubmitting}
          />
        </div>

        {/* Product Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Smartphone XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Descrição do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: SP001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço de Venda *</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="149,99"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cost */}
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custo</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="50,00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stock Quantity */}
        <FormField
          control={form.control}
          name="stock_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade em Estoque *</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <CategorySelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting
            ? 'Salvando...'
            : product
            ? 'Atualizar Produto'
            : 'Cadastrar Produto'}
        </Button>
      </form>
    </Form>
    </>
  )
}