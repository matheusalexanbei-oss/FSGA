-- Atualizar schema da tabela financial_transactions para incluir campos de parcelamento
-- Esta migração adiciona os campos necessários para o sistema de parcelamento

-- Adicionar campos de parcelamento se não existirem
DO $$ 
BEGIN
    -- Verificar e adicionar campo is_installment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'financial_transactions' 
                   AND column_name = 'is_installment') THEN
        ALTER TABLE financial_transactions 
        ADD COLUMN is_installment BOOLEAN DEFAULT FALSE;
    END IF;

    -- Verificar e adicionar campo installment_count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'financial_transactions' 
                   AND column_name = 'installment_count') THEN
        ALTER TABLE financial_transactions 
        ADD COLUMN installment_count INTEGER DEFAULT 1;
    END IF;

    -- Verificar e adicionar campo installment_interval
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'financial_transactions' 
                   AND column_name = 'installment_interval') THEN
        ALTER TABLE financial_transactions 
        ADD COLUMN installment_interval VARCHAR(20) DEFAULT 'monthly';
    END IF;

    -- Verificar e adicionar campo installment_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'financial_transactions' 
                   AND column_name = 'installment_number') THEN
        ALTER TABLE financial_transactions 
        ADD COLUMN installment_number INTEGER DEFAULT 1;
    END IF;

    -- Verificar e adicionar campo category_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'financial_transactions' 
                   AND column_name = 'category_id') THEN
        ALTER TABLE financial_transactions 
        ADD COLUMN category_id UUID;
    END IF;
END $$;

-- Criar tabela user_categories se não existir
CREATE TABLE IF NOT EXISTS user_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- Adicionar RLS se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_categories') THEN
        ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

        -- Política para usuários verem apenas suas categorias
        CREATE POLICY "Users can view own categories" ON user_categories
          FOR SELECT USING (auth.uid() = user_id);

        -- Política para usuários criarem suas categorias
        CREATE POLICY "Users can create own categories" ON user_categories
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Política para usuários atualizarem suas categorias
        CREATE POLICY "Users can update own categories" ON user_categories
          FOR UPDATE USING (auth.uid() = user_id);

        -- Política para usuários deletarem suas categorias
        CREATE POLICY "Users can delete own categories" ON user_categories
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Inserir categorias padrão para todos os usuários existentes
INSERT INTO user_categories (user_id, name, type, color) 
SELECT 
  u.id,
  'Vendas',
  'income',
  '#10B981'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_categories uc 
  WHERE uc.user_id = u.id AND uc.name = 'Vendas' AND uc.type = 'income'
);

INSERT INTO user_categories (user_id, name, type, color) 
SELECT 
  u.id,
  'Compra',
  'expense',
  '#EF4444'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_categories uc 
  WHERE uc.user_id = u.id AND uc.name = 'Compra' AND uc.type = 'expense'
);

INSERT INTO user_categories (user_id, name, type, color) 
SELECT 
  u.id,
  'Impostos',
  'expense',
  '#F59E0B'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_categories uc 
  WHERE uc.user_id = u.id AND uc.name = 'Impostos' AND uc.type = 'expense'
);

INSERT INTO user_categories (user_id, name, type, color) 
SELECT 
  u.id,
  'Taxas',
  'expense',
  '#8B5CF6'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_categories uc 
  WHERE uc.user_id = u.id AND uc.name = 'Taxas' AND uc.type = 'expense'
);

