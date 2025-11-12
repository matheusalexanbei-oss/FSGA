'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { resizeImage, validateImageFile, formatFileSize } from '@/lib/utils/imageOptimization'
import { useHybridAuth } from '@/hooks/useHybridAuth'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  onImageRemoved: () => void
  currentImageUrl?: string
  disabled?: boolean
}

export function ImageUpload({ 
  onImageUploaded, 
  onImageRemoved, 
  currentImageUrl, 
  disabled = false 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useHybridAuth()

  const supabase = createClient()

  const validateFile = (file: File): boolean => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error!)
      return false
    }
    return true
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      setUploadProgress(20)

      // Otimizar imagem antes do upload
      const optimizedFile = await resizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: 'jpeg'
      })

      setUploadProgress(50)

      // Gerar nome único para o arquivo com estrutura de pastas por usuário
      const fileExt = optimizedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user?.id || 'anonymous'}/${fileName}`

      setUploadProgress(70)

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, optimizedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro no upload:', error)
        toast.error('Erro ao fazer upload da imagem')
        return null
      }

      setUploadProgress(90)

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setUploadProgress(100)
      
      // Mostrar informações de otimização
      const originalSize = formatFileSize(file.size)
      const optimizedSize = formatFileSize(optimizedFile.size)
      const savings = Math.round(((file.size - optimizedFile.size) / file.size) * 100)
      
      if (savings > 0) {
        toast.success(`Imagem otimizada! Redução de ${savings}% (${originalSize} → ${optimizedSize})`)
      }

      return publicUrl

    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao fazer upload da imagem')
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFile(file)) return

    // Criar preview local
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Fazer upload
    const imageUrl = await uploadImage(file)
    if (imageUrl) {
      onImageUploaded(imageUrl)
      toast.success('Imagem carregada com sucesso!')
    }
  }, [onImageUploaded])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
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

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageRemoved()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {previewUrl ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative group flex items-center justify-center bg-muted rounded-lg min-h-[200px] max-h-[400px]">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-[400px] w-auto h-auto object-contain rounded-lg"
              />
              {!disabled && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
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
          <CardContent className="flex flex-col items-center justify-center py-12">
            {isUploading ? (
              <div className="space-y-4 w-full max-w-xs">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 animate-pulse" />
                  <span className="text-sm font-medium">Fazendo upload...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Clique para fazer upload ou arraste uma imagem
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP até 5MB
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={disabled}>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Imagem
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isUploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Fazendo upload da imagem...</span>
        </div>
      )}
    </div>
  )
}