'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Image as ImageIcon, Plus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useHybridAuth } from '@/hooks/useHybridAuth'

interface MultiImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void
  currentImages?: string[]
  maxImages?: number
  disabled?: boolean
}

export function MultiImageUpload({ 
  onImagesChange, 
  currentImages = [], 
  maxImages = 5,
  disabled = false 
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [images, setImages] = useState<string[]>(currentImages)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useHybridAuth()

  const supabase = createClient()

  const validateFile = (file: File): boolean => {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.')
      return false
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB.')
      return false
    }

    return true
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Gerar nome único para o arquivo com estrutura de pastas por usuário
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user?.id || 'anonymous'}/${fileName}`

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
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

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(validateFile)
    
    if (validFiles.length === 0) return

    // Verificar limite de imagens
    if (images.length + validFiles.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`)
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = validFiles.map(uploadImage)
      const uploadedUrls = await Promise.all(uploadPromises)
      const successfulUploads = uploadedUrls.filter((url): url is string => url !== null)
      
      if (successfulUploads.length > 0) {
        const newImages = [...images, ...successfulUploads]
        setImages(newImages)
        onImagesChange(newImages)
        toast.success(`${successfulUploads.length} imagem(ns) carregada(s) com sucesso!`)
      }
    } finally {
      setIsUploading(false)
    }
  }, [images, maxImages, onImagesChange])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const handleClick = () => {
    if (!disabled && images.length < maxImages) {
      fileInputRef.current?.click()
    }
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Grid de imagens existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  {!disabled && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Área de upload */}
      {canAddMore && (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-medium">Fazendo upload...</span>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="mx-auto w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Adicionar {maxImages - images.length} imagem(ns)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP até 5MB cada
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={disabled}>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Imagens
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informações */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {images.length} de {maxImages} imagens
          </Badge>
        </div>
        {isUploading && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Fazendo upload...</span>
          </div>
        )}
      </div>
    </div>
  )
}