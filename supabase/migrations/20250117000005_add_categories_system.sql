-- Criar tabela de categorias personalizadas
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

-- Adicionar RLS
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

-- Adicionar campo category_id na tabela de transações
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES user_categories(id) ON DELETE SET NULL;

-- Adicionar campo para indicar se é parcelamento
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS is_installment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS installment_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS installment_interval VARCHAR(20) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS installment_number INTEGER DEFAULT 1;

-- Inserir categorias padrão
INSERT INTO user_categories (user_id, name, type, color) 
SELECT 
  u.id,
  'Venda',
  'income',
  '#10B981'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_categories uc 
  WHERE uc.user_id = u.id AND uc.name = 'Venda' AND uc.type = 'income'
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

