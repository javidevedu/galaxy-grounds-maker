import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreateQuizForm from '@/components/admin/CreateQuizForm';
import { toast } from 'sonner';
import { Plus, Sparkles, Share2, LogOut, BarChart3, Eye, Trash2, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Quiz = Tables<'quizzes'>;

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/LantestAI/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchQuizzes();
  }, [user, isAdmin]);

  const fetchQuizzes = async () => {
    const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
    if (data) setQuizzes(data);
  };

  const createQuiz = async (form: { title: string; target_audience: string; mcer_level: string; topics: string; skills: string[]; time_limit_minutes: number; num_questions: number; audio_speed: number; writing_word_limit: number }) => {
    setCreating(true);
    const { data, error } = await supabase.from('quizzes').insert({
      title: form.title,
      target_audience: form.target_audience,
      mcer_level: form.mcer_level,
      topics: form.topics,
      skills: form.skills,
      time_limit_minutes: form.time_limit_minutes,
      num_questions: form.num_questions,
      audio_speed: form.audio_speed,
      writing_word_limit: form.writing_word_limit,
      created_by: user!.id,
    } as any).select().single();
    setCreating(false);
    if (error) {
      toast.error('Error creating quiz');
      return;
    }
    toast.success('Quiz created!');
    setShowCreate(false);
    fetchQuizzes();
  };

  const generateQuestions = async (quiz: Quiz) => {
    setGenerating(true);
    try {
      const res = await supabase.functions.invoke('generate-questions', {
        body: {
          quiz_id: quiz.id,
          target_audience: quiz.target_audience,
          mcer_level: quiz.mcer_level,
          topics: quiz.topics,
          skills: (quiz as any).skills || ['reading', 'writing', 'listening', 'speaking'],
          num_questions: (quiz as any).num_questions || 14,
          writing_word_limit: (quiz as any).writing_word_limit || 100,
        },
      });
      if (res.error) throw res.error;
      toast.success('Questions generated successfully!');
      fetchQuizzes();
    } catch (e) {
      toast.error('Error generating questions');
      console.error(e);
    }
    setGenerating(false);
  };

  const publishQuiz = async (quiz: Quiz) => {
    await supabase.from('quizzes').update({ is_published: !quiz.is_published }).eq('id', quiz.id);
    toast.success(quiz.is_published ? 'Quiz unpublished' : 'Quiz published!');
    fetchQuizzes();
  };

  const deleteQuiz = async (id: string) => {
    await supabase.from('quizzes').delete().eq('id', id);
    toast.success('Quiz deleted');
    fetchQuizzes();
  };

  const copyLink = (quizId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/LantestAI/quiz/${quizId}`);
    toast.success('Link copied to clipboard!');
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-heading font-bold">EnglishTest Pro</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/LantestAI/admin/results')}>
              <BarChart3 className="w-4 h-4 mr-1" /> Results
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold">Quizzes</h2>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-4 h-4 mr-1" /> New Quiz
          </Button>
        </div>

        {showCreate && (
          <CreateQuizForm onSubmit={createQuiz} creating={creating} />
        )}

        <div className="space-y-4">
          {quizzes.map(quiz => (
            <Card key={quiz.id} className="glass-card">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold">{quiz.title}</h3>
                    <Badge variant={quiz.is_published ? 'default' : 'secondary'}>
                      {quiz.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline">{quiz.mcer_level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quiz.target_audience} • {quiz.topics}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => generateQuestions(quiz)} disabled={generating}>
                    {generating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/LantestAI/admin/quiz/${quiz.id}`)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => publishQuiz(quiz)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {quiz.is_published && (
                    <Button variant="ghost" size="sm" onClick={() => copyLink(quiz.id)}>
                      📋
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteQuiz(quiz.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {quizzes.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No quizzes yet. Create your first quiz to get started!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
