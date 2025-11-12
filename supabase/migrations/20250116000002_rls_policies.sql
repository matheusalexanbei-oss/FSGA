-- ============================================================================
-- FULLSTACK GESTOR - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Created: 2025-01-16
-- Description: Security policies to ensure users only access their own data
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: users_profile
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.users_profile
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.users_profile
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users_profile
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
    ON public.users_profile
    FOR DELETE
    USING (auth.uid() = id);

-- ============================================================================
-- POLICIES: categories
-- ============================================================================

-- Users can view their own categories
CREATE POLICY "Users can view own categories"
    ON public.categories
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories
CREATE POLICY "Users can update own categories"
    ON public.categories
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories"
    ON public.categories
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- POLICIES: products
-- ============================================================================

-- Users can view their own products
CREATE POLICY "Users can view own products"
    ON public.products
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own products
CREATE POLICY "Users can insert own products"
    ON public.products
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own products
CREATE POLICY "Users can update own products"
    ON public.products
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own products
CREATE POLICY "Users can delete own products"
    ON public.products
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- POLICIES: financial_transactions
-- ============================================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
    ON public.financial_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
    ON public.financial_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions"
    ON public.financial_transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
    ON public.financial_transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT ALL ON public.users_profile TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.financial_transactions TO authenticated;

-- Grant permissions on sequences (for auto-increment if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies created successfully!';
    RAISE NOTICE '   - All tables have RLS enabled';
    RAISE NOTICE '   - Users can only access their own data';
    RAISE NOTICE '   - SELECT, INSERT, UPDATE, DELETE policies configured';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Your database is now secure!';
END $$;



