/**
 * Utilitário para validar e converter IDs entre sistemas
 */

/**
 * Verifica se um ID é um UUID válido
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Verifica se um ID é customizado (formato cat_ ou prod_)
 */
export function isCustomId(id: string): boolean {
  return id.startsWith('cat_') || id.startsWith('prod_')
}

/**
 * Converte ID customizado para null (para usar no Supabase)
 * Isso evita erros de UUID inválido
 */
export function convertCustomIdForSupabase(id: string | null): string | null {
  if (!id) return null
  if (isCustomId(id)) {
    console.warn(`⚠️ ID customizado detectado: ${id}. Convertendo para null para Supabase.`)
    return null
  }
  if (!isValidUUID(id)) {
    console.warn(`⚠️ ID inválido detectado: ${id}. Convertendo para null para Supabase.`)
    return null
  }
  return id
}

/**
 * Filtra array de IDs, removendo IDs customizados/inválidos
 */
export function filterValidUUIDs(ids: string[]): string[] {
  return ids.filter(id => isValidUUID(id))
}

/**
 * Valida se um category_id é válido para usar no Supabase
 */
export function validateCategoryIdForSupabase(categoryId: string | null): string | null {
  if (!categoryId) return null
  return convertCustomIdForSupabase(categoryId)
}



