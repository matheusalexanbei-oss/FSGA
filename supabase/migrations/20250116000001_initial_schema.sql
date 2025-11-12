-- ============================================================================
-- FULLSTACK GESTOR - INITIAL DATABASE SCHEMA
-- ============================================================================
-- Created: 2025-01-16
-- Description: Initial database schema with users, products, categories, and financial data
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users_profile
-- Description: Extended user profile information
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT,
    business_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_id ON public.users_profile(id);

-- Add comment
COMMENT ON TABLE public.users_profile IS 'Extended profile information for authenticated users';

-- ============================================================================
-- TABLE: categories
-- Description: Product categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Add comment
COMMENT ON TABLE public.categories IS 'Product categories for inventory organization';

-- ============================================================================
-- TABLE: products
-- Description: Product inventory
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cost DECIMAL(10, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    ai_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Add comment
COMMENT ON TABLE public.products IS 'Product inventory with AI-assisted cataloging support';

-- ============================================================================
-- TABLE: financial_transactions
-- Description: Financial transactions (income and expenses)
-- ============================================================================
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON public.financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON public.financial_transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_at ON public.financial_transactions(created_at DESC);

-- Add comment
COMMENT ON TABLE public.financial_transactions IS 'Financial transactions for income and expense tracking';

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users_profile
CREATE TRIGGER update_users_profile_updated_at
    BEFORE UPDATE ON public.users_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users_profile (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Initial schema created successfully!';
    RAISE NOTICE '   - users_profile table created';
    RAISE NOTICE '   - categories table created';
    RAISE NOTICE '   - products table created';
    RAISE NOTICE '   - financial_transactions table created';
    RAISE NOTICE '   - Indexes and triggers configured';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Next step: Run RLS policies migration';
END $$;



