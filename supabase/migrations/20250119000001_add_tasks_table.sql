-- ============================================================================
-- TASKS TABLE FOR AGENDA
-- ============================================================================
-- Created: 2025-01-19
-- Description: Table for user tasks/agenda items
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    due_time TIME,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON public.tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.tasks IS 'User tasks and agenda items';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Tasks table created successfully!';
    RAISE NOTICE '   - tasks table created';
    RAISE NOTICE '   - Indexes and triggers configured';
    RAISE NOTICE '   - RLS policies enabled';
END $$;


