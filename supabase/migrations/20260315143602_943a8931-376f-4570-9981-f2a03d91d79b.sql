
-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT '',
  mcer_level TEXT NOT NULL DEFAULT 'A1',
  topics TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  time_limit_minutes INTEGER DEFAULT 60
);

-- Create questions table
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'fill_blank', 'listening');

CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  type public.question_type NOT NULL DEFAULT 'multiple_choice',
  question_text TEXT NOT NULL,
  audio_script TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Create attempts table
CREATE TABLE public.attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  warnings INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  student_answer TEXT,
  is_correct BOOLEAN DEFAULT false
);

-- Create admin roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Quizzes: admins can do everything, anyone can read published quizzes
CREATE POLICY "Admins can manage quizzes" ON public.quizzes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view published quizzes" ON public.quizzes
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Questions: admins can manage, anyone can read questions of published quizzes
CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view questions of published quizzes" ON public.questions
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_id AND quizzes.is_published = true));

-- Attempts: anyone can create, admins can view all
CREATE POLICY "Anyone can create attempts" ON public.attempts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own attempt" ON public.attempts
  FOR UPDATE TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view their own attempt" ON public.attempts
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can view all attempts" ON public.attempts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Answers: anyone can insert, admins can view all
CREATE POLICY "Anyone can insert answers" ON public.answers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own answers" ON public.answers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can view all answers" ON public.answers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles: only admins can view
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());
