import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Question = Tables<'questions'>;

export default function AdminQuizDetail() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Tables<'quizzes'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/LantestAI/admin/login');
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (quizId && user && isAdmin) {
      fetchData();
    }
  }, [quizId, user, isAdmin]);

  const fetchData = async () => {
    const [quizRes, questionsRes] = await Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId!).single(),
      supabase.from('questions').select('*').eq('quiz_id', quizId!).order('sort_order'),
    ]);
    if (quizRes.data) setQuiz(quizRes.data);
    if (questionsRes.data) setQuestions(questionsRes.data);
    setLoading(false);
  };

  const deleteQuestion = async (id: string) => {
    await supabase.from('questions').delete().eq('id', id);
    toast.success('Question deleted');
    fetchData();
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  const typeLabel = (t: string) => {
    if (t === 'multiple_choice') return 'Multiple Choice';
    if (t === 'fill_blank') return 'Fill in the Blank';
    if (t === 'writing') return 'Writing';
    if (t === 'speaking') return 'Speaking';
    return 'Listening';
  };

  const typeColor = (t: string) => {
    if (t === 'multiple_choice') return 'default' as const;
    if (t === 'fill_blank') return 'secondary' as const;
    return 'outline' as const;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/LantestAI/admin')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold">{quiz?.title}</h1>
            <p className="text-sm text-muted-foreground">{questions.length} questions</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        {questions.map((q, i) => (
          <Card key={q.id} className="glass-card">
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-heading font-bold text-muted-foreground">Q{i + 1}</span>
                    <Badge variant={typeColor(q.type)}>{typeLabel(q.type)}</Badge>
                  </div>
                  <p className="font-medium">{q.question_text}</p>
                  {q.type !== 'fill_blank' && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className={`p-2 rounded ${q.correct_answer === 'A' ? 'bg-success/10 text-success font-medium' : 'text-muted-foreground'}`}>A: {q.option_a}</div>
                      <div className={`p-2 rounded ${q.correct_answer === 'B' ? 'bg-success/10 text-success font-medium' : 'text-muted-foreground'}`}>B: {q.option_b}</div>
                      <div className={`p-2 rounded ${q.correct_answer === 'C' ? 'bg-success/10 text-success font-medium' : 'text-muted-foreground'}`}>C: {q.option_c}</div>
                      <div className={`p-2 rounded ${q.correct_answer === 'D' ? 'bg-success/10 text-success font-medium' : 'text-muted-foreground'}`}>D: {q.option_d}</div>
                    </div>
                  )}
                  {q.type === 'fill_blank' && (
                    <p className="text-sm text-success">Answer: {q.correct_answer}</p>
                  )}
                  {q.audio_script && (
                    <p className="text-xs text-muted-foreground italic">🎧 {q.audio_script}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No questions yet. Generate them from the dashboard.</p>
          </div>
        )}
      </main>
    </div>
  );
}
