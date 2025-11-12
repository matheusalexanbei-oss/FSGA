-- ============================================================================
-- ADD NOTIFICATION PREFERENCES TO USER PROFILE
-- ============================================================================
-- Created: 2025-11-12
-- Description: Add notification preferences for financial transactions
-- ============================================================================

-- Add notification preferences columns to users_profile
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS notifications_financial_enabled BOOLEAN DEFAULT TRUE;

ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS notifications_financial_3days BOOLEAN DEFAULT TRUE;

ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS notifications_financial_1day BOOLEAN DEFAULT TRUE;

ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS notifications_financial_day BOOLEAN DEFAULT TRUE;

ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS notifications_financial_overdue BOOLEAN DEFAULT TRUE;

-- Add comments
COMMENT ON COLUMN public.users_profile.notifications_enabled IS 'Enable/disable all notifications';
COMMENT ON COLUMN public.users_profile.notifications_financial_enabled IS 'Enable/disable financial transaction notifications';
COMMENT ON COLUMN public.users_profile.notifications_financial_3days IS 'Send notification 3 days before scheduled transaction';
COMMENT ON COLUMN public.users_profile.notifications_financial_1day IS 'Send notification 1 day before scheduled transaction';
COMMENT ON COLUMN public.users_profile.notifications_financial_day IS 'Send notification on the day of scheduled transaction';
COMMENT ON COLUMN public.users_profile.notifications_financial_overdue IS 'Send notification for overdue transactions';

-- Create index for notification preferences
CREATE INDEX IF NOT EXISTS idx_users_profile_notifications_enabled 
ON public.users_profile(notifications_enabled);

-- ============================================================================
-- DONE
-- ============================================================================

