import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AttemptWithQuiz {
  id: string;
  student_name: string;
  student_id: string;
  score: number | null;
  total_questions: number | null;
  started_at: string;
  finished_at: string | null;
  warnings: number;
  is_completed: boolean;
  quizzes: { title: string } | null;
}

interface WritingFeedback {
  spelling_errors: { word: string; correction: string; context: string }[];
  grammar_errors: { error: string; correction: string; context: string }[];
  topics_used: string[];
  topics_missing: string[];
  overall_score: number;
  feedback: string;
}

interface AnswerWithFeedback {
  id: string;
  question_id: string;
  student_answer: string | null;
  is_correct: boolean | null;
  writing_feedback: WritingFeedback | null;
  questions: { type: string; question_text: string; correct_answer: string } | null;
}

export default function AdminResults() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [attemptAnswers, setAttemptAnswers] = useState<Record<string, AnswerWithFeedback[]>>({});

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/LantestAI/admin/login');
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (user && isAdmin) fetchAttempts();
  }, [user, isAdmin]);

  const fetchAttempts = async () => {
    const { data } = await supabase
      .from('attempts')
      .select('*, quizzes(title)')
      .order('started_at', { ascending: false });
    if (data) setAttempts(data as AttemptWithQuiz[]);
    setLoading(false);
  };

  const toggleExpand = async (attemptId: string) => {
    if (expandedAttempt === attemptId) {
      setExpandedAttempt(null);
      return;
    }
    setExpandedAttempt(attemptId);
    if (!attemptAnswers[attemptId]) {
      const { data } = await supabase
        .from('answers')
        .select('*, questions(type, question_text, correct_answer)')
        .eq('attempt_id', attemptId);
      if (data) {
        setAttemptAnswers(prev => ({ ...prev, [attemptId]: data as unknown as AnswerWithFeedback[] }));
      }
    }
  };

  const exportCSV = () => {
    const headers = 'Student Name,Student ID,Quiz,Score,Total,Date,Warnings\n';
    const rows = attempts.map(a =>
      `"${a.student_name}","${a.student_id}","${a.quizzes?.title || ''}",${a.score || 0},${a.total_questions || 0},"${new Date(a.started_at).toLocaleDateString()}",${a.warnings}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.click();
    toast.success('CSV exported!');
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/LantestAI/admin')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-heading font-bold">Student Results</h1>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Warnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map(a => (
                  <>
                    <TableRow key={a.id} className="cursor-pointer" onClick={() => toggleExpand(a.id)}>
                      <TableCell className="font-medium">{a.student_name}</TableCell>
                      <TableCell>{a.student_id}</TableCell>
                      <TableCell>{a.quizzes?.title || '-'}</TableCell>
                      <TableCell>
                        <span className="font-heading font-bold">{a.score || 0}</span>
                        <span className="text-muted-foreground">/{a.total_questions || 0}</span>
                      </TableCell>
                      <TableCell>{new Date(a.started_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {a.warnings > 0 ? (
                          <Badge variant="destructive">{a.warnings}</Badge>
                        ) : (
                          <Badge variant="secondary">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.is_completed ? 'default' : 'destructive'}>
                          {a.is_completed ? 'Completed' : 'Closed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expandedAttempt === a.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </TableCell>
                    </TableRow>
                    {expandedAttempt === a.id && (
                      <TableRow key={`${a.id}-detail`}>
                        <TableCell colSpan={8} className="bg-muted/30 p-4">
                          <WritingDetails answers={attemptAnswers[a.id] || []} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {attempts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No results yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function WritingDetails({ answers }: { answers: AnswerWithFeedback[] }) {
  const writingAnswers = answers.filter(a => a.questions?.type === 'writing');

  if (writingAnswers.length === 0) {
    return <p className="text-sm text-muted-foreground">No writing questions in this attempt.</p>;
  }

  return (
    <div className="space-y-6">
      {writingAnswers.map((a, i) => {
        const fb = a.writing_feedback;
        return (
          <div key={a.id} className="space-y-3">
            <h4 className="font-heading font-bold text-sm">Writing Question {i + 1}</h4>
            <p className="text-sm text-muted-foreground">{a.questions?.question_text}</p>

            <div className="bg-card rounded-lg p-3 border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Student's Answer:</p>
              <p className="text-sm whitespace-pre-wrap">{a.student_answer || '(empty)'}</p>
            </div>

            {!fb && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI grading in progress...
              </div>
            )}

            {fb && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant={fb.overall_score >= 7 ? 'default' : fb.overall_score >= 4 ? 'secondary' : 'destructive'}>
                    Score: {fb.overall_score}/10
                  </Badge>
                </div>

                <p className="text-sm">{fb.feedback}</p>

                {fb.spelling_errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-destructive flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Spelling Errors ({fb.spelling_errors.length})
                    </p>
                    {fb.spelling_errors.map((err, j) => (
                      <div key={j} className="text-xs bg-destructive/5 rounded p-2">
                        <span className="line-through text-destructive">{err.word}</span>
                        {' → '}
                        <span className="font-medium text-foreground">{err.correction}</span>
                        <span className="text-muted-foreground ml-2">({err.context})</span>
                      </div>
                    ))}
                  </div>
                )}

                {fb.grammar_errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-warning flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Grammar Errors ({fb.grammar_errors.length})
                    </p>
                    {fb.grammar_errors.map((err, j) => (
                      <div key={j} className="text-xs bg-warning/5 rounded p-2">
                        <span className="text-foreground">{err.error}</span>
                        {' → '}
                        <span className="font-medium">{err.correction}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  {fb.topics_used.length > 0 && (
                    <div>
                      <p className="text-xs font-medium flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" /> Topics Used
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {fb.topics_used.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                      </div>
                    </div>
                  )}
                  {fb.topics_missing.length > 0 && (
                    <div>
                      <p className="text-xs font-medium flex items-center gap-1 mb-1">
                        <XCircle className="w-3 h-3 text-destructive" /> Topics Missing
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {fb.topics_missing.map(t => <Badge key={t} variant="destructive" className="text-xs">{t}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
