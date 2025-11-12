'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[]
  maxDisplay?: number
  showCount?: boolean
  className?: string
}

export function ProductImageGallery({ 
  images, 
  maxDisplay = 3, 
  showCount = true,
  className 
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-16 bg-muted rounded-lg", className)}>
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-6 w-6 mx-auto mb-1" />
          <p className="text-xs">Sem imagens</p>
        </div>
      </div>
    )
  }

  const displayImages = images.slice(0, maxDisplay)
  const remainingCount = images.length - maxDisplay

  return (
    <>
      <div className={cn("flex space-x-1", className)}>
        {displayImages.map((imageUrl, index) => (
          <Card key={index} className="relative overflow-hidden group">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={`Produto ${index + 1}`}
                  className="w-12 h-12 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(imageUrl)}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0"
                  onClick={() => setSelectedImage(imageUrl)}
                >
                  <ZoomIn className="h-2 w-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {remainingCount > 0 && (
          <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
            <Badge variant="secondary" className="text-xs">
              +{remainingCount}
            </Badge>
          </div>
        )}
        
        {showCount && images.length > 0 && (
          <div className="flex items-center">
            <Badge variant="outline" className="text-xs">
              {images.length} imagem{images.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>

      {/* Modal de visualização */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage}
              alt="Visualização"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}

