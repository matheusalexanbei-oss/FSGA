'use client'

import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Category } from '@/types/product'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setIsLoading(false)
    }
  }

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setName(category.name)
      setDescription(category.description || '')
    } else {
      setEditingCategory(null)
      setName('')
      setDescription('')
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setName('')
    setDescription('')
  }

  const saveCategory = async () => {
    if (!name.trim()) {
      toast.error('Digite um nome para a categoria')
      return
    }

    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update({
            name: name.trim(),
            description: description.trim() || null,
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success('Categoria atualizada com sucesso!')
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            user_id: user.id,
          })

        if (error) throw error
        toast.success('Categoria criada com sucesso!')
      }

      loadCategories()
      closeDialog()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Erro ao salvar categoria')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteCategory = async () => {
    if (!deletingCategory) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deletingCategory.id)

      if (error) throw error

      toast.success('Categoria deletada com sucesso!')
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Erro ao deletar categoria')
    } finally {
      setDeletingCategory(null)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <PageWrapper>
      <div className="mb-8 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Categorias</h1>
          <p className="text-muted-foreground">
            Organize seus produtos em categorias
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Categoria
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatedCard delay={0.4}>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Tag className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma categoria cadastrada</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Crie categorias para organizar melhor seus produtos
                </p>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Categoria
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="relative group"
                  >
                    <div className="rounded-lg border p-6 h-full hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Tag className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingCategory(category)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Atualize as informações da categoria'
                : 'Crie uma nova categoria para organizar seus produtos'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Eletrônicos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    saveCategory()
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Descrição opcional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={saveCategory} disabled={isSaving}>
              {isSaving ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria será permanentemente deletada.
              Os produtos associados não serão deletados, mas ficarão sem categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCategory(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} className="bg-destructive">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  )
}


