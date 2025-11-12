-- ============================================================================
-- FIX CASH BALANCE TRIGGER TO CONSIDER is_paid STATUS
-- ============================================================================
-- Created: 2025-01-17
-- Description: Update trigger to only update cash balance for paid transactions
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_cash_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Only update cash balance if transaction is paid
        IF NEW.is_paid IS NOT FALSE THEN
            IF NEW.type = 'income' THEN
                UPDATE public.users_profile
                SET cash_balance = COALESCE(cash_balance, 0) + NEW.amount
                WHERE id = NEW.user_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE public.users_profile
                SET cash_balance = COALESCE(cash_balance, 0) - NEW.amount
                WHERE id = NEW.user_id;
            END IF;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle updates: remove old transaction effect if it was paid, add new if it's paid
        IF OLD.is_paid IS NOT FALSE THEN
            IF OLD.type = 'income' THEN
                UPDATE public.users_profile
                SET cash_balance = COALESCE(cash_balance, 0) - OLD.amount
                WHERE id = OLD.user_id;
            ELSIF OLD.type = 'expense' THEN
                UPDATE public.users_profile
                SET cash_balance = COALESCE(cash_balance, 0) + OLD.amount
                WHERE id = OLD.user_id;
            END IF;
        END IF;
        
        IF NEW.is_paid IS NOT FALSE THEN
            IF NEW.type = 'income' THEN
                UPDATE public.users_profile
                SET cash_balance = COALESCE(cash_balance, 0) + NEW.amount
                WHERE id = NEW.user_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE public.users_profile
                SET cash_balance = COALESCE(cash_balance, 0) - NEW.amount
                WHERE id = NEW.user_id;
            END IF;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Only remove effect if transaction was paid
        IF OLD.is_paid IS NOT FALSE THEN
            IF OLD.type = 'income' THEN
                UPDATE public.users_profile
                SET cash_balance = COALESCE(cash_balance, 0) - OLD.amount
                WHERE id = OLD.user_id;
            ELSIF OLD.type = 'expense' THEN
                UPDATE public.users_profile
                SET cash_balance = COALESCE(cash_balance, 0) + OLD.amount
                WHERE id = OLD.user_id;
            END IF;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Cash balance trigger updated to consider is_paid status!';
    RAISE NOTICE '   - Only paid transactions update cash balance';
    RAISE NOTICE '   - Pending transactions do not affect cash balance';
END $$;

