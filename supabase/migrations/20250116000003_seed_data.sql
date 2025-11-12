-- ============================================================================
-- FULLSTACK GESTOR - SEED DATA (OPTIONAL)
-- ============================================================================
-- Created: 2025-01-16
-- Description: Sample data for testing (OPTIONAL - only for development)
-- ============================================================================

-- ⚠️ WARNING: This file creates sample data for testing purposes only!
-- ⚠️ DO NOT run this in production!

-- ============================================================================
-- SEED: Default Categories (will be inserted for the current user)
-- ============================================================================

-- Note: These categories will be created when a user first accesses the app
-- This is just a reference of common categories

-- INSERT INTO public.categories (user_id, name, description) VALUES
-- (auth.uid(), 'Eletrônicos', 'Produtos eletrônicos e tecnologia'),
-- (auth.uid(), 'Roupas', 'Vestuário e acessórios'),
-- (auth.uid(), 'Alimentos', 'Alimentos e bebidas'),
-- (auth.uid(), 'Móveis', 'Móveis e decoração'),
-- (auth.uid(), 'Livros', 'Livros e publicações'),
-- (auth.uid(), 'Brinquedos', 'Brinquedos e jogos'),
-- (auth.uid(), 'Esportes', 'Artigos esportivos'),
-- (auth.uid(), 'Beleza', 'Produtos de beleza e cuidados pessoais'),
-- (auth.uid(), 'Automotivo', 'Peças e acessórios automotivos'),
-- (auth.uid(), 'Outros', 'Outros produtos');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Seed data file created!';
    RAISE NOTICE '   ⚠️  This file is for reference only';
    RAISE NOTICE '   ⚠️  Uncomment the INSERT statements to add sample data';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Categories will be created automatically when needed';
END $$;



