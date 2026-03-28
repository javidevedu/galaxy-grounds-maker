
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- has_role function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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

-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT '',
  mcer_level TEXT NOT NULL DEFAULT 'A2',
  topics TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{reading,writing,listening,speaking}',
  time_limit_minutes INT DEFAULT 60,
  num_questions INT DEFAULT 14,
  audio_speed NUMERIC DEFAULT 0.9,
  writing_word_limit INT DEFAULT 100,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published quizzes" ON public.quizzes
  FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert quizzes" ON public.quizzes
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update quizzes" ON public.quizzes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete quizzes" ON public.quizzes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple_choice',
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL DEFAULT '',
  audio_script TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions of published quizzes" ON public.questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND (q.is_published = true OR public.has_role(auth.uid(), 'admin')))
  );
CREATE POLICY "Admins can insert questions" ON public.questions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update questions" ON public.questions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete questions" ON public.questions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Attempts table
CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  score INT,
  total_questions INT,
  warnings INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create attempts" ON public.attempts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update attempts" ON public.attempts
  FOR UPDATE USING (true);
CREATE POLICY "Admins can view attempts" ON public.attempts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon can view own attempt" ON public.attempts
  FOR SELECT USING (true);

-- Answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  student_answer TEXT,
  is_correct BOOLEAN,
  writing_feedback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert answers" ON public.answers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view answers" ON public.answers
  FOR SELECT USING (true);
CREATE POLICY "Anyone can update answers" ON public.answers
  FOR UPDATE USING (true);
