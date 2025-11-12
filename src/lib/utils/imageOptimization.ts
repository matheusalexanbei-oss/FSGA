/**
 * Utilitários para otimização de imagens
 */

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Redimensiona uma imagem mantendo a proporção
 */
export function resizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }

      // Configurar canvas
      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            })
            resolve(optimizedFile)
          } else {
            reject(new Error('Falha ao otimizar imagem'))
          }
        },
        `image/${format}`,
        quality
      )
    }

    img.onerror = () => reject(new Error('Erro ao carregar imagem'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Cria um thumbnail de uma imagem
 */
export function createThumbnail(
  file: File,
  size: number = 200,
  quality: number = 0.7
): Promise<File> {
  return resizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality,
    format: 'jpeg'
  })
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar tipo MIME
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não suportado. Use JPG, PNG ou WebP.'
    }
  }

  // Verificar tamanho (máximo 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 10MB.'
    }
  }

  return { valid: true }
}

/**
 * Calcula o tamanho do arquivo em formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Gera um nome único para o arquivo
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  
  return `${timestamp}-${random}.${extension}`
}

