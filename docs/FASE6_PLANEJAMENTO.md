# 🤖 Fase 6: IA para Reconhecimento de Produtos - Planejamento

**Status:** 📋 Em Planejamento  
**Estimativa:** 4-5 dias  
**Dependências:** Fase 5 ✅ Concluída

---

## 🎯 Objetivos da Fase

Implementar reconhecimento automático de produtos usando IA para:
- Identificar produtos por foto
- Sugerir nome e descrição
- Recomendar categoria
- Estimar preço de venda
- Processar múltiplas imagens de uma vez
- Extrair produtos de notas fiscais (OCR)

---

## 🏗️ Arquitetura Proposta

### 1. Edge Functions (Supabase)

```
supabase/functions/
├── ai-product-recognition/
│   ├── index.ts              # Processa imagem individual
│   └── _shared/
│       ├── openai-client.ts  # Cliente OpenAI
│       └── claude-client.ts  # Cliente Claude
├── ai-batch-processing/
│   └── index.ts              # Processa múltiplas imagens
└── ai-invoice-ocr/
    └── index.ts              # OCR de notas fiscais
```

### 2. Componentes Frontend

```
src/components/products/
├── AIUploadDialog.tsx        # Modal de upload com IA
├── AIProductPreview.tsx      # Preview do produto reconhecido
├── AIBatchUpload.tsx         # Upload em lote
├── AIInvoiceUpload.tsx       # Upload de nota fiscal
└── AISuggestions.tsx         # Exibir sugestões da IA
```

### 3. Páginas Novas

```
src/app/(dashboard)/products/
├── ai-upload/
│   └── page.tsx              # Upload com IA
└── import-invoice/
    └── page.tsx              # Import de nota fiscal
```

---

## 🤖 APIs de IA - Comparação

### Opção 1: OpenAI GPT-4 Vision

**Vantagens:**
- ✅ Reconhecimento de imagens excelente
- ✅ API simples e bem documentada
- ✅ Bom custo-benefício
- ✅ Suporte a português

**Custos:**
- GPT-4 Vision: $0.01 por imagem (aprox)
- GPT-4 Turbo: $0.01 / 1K tokens

**Exemplo de Uso:**
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [
    {
      role: "user",
      content: [
        { 
          type: "text", 
          text: "Identifique o produto nesta imagem e retorne: nome, descrição, categoria sugerida e preço estimado em reais." 
        },
        {
          type: "image_url",
          image_url: { url: imageUrl }
        }
      ]
    }
  ],
  max_tokens: 500
})
```

### Opção 2: Anthropic Claude 3 Sonnet

**Vantagens:**
- ✅ Análises mais detalhadas
- ✅ Melhor contexto
- ✅ Boa precisão

**Custos:**
- Claude 3 Sonnet: $3 / 1M tokens input
- Mais caro que OpenAI

**Exemplo de Uso:**
```typescript
const response = await anthropic.messages.create({
  model: "claude-3-sonnet-20240229",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: base64Image
          }
        },
        {
          type: "text",
          text: "Analise este produto..."
        }
      ]
    }
  ]
})
```

### 🏆 Recomendação: OpenAI GPT-4 Vision

**Razões:**
- Melhor custo-benefício
- API mais simples
- Documentação melhor
- Suporte a português excelente

---

## 📝 Schema de Resposta da IA

```typescript
interface AIProductRecognition {
  name: string              // "Notebook Dell Inspiron 15"
  description: string       // "Notebook com tela de 15.6..."
  category: string          // "Eletrônicos > Computadores"
  estimatedPrice: number    // 3500.00
  confidence: number        // 0.85 (0-1)
  attributes?: {            // Atributos extras
    brand?: string          // "Dell"
    model?: string          // "Inspiron 15"
    color?: string          // "Preto"
    condition?: string      // "Novo"
  }
  suggestedTags?: string[]  // ["notebook", "dell", "portátil"]
}
```

---

## 🔧 Implementação Passo a Passo

### Etapa 1: Configuração da IA (Dia 1)

1. **Criar conta OpenAI**
   - Obter API Key
   - Configurar billing
   - Adicionar à `.env.local`:
     ```env
     OPENAI_API_KEY=sk-...
     ```

2. **Instalar dependências**
   ```bash
   npm install openai
   ```

3. **Criar Edge Function base**
   ```bash
   cd supabase/functions
   npx supabase functions new ai-product-recognition
   ```

### Etapa 2: Edge Function de Reconhecimento (Dia 1-2)

**Arquivo:** `supabase/functions/ai-product-recognition/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OpenAI } from 'npm:openai@^4.0.0'

serve(async (req) => {
  try {
    const { imageUrl } = await req.json()
    
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!
    })

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Analise esta imagem de produto e retorne um JSON com:
                - name: nome do produto
                - description: descrição detalhada
                - category: categoria sugerida
                - estimatedPrice: preço estimado em reais
                - confidence: nível de confiança (0-1)
                
                Responda APENAS com o JSON, sem texto adicional.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 500
    })

    const result = JSON.parse(response.choices[0].message.content)
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

### Etapa 3: Componente de Upload com IA (Dia 2-3)

**Arquivo:** `src/components/products/AIUploadDialog.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ImageUpload } from './ImageUpload'
import { AIProductPreview } from './AIProductPreview'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Sparkles } from 'lucide-react'

export function AIUploadDialog() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const supabase = createClientComponentClient()

  const processImage = async () => {
    if (!imageFile) return
    
    setIsProcessing(true)
    
    try {
      // 1. Upload temporário da imagem
      const { data: { session } } = await supabase.auth.getSession()
      const tempPath = `temp/${session!.user.id}/${Date.now()}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(tempPath, imageFile)
      
      if (uploadError) throw uploadError
      
      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(tempPath)
      
      // 3. Chamar Edge Function de IA
      const { data, error } = await supabase.functions.invoke('ai-product-recognition', {
        body: { imageUrl: publicUrl }
      })
      
      if (error) throw error
      
      setAiSuggestion(data)
      
      // 4. Limpar imagem temporária
      await supabase.storage.from('product-images').remove([tempPath])
      
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Erro ao processar imagem')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog>
      <DialogContent className="max-w-3xl">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Cadastrar com IA</h2>
          </div>
          
          <ImageUpload
            value={null}
            onChange={setImageFile}
            disabled={isProcessing}
          />
          
          {isProcessing && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-lg">Analisando imagem com IA...</p>
            </div>
          )}
          
          {aiSuggestion && !isProcessing && (
            <AIProductPreview 
              suggestion={aiSuggestion}
              imageFile={imageFile}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Etapa 4: Preview com Sugestões (Dia 3)

**Arquivo:** `src/components/products/AIProductPreview.tsx`

```typescript
export function AIProductPreview({ suggestion, imageFile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [productData, setProductData] = useState(suggestion)
  
  return (
    <div className="space-y-4 border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Sugestões da IA</h3>
          <Badge variant={suggestion.confidence > 0.7 ? 'default' : 'secondary'}>
            {Math.round(suggestion.confidence * 100)}% confiança
          </Badge>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Salvar' : 'Editar'}
        </Button>
      </div>
      
      {/* Preview dos dados */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nome</Label>
          <Input 
            value={productData.name} 
            onChange={(e) => setProductData({...productData, name: e.target.value})}
            disabled={!isEditing}
          />
        </div>
        
        <div>
          <Label>Categoria</Label>
          <Input value={productData.category} disabled={!isEditing} />
        </div>
        
        <div className="md:col-span-2">
          <Label>Descrição</Label>
          <Textarea value={productData.description} disabled={!isEditing} />
        </div>
        
        <div>
          <Label>Preço Estimado</Label>
          <Input 
            value={productData.estimatedPrice} 
            type="number" 
            disabled={!isEditing}
          />
        </div>
      </div>
      
      <Button className="w-full" onClick={saveProduct}>
        <Check className="mr-2 h-4 w-4" />
        Confirmar e Cadastrar
      </Button>
    </div>
  )
}
```

### Etapa 5: Página de Upload com IA (Dia 4)

**Arquivo:** `src/app/(dashboard)/products/ai-upload/page.tsx`

```typescript
export default function AIUploadPage() {
  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Cadastrar com IA 🤖
        </h1>
        <p className="text-muted-foreground">
          Tire uma foto do produto e deixe a IA fazer o resto!
        </p>
      </div>

      <AIUploadDialog />
      
      {/* Features */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <FeatureCard 
          icon={Sparkles}
          title="Reconhecimento Automático"
          description="IA identifica o produto pela imagem"
        />
        <FeatureCard 
          icon={Tag}
          title="Categoria Inteligente"
          description="Sugestão automática de categoria"
        />
        <FeatureCard 
          icon={DollarSign}
          title="Estimativa de Preço"
          description="IA sugere o preço de venda"
        />
      </div>
    </PageWrapper>
  )
}
```

### Etapa 6: Processamento em Lote (Dia 4-5)

**Arquivo:** `src/components/products/AIBatchUpload.tsx`

```typescript
export function AIBatchUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<AIProductRecognition[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  const processMultipleImages = async () => {
    setIsProcessing(true)
    const promises = files.map(file => processImage(file))
    const results = await Promise.all(promises)
    setResults(results)
    setIsProcessing(false)
  }
  
  return (
    <div>
      {/* UI para múltiplas imagens */}
      {/* Tabela com resultados editáveis */}
      {/* Botão para salvar todos */}
    </div>
  )
}
```

### Etapa 7: OCR de Nota Fiscal (Dia 5)

**Edge Function:** `supabase/functions/ai-invoice-ocr/index.ts`

```typescript
const prompt = `
Extraia todos os produtos desta nota fiscal.
Para cada produto, retorne:
- name: nome do produto
- quantity: quantidade
- unitPrice: preço unitário
- totalPrice: preço total

Formato JSON: { products: [...] }
`
```

---

## 📊 Fluxo de Uso

### Upload Individual com IA

```
1. Usuário acessa /products/ai-upload
2. Faz upload de uma foto
3. Imagem é enviada ao Storage (temporário)
4. Edge Function chama OpenAI Vision
5. IA retorna sugestões
6. Usuário revisa e edita (se necessário)
7. Clica em "Confirmar"
8. Produto é salvo no banco
9. Imagem é movida para pasta definitiva
```

### Upload em Lote

```
1. Usuário seleciona múltiplas fotos
2. Sistema processa uma por vez (ou paralelo)
3. Exibe tabela com todos os resultados
4. Usuário pode editar qualquer campo
5. Salva todos de uma vez
```

### Import de Nota Fiscal

```
1. Usuário faz upload de PDF ou foto da nota
2. OCR extrai texto
3. IA identifica produtos
4. Sistema cria lista editável
5. Usuário confirma
6. Produtos são cadastrados em lote
```

---

## 🧪 Testes Necessários

- [ ] Reconhecimento de produtos diversos
- [ ] Diferentes qualidades de imagem
- [ ] Múltiplos produtos na mesma imagem
- [ ] Produtos sem marca visível
- [ ] Notas fiscais de diferentes formatos
- [ ] Performance com muitas imagens
- [ ] Tratamento de erros da API

---

## 💰 Estimativa de Custos

**OpenAI GPT-4 Vision:**
- Processamento de imagem: ~$0.01 USD
- 1.000 produtos/mês: ~$10 USD
- 10.000 produtos/mês: ~$100 USD

**Recomendação:** Implementar cache para evitar reprocessamento.

---

## 🔐 Segurança

- [ ] Rate limiting na Edge Function
- [ ] Validação de tamanho de arquivo
- [ ] Validação de tipo de arquivo
- [ ] Timeout de 30s para cada requisição
- [ ] Limpeza de imagens temporárias
- [ ] Não expor API keys no frontend

---

## 📈 Métricas a Monitorar

- Tempo médio de processamento
- Taxa de sucesso do reconhecimento
- Confiança média das sugestões
- Número de edições feitas pelo usuário
- Custos por produto cadastrado

---

## 🎯 Entregáveis da Fase 6

1. ✅ Edge Function de reconhecimento
2. ✅ Componente de upload com IA
3. ✅ Preview de sugestões
4. ✅ Página de upload com IA
5. ✅ Processamento em lote
6. ✅ OCR de notas fiscais
7. ✅ Documentação completa
8. ✅ Testes

---

## 📚 Recursos

- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Anthropic Claude Vision](https://docs.anthropic.com/claude/docs/vision)

---

**Status:** 📋 Planejamento Concluído  
**Próximo Passo:** Iniciar implementação quando usuário retornar

---

*Este documento será atualizado conforme a implementação avança.*


