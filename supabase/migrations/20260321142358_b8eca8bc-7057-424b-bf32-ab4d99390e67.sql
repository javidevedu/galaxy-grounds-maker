ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'writing';
ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'speaking';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS skills text[] DEFAULT ARRAY['reading', 'writing', 'listening', 'speaking']::text[];