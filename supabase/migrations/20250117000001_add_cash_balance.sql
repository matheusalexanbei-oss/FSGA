-- ============================================================================
-- ADD CASH BALANCE TO USER PROFILE
-- ============================================================================
-- Created: 2025-01-17
-- Description: Add cash balance tracking to user profile
-- ============================================================================

-- Add cash_balance column to users_profile
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS cash_balance DECIMAL(10, 2) DEFAULT 0.00;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_cash_balance 
ON public.users_profile(cash_balance);

-- Add comment
COMMENT ON COLUMN public.users_profile.cash_balance IS 'Current cash balance in the user account';

-- ============================================================================
-- UPDATE FINANCIAL TRANSACTIONS TABLE
-- ============================================================================

-- Add payment_method column
ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add scheduled_date for future payments
ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Add is_paid status
ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT TRUE;

-- Add notes for additional information
ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for scheduled payments
CREATE INDEX IF NOT EXISTS idx_financial_transactions_scheduled_date 
ON public.financial_transactions(scheduled_date) 
WHERE scheduled_date IS NOT NULL;

-- Add index for paid status
CREATE INDEX IF NOT EXISTS idx_financial_transactions_is_paid 
ON public.financial_transactions(is_paid);

-- ============================================================================
-- FUNCTION: Update cash balance on transaction
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_cash_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update cash balance ONLY if transaction is paid (is_paid = true or NULL)
        -- NULL is treated as true for backward compatibility
        IF (NEW.is_paid IS NULL OR NEW.is_paid = true) THEN
            IF NEW.type = 'income' THEN
                UPDATE public.users_profile
                SET cash_balance = cash_balance + NEW.amount
                WHERE id = NEW.user_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE public.users_profile
                SET cash_balance = cash_balance - NEW.amount
                WHERE id = NEW.user_id;
            END IF;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle updates (adjust for old and new amounts)
        -- Only adjust if OLD transaction was paid
        IF (OLD.is_paid IS NULL OR OLD.is_paid = true) THEN
            IF OLD.type = 'income' THEN
                UPDATE public.users_profile
                SET cash_balance = cash_balance - OLD.amount
                WHERE id = OLD.user_id;
            ELSIF OLD.type = 'expense' THEN
                UPDATE public.users_profile
                SET cash_balance = cash_balance + OLD.amount
                WHERE id = OLD.user_id;
            END IF;
        END IF;
        
        -- Only add if NEW transaction is paid
        IF (NEW.is_paid IS NULL OR NEW.is_paid = true) THEN
            IF NEW.type = 'income' THEN
                UPDATE public.users_profile
                SET cash_balance = cash_balance + NEW.amount
                WHERE id = NEW.user_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE public.users_profile
                SET cash_balance = cash_balance - NEW.amount
                WHERE id = NEW.user_id;
            END IF;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the cash balance change
        IF OLD.type = 'income' THEN
            UPDATE public.users_profile
            SET cash_balance = cash_balance - OLD.amount
            WHERE id = OLD.user_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.users_profile
            SET cash_balance = cash_balance + OLD.amount
            WHERE id = OLD.user_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic cash balance updates
CREATE TRIGGER auto_update_cash_balance
    AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_cash_balance();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Cash balance feature added successfully!';
    RAISE NOTICE '   - cash_balance column added to users_profile';
    RAISE NOTICE '   - Financial transactions updated with new fields';
    RAISE NOTICE '   - Auto-update trigger created';
    RAISE NOTICE '';
    RAISE NOTICE '💰 Users can now track their cash balance automatically';
END $$;

