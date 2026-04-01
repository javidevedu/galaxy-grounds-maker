import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Volume2, AlertTriangle, Loader2, CheckCircle2, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import QuizResults from '@/components/quiz/QuizResults';

type Question = Tables<'questions'>;

export default function QuizTake() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Tables<'quizzes'> | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [closed, setClosed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [scorable, setScorable] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningsRef = useRef(0);

  useEffect(() => {
    if (quizId && attemptId) fetchData();
  }, [quizId, attemptId]);

  const fetchData = async () => {
    const [quizRes, questionsRes] = await Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId!).single(),
      supabase.from('questions').select('*').eq('quiz_id', quizId!).order('sort_order'),
    ]);
    if (quizRes.data) {
      setQuiz(quizRes.data);
      if (quizRes.data.time_limit_minutes) {
        setTimeLeft(quizRes.data.time_limit_minutes * 60);
      }
    }
    if (questionsRes.data) setQuestions(questionsRes.data);
    setLoading(false);

    // Request fullscreen
    try {
      await document.documentElement.requestFullscreen();
    } catch { /* ignore */ }
  };

  // Timer
  useEffect(() => {
    if (timeLeft === null || finished || closed) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t !== null ? t - 1 : null), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, finished, closed]);

  // Anti-cheat
  const handleViolation = useCallback(() => {
    if (finished || closed) return;
    const newWarnings = warningsRef.current + 1;
    warningsRef.current = newWarnings;
    setWarnings(newWarnings);

    if (newWarnings >= 2) {
      setClosed(true);
      supabase.from('attempts').update({
        warnings: newWarnings,
        is_completed: false,
        finished_at: new Date().toISOString(),
      }).eq('id', attemptId!).then(() => {});
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } else {
      setShowWarning(true);
      supabase.from('attempts').update({ warnings: newWarnings }).eq('id', attemptId!).then(() => {});
    }
  }, [attemptId, finished, closed]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };
    const onBlur = () => handleViolation();
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !finished && !closed && questions.length > 0) {
        handleViolation();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [handleViolation, finished, closed, questions.length]);

  const setAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const [isPlaying, setIsPlaying] = useState(false);

  const stopAudio = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const getEnglishVoice = (): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();
    // Prefer native English voices, prioritize en-US
    const preferred = voices.find(v => v.lang === 'en-US' && !v.localService === false) 
      || voices.find(v => v.lang === 'en-US')
      || voices.find(v => v.lang.startsWith('en-'))
      || voices.find(v => v.lang.startsWith('en'));
    return preferred || null;
  };

  const speakText = (text: string) => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    // Ensure voices are loaded before speaking
    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      // Force an English voice to prevent Spanish pronunciation
      const englishVoice = getEnglishVoice();
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      const speed = (quiz as any)?.audio_speed ?? 0.9;
      utterance.rate = speed;
      // Keep pitch natural even at slower speeds
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded yet on some browsers
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        doSpeak();
        speechSynthesis.onvoiceschanged = null;
      };
    } else {
      doSpeak();
    }
  };

  // Stop audio when navigating between questions
  useEffect(() => {
    stopAudio();
  }, [current]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const scorableQuestions = questions.filter(q => q.type !== 'speaking' && q.type !== 'writing');
    let correctCount = 0;
    const writingQuestions: { question: Question; studentAnswer: string }[] = [];
    const answerInserts = questions.map(q => {
      const studentAnswer = answers[q.id] || '';
      let isCorrect = false;
      if (q.type === 'writing' || q.type === 'speaking') {
        isCorrect = false;
      } else if (q.type === 'fill_blank') {
        isCorrect = studentAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
      } else {
        isCorrect = studentAnswer === q.correct_answer;
      }
      if (isCorrect) correctCount++;
      if (q.type === 'writing') {
        writingQuestions.push({ question: q, studentAnswer });
      }
      return {
        attempt_id: attemptId!,
        question_id: q.id,
        student_answer: studentAnswer,
        is_correct: isCorrect,
      };
    });

    await supabase.from('answers').insert(answerInserts);
    await supabase.from('attempts').update({
      score: correctCount,
      total_questions: scorableQuestions.length,
      finished_at: new Date().toISOString(),
      is_completed: true,
      warnings: warningsRef.current,
    }).eq('id', attemptId!);

    for (const wq of writingQuestions) {
      supabase.functions.invoke('grade-writing', {
        body: {
          attempt_id: attemptId,
          question_id: wq.question.id,
          student_answer: wq.studentAnswer,
          topics: quiz?.topics || '',
          model_answer: wq.question.correct_answer,
        },
      }).catch(err => console.error('Writing grading error:', err));
    }

    setScore(correctCount);
    setScorable(scorableQuestions.length);
    setFinished(true);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  if (closed) return (
    <div className="min-h-screen flex items-center justify-center bg-destructive/5 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12 space-y-4">
          <AlertTriangle className="w-16 h-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-heading font-bold">Test Closed</h2>
          <p className="text-muted-foreground">Test closed due to academic integrity violation.</p>
        </CardContent>
      </Card>
    </div>
  );

  if (finished) return (
    <QuizResults
      questions={questions}
      answers={answers}
      attemptId={attemptId!}
      scorableCorrect={score}
      scorableTotal={scorable}
    />
  );

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-8 text-center space-y-4">
              <AlertTriangle className="w-16 h-16 mx-auto text-warning" />
              <h2 className="text-xl font-heading font-bold">WARNING</h2>
              <p>You left the test window. If this happens again the test will close.</p>
              <Button onClick={() => {
                setShowWarning(false);
                try { document.documentElement.requestFullscreen(); } catch {}
              }}>
                Continue Test
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm p-4">
        <div className="container mx-auto flex items-center justify-between max-w-3xl">
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-lg">{quiz?.title}</h1>
            <Badge variant="outline">{current + 1}/{questions.length}</Badge>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> {formatTime(timeLeft)}
              </Badge>
            )}
            {warnings > 0 && (
              <Badge variant="destructive">⚠ {warnings}</Badge>
            )}
          </div>
        </div>
        <div className="container mx-auto max-w-3xl mt-3">
          <Progress value={((current + 1) / questions.length) * 100} className="h-2" />
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl flex flex-col">
        <Card className="flex-1 glass-card">
          <CardContent className="py-6 space-y-6">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 mt-1">
                {q.type === 'multiple_choice' ? 'MC' : q.type === 'fill_blank' ? 'FB' : '🎧'}
              </Badge>
              <p className="text-lg font-medium">{q.question_text}</p>
            </div>

            {q.type === 'listening' && q.audio_script && (
              <div className="flex gap-2">
                <Button
                  variant={isPlaying ? 'destructive' : 'outline'}
                  onClick={() => speakText(q.audio_script!)}
                  className="flex-1"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  {isPlaying ? 'Stop Audio' : 'Play Audio'}
                </Button>
                {!isPlaying && (
                  <Button variant="outline" onClick={() => speakText(q.audio_script!)}>
                    🔁 Repeat
                  </Button>
                )}
              </div>
            )}

            {(q.type === 'multiple_choice' || q.type === 'listening') && (
              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map(opt => {
                  const text = q[`option_${opt.toLowerCase()}` as keyof Question] as string;
                  if (!text) return null;
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswer(q.id, opt)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span className="font-heading font-bold mr-3">{opt}</span>
                      {text}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'fill_blank' && (
              <Input
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                placeholder="Type your answer..."
                className="text-lg"
              />
            )}

            {q.type === 'writing' && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Write your text below using the required topics and vocabulary. 
                  <span className="font-medium text-foreground"> Target: ~{(quiz as any)?.writing_word_limit || 100} words.</span>
                </p>
                <Textarea
                  value={answers[q.id] || ''}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  placeholder="Write your text here..."
                  className="min-h-[200px] text-base leading-relaxed"
                  rows={8}
                />
                <p className={`text-xs text-right ${
                  (answers[q.id] || '').split(/\s+/).filter(Boolean).length >= ((quiz as any)?.writing_word_limit || 100)
                    ? 'text-green-600 font-medium'
                    : 'text-muted-foreground'
                }`}>
                  {(answers[q.id] || '').split(/\s+/).filter(Boolean).length} / {(quiz as any)?.writing_word_limit || 100} words
                </p>
              </div>
            )}

            {q.type === 'speaking' && (
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-6 text-center space-y-3">
                  <p className="text-xl font-heading font-bold text-destructive">
                    🎤 SPEAKING EVALUATION
                  </p>
                  <p className="text-lg font-semibold text-destructive">
                    Once you have finished all the other questions, approach your teacher and read the paragraph below out loud so your speaking can be graded.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-5">
                  <p className="text-base leading-relaxed">{q.question_text}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          {current === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
              Submit Test
            </Button>
          ) : (
            <Button onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
