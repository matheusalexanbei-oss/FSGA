'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductForm } from '@/components/products/ProductForm'
import { Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Product } from '@/types/product'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Editar Produto</h1>
          <p className="text-muted-foreground">
            Atualize as informações do produto
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl">
        <AnimatedCard delay={0.2}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações do Produto
            </CardTitle>
            <CardDescription>
              Edite os dados do produto abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <div className="grid gap-6 md:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : product ? (
              <ProductForm product={product} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Produto não encontrado</p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </PageWrapper>
  )
}


