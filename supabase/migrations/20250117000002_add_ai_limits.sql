-- ============================================================================
-- ADD USER SUBSCRIPTION AND LIMITS
-- ============================================================================
-- Created: 2025-01-17
-- Description: Add subscription plan and usage limits to user profile
-- ============================================================================

-- Add subscription plan column
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'enterprise'));

-- Add AI usage tracking
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS ai_commands_used INTEGER DEFAULT 0;

-- Add AI commands limit
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS ai_commands_limit INTEGER DEFAULT 10;

-- Add last reset date for usage tracking
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS usage_reset_date DATE DEFAULT CURRENT_DATE;

-- Create index for subscription plan
CREATE INDEX IF NOT EXISTS idx_users_profile_subscription_plan 
ON public.users_profile(subscription_plan);

-- Create index for usage tracking
CREATE INDEX IF NOT EXISTS idx_users_profile_ai_usage 
ON public.users_profile(ai_commands_used, ai_commands_limit);

-- Add comments
COMMENT ON COLUMN public.users_profile.subscription_plan IS 'User subscription plan: free, premium, enterprise';
COMMENT ON COLUMN public.users_profile.ai_commands_used IS 'Number of AI commands used in current period';
COMMENT ON COLUMN public.users_profile.ai_commands_limit IS 'Maximum AI commands allowed per period';
COMMENT ON COLUMN public.users_profile.usage_reset_date IS 'Date when usage counters were last reset';

-- ============================================================================
-- FUNCTION: Check AI usage limits
-- ============================================================================

CREATE OR REPLACE FUNCTION check_ai_usage_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile RECORD;
BEGIN
    -- Get user profile with subscription info
    SELECT 
        subscription_plan,
        ai_commands_used,
        ai_commands_limit,
        usage_reset_date
    INTO user_profile
    FROM public.users_profile
    WHERE id = user_uuid;
    
    -- If user doesn't exist, deny access
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Reset usage if it's a new day (for daily limits)
    IF user_profile.usage_reset_date < CURRENT_DATE THEN
        UPDATE public.users_profile
        SET 
            ai_commands_used = 0,
            usage_reset_date = CURRENT_DATE
        WHERE id = user_uuid;
        
        -- Reset the counter for this check
        user_profile.ai_commands_used := 0;
    END IF;
    
    -- Check if user has reached limit
    RETURN user_profile.ai_commands_used < user_profile.ai_commands_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Increment AI usage
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_ai_usage(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    can_use BOOLEAN;
BEGIN
    -- Check if user can use AI
    can_use := check_ai_usage_limit(user_uuid);
    
    -- If can use, increment counter
    IF can_use THEN
        UPDATE public.users_profile
        SET ai_commands_used = ai_commands_used + 1
        WHERE id = user_uuid;
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get user AI limits info
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_ai_limits(user_uuid UUID)
RETURNS TABLE(
    subscription_plan TEXT,
    commands_used INTEGER,
    commands_limit INTEGER,
    can_use_ai BOOLEAN,
    reset_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.subscription_plan,
        up.ai_commands_used,
        up.ai_commands_limit,
        check_ai_usage_limit(user_uuid) as can_use_ai,
        up.usage_reset_date
    FROM public.users_profile up
    WHERE up.id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Subscription and AI limits system added successfully!';
    RAISE NOTICE '   - subscription_plan column added';
    RAISE NOTICE '   - AI usage tracking added';
    RAISE NOTICE '   - Usage limit functions created';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Default limits:';
    RAISE NOTICE '   - Free: 10 commands/day';
    RAISE NOTICE '   - Premium: 100 commands/day';
    RAISE NOTICE '   - Enterprise: Unlimited';
END $$;

