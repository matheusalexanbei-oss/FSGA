'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Store, Settings, Save } from 'lucide-react'
import { useStoreContext } from '@/hooks/useStoreContext'

export function StoreContextConfig() {
  const { storeContext, updateStoreContext, updateStoreType, getStoreTypeCategories } = useStoreContext()
  const [isEditing, setIsEditing] = useState(false)
  const [tempContext, setTempContext] = useState(storeContext)

  const storeTypes = [
    { value: 'acessórios', label: 'Acessórios' },
    { value: 'joalheria', label: 'Joalheria' },
    { value: 'moda', label: 'Moda' },
    { value: 'eletrônicos', label: 'Eletrônicos' },
    { value: 'casa', label: 'Casa & Decoração' },
    { value: 'esportes', label: 'Esportes' },
    { value: 'beleza', label: 'Beleza & Cosméticos' },
    { value: 'livros', label: 'Livros' },
    { value: 'outros', label: 'Outros' }
  ]

  const handleSave = () => {
    updateStoreContext(tempContext)
    setIsEditing(false)
  }

  const handleStoreTypeChange = (storeType: string) => {
    const commonCategories = getStoreTypeCategories(storeType)
    setTempContext({
      ...tempContext,
      storeType,
      commonCategories
    })
  }

  const addCustomCategory = (category: string) => {
    if (category && !tempContext.commonCategories.includes(category)) {
      setTempContext({
        ...tempContext,
        commonCategories: [...tempContext.commonCategories, category]
      })
    }
  }

  const removeCategory = (category: string) => {
    setTempContext({
      ...tempContext,
      commonCategories: tempContext.commonCategories.filter(c => c !== category)
    })
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configurar Contexto da Loja
          </CardTitle>
          <CardDescription>
            Defina o tipo da sua loja para melhorar a categorização automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-type">Tipo da Loja</Label>
            <Select value={tempContext.storeType} onValueChange={handleStoreTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo da sua loja" />
              </SelectTrigger>
              <SelectContent>
                {storeTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-description">Descrição da Loja</Label>
            <Input
              id="store-description"
              value={tempContext.storeDescription}
              onChange={(e) => setTempContext({
                ...tempContext,
                storeDescription: e.target.value
              })}
              placeholder="Ex: Loja de acessórios em prata"
            />
          </div>

          <div className="space-y-2">
            <Label>Categorias Comuns</Label>
            <div className="flex flex-wrap gap-2">
              {tempContext.commonCategories.map(category => (
                <Badge key={category} variant="secondary" className="cursor-pointer" onClick={() => removeCategory(category)}>
                  {category} ×
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Adicionar categoria personalizada"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addCustomCategory(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-green-600" />
          Contexto da Loja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">Tipo: {storeContext.storeType}</p>
          <p className="text-sm text-muted-foreground">{storeContext.storeDescription}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Categorias Comuns:</p>
          <div className="flex flex-wrap gap-1">
            {storeContext.commonCategories.slice(0, 6).map(category => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {storeContext.commonCategories.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{storeContext.commonCategories.length - 6} mais
              </Badge>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </Button>
      </CardContent>
    </Card>
  )
}


