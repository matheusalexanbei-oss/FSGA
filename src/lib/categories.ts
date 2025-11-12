// Sistema de gerenciamento de categorias
export interface Category {
  id: string
  name: string
  description: string | null
  parent_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  product_id: string
  category_id: string
}

// Função para criar ou buscar categoria com hierarquia
export function createOrGetCategory(categoryName: string, userId: string, parentId?: string): string {
  if (typeof window === 'undefined') return ''

  // Carregar categorias existentes
  const storedCategories = localStorage.getItem(`categories_${userId}`)
  const existingCategories: Category[] = storedCategories ? JSON.parse(storedCategories) : []

  // Buscar categoria existente
  const existingCategory = existingCategories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase() && 
    cat.parent_id === parentId
  )

  if (existingCategory) {
    return existingCategory.id
  }

  // Criar nova categoria
  const newCategory: Category = {
    id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: categoryName,
    description: `Categoria criada automaticamente: ${categoryName}`,
    parent_id: parentId,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Salvar nova categoria
  const updatedCategories = [...existingCategories, newCategory]
  localStorage.setItem(`categories_${userId}`, JSON.stringify(updatedCategories))

  console.log('✅ Nova categoria criada:', newCategory)
  return newCategory.id
}

// Função para criar categoria hierárquica (ex: "Correntes > Masculinas")
export function createHierarchicalCategory(categoryPath: string, userId: string): string {
  const parts = categoryPath.split('>').map(part => part.trim())
  let currentParentId: string | undefined = undefined
  
  for (const part of parts) {
    currentParentId = createOrGetCategory(part, userId, currentParentId)
  }
  
  return currentParentId || ''
}

// Função para obter hierarquia de uma categoria
export function getCategoryHierarchy(categoryId: string, userId: string): Category[] {
  if (typeof window === 'undefined') return []

  const storedCategories = localStorage.getItem(`categories_${userId}`)
  const categories: Category[] = storedCategories ? JSON.parse(storedCategories) : []
  
  const hierarchy: Category[] = []
  let currentId: string | undefined = categoryId
  
  while (currentId) {
    const category = categories.find(cat => cat.id === currentId)
    if (category) {
      hierarchy.unshift(category)
      currentId = category.parent_id
    } else {
      break
    }
  }
  
  return hierarchy
}

// Função para associar produto a categoria
export function associateProductToCategory(productId: string, categoryId: string, userId: string) {
  if (typeof window === 'undefined') return

  // Carregar associações existentes
  const storedAssociations = localStorage.getItem(`product_categories_${userId}`)
  const existingAssociations: ProductCategory[] = storedAssociations ? JSON.parse(storedAssociations) : []

  // Verificar se associação já existe
  const existingAssociation = existingAssociations.find(assoc => 
    assoc.product_id === productId && assoc.category_id === categoryId
  )

  if (!existingAssociation) {
    // Criar nova associação
    const newAssociation: ProductCategory = {
      product_id: productId,
      category_id: categoryId
    }

    const updatedAssociations = [...existingAssociations, newAssociation]
    localStorage.setItem(`product_categories_${userId}`, JSON.stringify(updatedAssociations))

    console.log('✅ Produto associado à categoria:', newAssociation)
  }
}

// Função para obter categorias de um produto
export function getProductCategories(productId: string, userId: string): Category[] {
  if (typeof window === 'undefined') return []

  // Carregar associações
  const storedAssociations = localStorage.getItem(`product_categories_${userId}`)
  const associations: ProductCategory[] = storedAssociations ? JSON.parse(storedAssociations) : []

  // Carregar categorias
  const storedCategories = localStorage.getItem(`categories_${userId}`)
  const categories: Category[] = storedCategories ? JSON.parse(storedCategories) : []

  // Filtrar categorias do produto
  const productCategoryIds = associations
    .filter(assoc => assoc.product_id === productId)
    .map(assoc => assoc.category_id)

  return categories.filter(cat => productCategoryIds.includes(cat.id))
}

// Função para obter produtos de uma categoria
export function getCategoryProducts(categoryId: string, userId: string): string[] {
  if (typeof window === 'undefined') return []

  // Carregar associações
  const storedAssociations = localStorage.getItem(`product_categories_${userId}`)
  const associations: ProductCategory[] = storedAssociations ? JSON.parse(storedAssociations) : []

  return associations
    .filter(assoc => assoc.category_id === categoryId)
    .map(assoc => assoc.product_id)
}
