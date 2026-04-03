
-- PBL Activities table
CREATE TABLE public.pbl_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  mcer_level text NOT NULL DEFAULT 'A2',
  knowledge_area text NOT NULL DEFAULT '',
  grammar_topics text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{reading,writing,listening}'::text[],
  time_limit_minutes integer NOT NULL DEFAULT 30,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pbl_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert pbl_activities" ON public.pbl_activities
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pbl_activities" ON public.pbl_activities
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pbl_activities" ON public.pbl_activities
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published pbl_activities" ON public.pbl_activities
  FOR SELECT TO public USING ((is_published = true) OR has_role(auth.uid(), 'admin'::app_role));

-- PBL Sessions table
CREATE TABLE public.pbl_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid NOT NULL REFERENCES public.pbl_activities(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_id text NOT NULL,
  score integer NULL,
  detailed_feedback jsonb NULL,
  is_completed boolean NOT NULL DEFAULT false,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone NULL
);

ALTER TABLE public.pbl_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create pbl_sessions" ON public.pbl_sessions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can view pbl_sessions" ON public.pbl_sessions
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can update pbl_sessions" ON public.pbl_sessions
  FOR UPDATE TO public USING (true);

-- PBL Messages table
CREATE TABLE public.pbl_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.pbl_sessions(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pbl_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pbl_messages" ON public.pbl_messages
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can view pbl_messages" ON public.pbl_messages
  FOR SELECT TO public USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.pbl_messages;
