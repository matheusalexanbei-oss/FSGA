-- ============================================================================
-- FIX NOTIFICATION LOGS RLS POLICY
-- ============================================================================
-- Created: 2025-01-18
-- Description: Add INSERT and UPDATE policies for notification_logs
-- ============================================================================

-- Permitir que usuários insiram seus próprios logs de notificação
CREATE POLICY "Users can insert their own notification logs"
    ON public.notification_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários atualizem seus próprios logs de notificação
CREATE POLICY "Users can update their own notification logs"
    ON public.notification_logs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

