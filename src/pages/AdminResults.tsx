import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Download, Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle, BookOpen, Headphones, PenLine, Mic, Save, FileText } from 'lucide-react';
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
  speaking_feedback: string | null;
  quiz_id: string;
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
  questions: { type: string; question_text: string; correct_answer: string; option_a: string | null; option_b: string | null; option_c: string | null; option_d: string | null } | null;
}

export default function AdminResults() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [attemptAnswers, setAttemptAnswers] = useState<Record<string, AnswerWithFeedback[]>>({});
  const [speakingNotes, setSpeakingNotes] = useState<Record<string, string>>({});
  const [savingSpeaking, setSavingSpeaking] = useState<Record<string, boolean>>({});

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
    if (data) {
      setAttempts(data as unknown as AttemptWithQuiz[]);
      const notes: Record<string, string> = {};
      for (const a of data as unknown as AttemptWithQuiz[]) {
        notes[a.id] = a.speaking_feedback || '';
      }
      setSpeakingNotes(notes);
    }
    setLoading(false);
  };

  // Group attempts by quiz
  const groupedByQuiz = useMemo(() => {
    const groups: Record<string, { title: string; attempts: AttemptWithQuiz[] }> = {};
    for (const a of attempts) {
      const key = a.quiz_id;
      if (!groups[key]) {
        groups[key] = { title: a.quizzes?.title || 'Unknown Quiz', attempts: [] };
      }
      groups[key].attempts.push(a);
    }
    return Object.entries(groups);
  }, [attempts]);

  const toggleExpand = async (attemptId: string) => {
    if (expandedAttempt === attemptId) {
      setExpandedAttempt(null);
      return;
    }
    setExpandedAttempt(attemptId);
    if (!attemptAnswers[attemptId]) {
      const { data } = await supabase
        .from('answers')
        .select('*, questions(type, question_text, correct_answer, option_a, option_b, option_c, option_d)')
        .eq('attempt_id', attemptId);
      if (data) {
        setAttemptAnswers(prev => ({ ...prev, [attemptId]: data as unknown as AnswerWithFeedback[] }));
      }
    }
  };

  const saveSpeakingFeedback = async (attemptId: string) => {
    setSavingSpeaking(prev => ({ ...prev, [attemptId]: true }));
    const { error } = await supabase.from('attempts').update({
      speaking_feedback: speakingNotes[attemptId] || null,
    }).eq('id', attemptId);
    setSavingSpeaking(prev => ({ ...prev, [attemptId]: false }));
    if (error) {
      toast.error('Error saving speaking feedback');
    } else {
      toast.success('Speaking feedback saved!');
    }
  };

  const exportCSV = () => {
    const headers = ['Quiz', 'Student Name', 'Student ID', 'Score', 'Total Questions', 'Percentage', 'Date', 'Time', 'Status', 'Warnings'];
    const sortedAttempts = [...attempts].sort((a, b) => {
      const quizA = a.quizzes?.title || '';
      const quizB = b.quizzes?.title || '';
      if (quizA !== quizB) return quizA.localeCompare(quizB);
      return a.student_name.localeCompare(b.student_name);
    });

    const rows = sortedAttempts.map(a => {
      const score = a.score || 0;
      const total = a.total_questions || 0;
      const pct = total > 0 ? Math.round((score / total) * 100) : 0;
      const date = new Date(a.started_at);
      return [
        a.quizzes?.title || 'Unknown',
        a.student_name,
        a.student_id,
        score,
        total,
        `${pct}%`,
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        a.is_completed ? 'Completed' : 'Closed',
        a.warnings
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-4">
        {groupedByQuiz.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-8 text-center text-muted-foreground">
              No results yet
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {groupedByQuiz.map(([quizId, group]) => (
              <AccordionItem key={quizId} value={quizId} className="border rounded-lg overflow-hidden bg-card">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="font-heading font-bold text-sm">{group.title}</p>
                      <p className="text-xs text-muted-foreground">{group.attempts.length} attempt{group.attempts.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Warnings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.attempts.map(a => (
                        <>
                          <TableRow key={a.id} className="cursor-pointer" onClick={() => toggleExpand(a.id)}>
                            <TableCell className="font-medium">{a.student_name}</TableCell>
                            <TableCell>{a.student_id}</TableCell>
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
                              <TableCell colSpan={7} className="bg-muted/30 p-4">
                                <AttemptDetail
                                  answers={attemptAnswers[a.id] || []}
                                  attemptId={a.id}
                                  speakingNote={speakingNotes[a.id] || ''}
                                  onSpeakingNoteChange={(val) => setSpeakingNotes(prev => ({ ...prev, [a.id]: val }))}
                                  onSaveSpeaking={() => saveSpeakingFeedback(a.id)}
                                  savingSpeaking={savingSpeaking[a.id] || false}
                                />
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>
    </div>
  );
}

function AttemptDetail({ answers, attemptId, speakingNote, onSpeakingNoteChange, onSaveSpeaking, savingSpeaking }: {
  answers: AnswerWithFeedback[];
  attemptId: string;
  speakingNote: string;
  onSpeakingNoteChange: (val: string) => void;
  onSaveSpeaking: () => void;
  savingSpeaking: boolean;
}) {
  const readingAnswers = answers.filter(a => a.questions?.type === 'multiple_choice');
  const listeningAnswers = answers.filter(a => a.questions?.type === 'listening');
  const fillBlankAnswers = answers.filter(a => a.questions?.type === 'fill_blank');
  const writingAnswers = answers.filter(a => a.questions?.type === 'writing');
  const speakingAnswers = answers.filter(a => a.questions?.type === 'speaking');

  const getOptionText = (q: AnswerWithFeedback['questions'], letter: string) => {
    if (!q) return '';
    const key = `option_${letter.toLowerCase()}` as keyof typeof q;
    return (q[key] as string) || '';
  };

  const getCorrectOptionText = (a: AnswerWithFeedback) => {
    if (!a.questions) return a.questions?.correct_answer || '';
    const letter = a.questions.correct_answer;
    const text = getOptionText(a.questions, letter);
    return text ? `${letter}) ${text}` : letter;
  };

  const getStudentOptionText = (a: AnswerWithFeedback) => {
    if (!a.questions || !a.student_answer) return a.student_answer || '—';
    const letter = a.student_answer;
    const text = getOptionText(a.questions, letter);
    return text ? `${letter}) ${text}` : letter;
  };

  if (answers.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading answers...</p>;
  }

  return (
    <div className="space-y-6">
      {readingAnswers.length > 0 && (
        <QuestionSection
          icon={<BookOpen className="w-4 h-4 text-primary" />}
          title="Reading"
          answers={readingAnswers}
          getStudentText={getStudentOptionText}
          getCorrectText={getCorrectOptionText}
        />
      )}

      {fillBlankAnswers.length > 0 && (
        <QuestionSection
          icon={<PenLine className="w-4 h-4 text-primary" />}
          title="Fill in the Blank"
          answers={fillBlankAnswers}
          getStudentText={(a) => a.student_answer || '—'}
          getCorrectText={(a) => a.questions?.correct_answer || ''}
        />
      )}

      {listeningAnswers.length > 0 && (
        <QuestionSection
          icon={<Headphones className="w-4 h-4 text-primary" />}
          title="Listening"
          answers={listeningAnswers}
          getStudentText={getStudentOptionText}
          getCorrectText={getCorrectOptionText}
        />
      )}

      {writingAnswers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-4 h-4 text-primary" />
            <h4 className="font-heading font-bold text-sm">Writing</h4>
          </div>
          {writingAnswers.map((a) => {
            const fb = a.writing_feedback;
            return (
              <div key={a.id} className="space-y-3 mb-4">
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

                    {fb.spelling_errors?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-destructive flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Spelling Errors ({fb.spelling_errors.length})
                        </p>
                        {fb.spelling_errors.map((err, j) => (
                          <div key={j} className="text-xs bg-destructive/5 rounded p-2">
                            <span className="line-through text-destructive">{err.word}</span>
                            {' → '}
                            <span className="font-medium text-foreground">{err.correction}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {fb.grammar_errors?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Grammar Errors ({fb.grammar_errors.length})
                        </p>
                        {fb.grammar_errors.map((err, j) => (
                          <div key={j} className="text-xs bg-muted rounded p-2">
                            <span className="text-foreground">{err.error}</span>
                            {' → '}
                            <span className="font-medium">{err.correction}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4">
                      {fb.topics_used?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium flex items-center gap-1 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" /> Topics Used
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {fb.topics_used.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                          </div>
                        </div>
                      )}
                      {fb.topics_missing?.length > 0 && (
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
      )}

      {(speakingAnswers.length > 0 || true) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mic className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-heading font-bold text-sm">Speaking Feedback</h4>
          </div>
          <div className="space-y-3">
            <Textarea
              value={speakingNote}
              onChange={(e) => onSpeakingNoteChange(e.target.value)}
              placeholder="Write speaking feedback for this student..."
              className="min-h-[100px] text-sm"
              rows={4}
            />
            <Button size="sm" onClick={onSaveSpeaking} disabled={savingSpeaking}>
              {savingSpeaking ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save Speaking Feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionSection({ icon, title, answers, getStudentText, getCorrectText }: {
  icon: React.ReactNode;
  title: string;
  answers: AnswerWithFeedback[];
  getStudentText: (a: AnswerWithFeedback) => string;
  getCorrectText: (a: AnswerWithFeedback) => string;
}) {
  const correct = answers.filter(a => a.is_correct).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-heading font-bold text-sm">{title}</h4>
        <Badge variant="outline" className="ml-auto text-xs">{correct}/{answers.length}</Badge>
      </div>
      <div className="space-y-2">
        {answers.map((a) => (
          <div key={a.id} className={`p-3 rounded-lg border text-sm ${a.is_correct ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}>
            <div className="flex items-start gap-2">
              {a.is_correct ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
              <div className="space-y-1 flex-1">
                <p className="text-xs font-medium">{a.questions?.question_text}</p>
                <p className="text-xs text-muted-foreground">Student: <span className="font-semibold">{getStudentText(a)}</span></p>
                {!a.is_correct && (
                  <p className="text-xs text-primary">Correct: <span className="font-semibold">{getCorrectText(a)}</span></p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
