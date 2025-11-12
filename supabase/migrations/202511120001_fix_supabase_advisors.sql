-- ============================================================================
-- SUPABASE ADVISOR WARNINGS - SEARCH_PATH & NOTIFICATION TYPES
-- ============================================================================
-- Created: 2025-11-12
-- Description:
--   1. Define search_path explicitly for critical functions highlighted by
--      the Supabase Security Advisor.
--   2. Atualiza a constraint de notification_logs para incluir notificações
--      de transações vencidas utilizadas pelo sistema.
-- ============================================================================

-- Garantir que as funções rodem sempre no schema esperado
ALTER FUNCTION public.update_user_cash_balance()
    SET search_path = public;

ALTER FUNCTION public.update_push_subscriptions_updated_at()
    SET search_path = public;

ALTER FUNCTION public.check_ai_usage_limit(user_uuid uuid)
    SET search_path = public;

ALTER FUNCTION public.increment_ai_usage(user_uuid uuid)
    SET search_path = public;

ALTER FUNCTION public.get_user_ai_limits(user_uuid uuid)
    SET search_path = public;

-- Atualizar constraint para incluir notificações de itens vencidos
ALTER TABLE public.notification_logs
    DROP CONSTRAINT IF EXISTS notification_logs_notification_type_check;

ALTER TABLE public.notification_logs
    ADD CONSTRAINT notification_logs_notification_type_check
        CHECK (
            notification_type IN (
                'recurring_3days',
                'recurring_1day',
                'recurring_day',
                'recurring_overdue',
                'scheduled_3days',
                'scheduled_1day',
                'scheduled_day',
                'scheduled_overdue'
            )
        );

-- ============================================================================
-- DONE
-- ============================================================================

