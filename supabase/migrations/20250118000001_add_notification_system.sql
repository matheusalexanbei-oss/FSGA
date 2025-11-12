-- ============================================================================
-- NOTIFICATION SYSTEM FOR RECURRING TRANSACTIONS
-- ============================================================================
-- Created: 2025-01-18
-- Description: System for push notifications for recurring and scheduled transactions
-- ============================================================================

-- Table for push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
ON public.push_subscriptions(user_id);

-- Table for notification logs
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('recurring_3days', 'recurring_1day', 'recurring_day', 'scheduled_3days', 'scheduled_1day', 'scheduled_day')),
    scheduled_date DATE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, transaction_id, notification_type, scheduled_date)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id 
ON public.notification_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_transaction_id 
ON public.notification_logs(transaction_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_scheduled_date 
ON public.notification_logs(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at 
ON public.notification_logs(sent_at);

-- Add columns to financial_transactions for recurring tracking
ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS recurring_interval TEXT CHECK (recurring_interval IN ('weekly', 'monthly', 'quarterly'));

ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS recurring_end_date DATE;

ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS last_notification_sent DATE;

-- Indexes for recurring transactions
CREATE INDEX IF NOT EXISTS idx_financial_transactions_is_recurring 
ON public.financial_transactions(is_recurring) 
WHERE is_recurring = TRUE;

CREATE INDEX IF NOT EXISTS idx_financial_transactions_scheduled_date_recurring 
ON public.financial_transactions(scheduled_date, is_recurring) 
WHERE scheduled_date IS NOT NULL;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for push_subscriptions
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- RLS Policies for push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions"
    ON public.push_subscriptions
    FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification logs"
    ON public.notification_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.push_subscriptions IS 'Stores push notification subscriptions for users';
COMMENT ON TABLE public.notification_logs IS 'Logs of sent notifications to prevent duplicates';
COMMENT ON COLUMN public.financial_transactions.is_recurring IS 'Whether this transaction is recurring';
COMMENT ON COLUMN public.financial_transactions.recurring_interval IS 'Interval for recurring transactions: weekly, monthly, or quarterly';
COMMENT ON COLUMN public.financial_transactions.recurring_end_date IS 'End date for recurring transactions (null if infinite)';
COMMENT ON COLUMN public.financial_transactions.last_notification_sent IS 'Last date a notification was sent for this transaction';



