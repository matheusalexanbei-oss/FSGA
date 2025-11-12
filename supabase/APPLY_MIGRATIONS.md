# 📋 Como Aplicar as Migrations do Supabase

## 🎯 Objetivo
Aplicar as migrations do banco de dados e configurar o Storage para o sistema de produtos.

---

## 🔧 Método 1: Supabase Dashboard (Recomendado)

### Passo 1: Acessar o SQL Editor
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**

### Passo 2: Executar Migration de Storage
1. Abra o arquivo: `supabase/migrations/20250116000004_storage_setup.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor
4. Clique em **"Run"**
5. ✅ Deve ver: "Success. No rows returned"

### Passo 3: Verificar Storage
1. No menu lateral, clique em **"Storage"**
2. Você deve ver o bucket **"product-images"**
3. Verifique se está marcado como **"Public"**

---

## 🔧 Método 2: Supabase CLI (Avançado)

### Pré-requisitos
```bash
# Instalar Supabase CLI
npm install -g supabase

# Verificar instalação
supabase --version
```

### Aplicar Migrations
```bash
# Entrar na pasta do projeto
cd fullstackgestorai

# Fazer login no Supabase
supabase login

# Linkar ao projeto remoto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar todas as migrations
supabase db push
```

### Encontrar o Project Ref
1. Vá ao Dashboard do Supabase
2. Settings > General
3. Copie o **"Reference ID"**

---

## ✅ Verificação

### Verificar se Tudo Funcionou

#### 1. Verificar Bucket de Storage
```sql
-- Execute no SQL Editor:
SELECT * FROM storage.buckets WHERE id = 'product-images';
```

Você deve ver:
```
id              | name            | public
----------------|-----------------|--------
product-images  | product-images  | true
```

#### 2. Verificar Políticas RLS
```sql
-- Execute no SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

Você deve ver 4 políticas para o bucket product-images.

#### 3. Testar no App
1. Acesse `http://localhost:3001/products/new`
2. Tente fazer upload de uma imagem
3. ✅ Deve funcionar sem erros
4. Verifique no Storage se a imagem apareceu

---

## 🔴 Criação Manual do Bucket (Se Necessário)

Se o bucket não foi criado automaticamente:

### Via Dashboard:
1. Vá em **Storage** no menu lateral
2. Clique em **"Create bucket"**
3. Configure:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Sim
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
4. Clique em **"Create bucket"**

### Configurar RLS Manualmente:
Depois de criar o bucket, execute no SQL Editor:

```sql
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Upload
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Update
CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Delete
CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: View (public)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

---

## 🐛 Troubleshooting

### Erro: "relation storage.buckets does not exist"
**Solução**: Seu projeto pode não ter o Storage habilitado.
1. Vá em Settings > Database
2. Verifique se "Enable Storage" está ativo
3. Se não estiver, habilite e aguarde alguns minutos

### Erro: "bucket already exists"
**Solução**: O bucket já foi criado. Tudo certo! ✅

### Erro: "permission denied for schema storage"
**Solução**: Use o service_role key ou execute via Dashboard (SQL Editor)

### Imagens não aparecem
**Solução**:
1. Verifique se o bucket é público
2. Verifique as políticas RLS
3. Tente acessar a URL da imagem diretamente no navegador

---

## 📊 Estrutura Final do Storage

Após configuração, sua estrutura deve ser:

```
Storage
└── product-images (bucket público)
    ├── {user_id_1}/
    │   ├── 1234567890.jpg
    │   └── 1234567891.png
    ├── {user_id_2}/
    │   └── 9876543210.jpg
    └── ...
```

**Cada usuário tem sua própria pasta identificada pelo user_id.**

---

## 🎉 Tudo Pronto!

Após aplicar as migrations e configurar o Storage:

1. ✅ Bucket criado
2. ✅ RLS configurado
3. ✅ Políticas aplicadas
4. ✅ Upload funcionando

**Você pode cadastrar produtos com imagens! 📦📸**

---

## 💡 Próximos Passos

Agora que o Storage está configurado:

1. Teste cadastrar produtos com imagens
2. Teste editar e trocar imagens
3. Teste deletar produtos (imagens devem ser removidas)
4. Crie algumas categorias
5. Organize seu inventário!

---

**Dúvidas?** Consulte a [Documentação do Supabase Storage](https://supabase.com/docs/guides/storage)


