export interface Product {
  id: string
  user_id: string
  category_id: string | null
  name: string
  description: string | null
  code: string | null
  price: number
  cost: number | null
  stock_quantity: number
  image_url: string | null
  images: ProductImage[]
  ai_processed: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  thumbnail_url: string | null
  alt_text: string | null
  is_primary: boolean
  order: number
  file_size: number
  file_type: string
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at?: string | null
}

export interface ProductFormData {
  name: string
  description?: string
  code?: string
  price: number
  cost?: number
  stock_quantity: number
  category_id?: string
  image?: File
}

export interface AIProductSuggestion {
  name: string
  description: string
  category: string
  estimated_price?: number
  confidence: number
}



