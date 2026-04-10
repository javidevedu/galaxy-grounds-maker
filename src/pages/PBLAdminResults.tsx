import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Loader2, MessageSquare, Download, ClipboardList, Pen, BookOpen, Headphones, Users } from 'lucide-react';

interface TaskAnalysis {
  task_description: string;
  student_response: string;
  completed: boolean;
  score: number;
  feedback: string;
}

interface Feedback {
  score: number;
  task_analysis?: TaskAnalysis[];
  grammar: { score: number; errors: string[]; correct_usage?: string[]; feedback: string };
  vocabulary: { score: number; strengths: string[]; weaknesses: string[]; feedback: string };
  comprehension: { score: number; feedback: string };
  communication: { score: number; feedback: string };
  participation?: { score: number; feedback: string };
  overall_feedback: string;
  recommendations: string[];
}

export default function PBLAdminResults() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/pbl/admin/login');
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (user && isAdmin) fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    const [sessRes, actRes] = await Promise.all([
      supabase.from('pbl_sessions').select('*').order('started_at', { ascending: false }),
      supabase.from('pbl_activities').select('*'),
    ]);
    if (sessRes.data) setSessions(sessRes.data);
    if (actRes.data) setActivities(actRes.data);
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ['Student Name', 'Student ID', 'Activity', 'Score', 'Completed', 'Date'];
    const rows = sessions.map(s => [
      s.student_name,
      s.student_id,
      activities.find(a => a.id === s.activity_id)?.title || 'Unknown',
      s.score ?? 'N/A',
      s.is_completed ? 'Yes' : 'No',
      new Date(s.started_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pbl-results.csv';
    a.click();
  };

  const scoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  // Group sessions by activity
  const grouped = activities
    .map(act => ({
      activity: act,
      sessions: sessions.filter(s => s.activity_id === act.id),
    }))
    .filter(g => g.sessions.length > 0);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/pbl/admin')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <MessageSquare className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-heading font-bold">PBL Results</h1>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-4">
        {grouped.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No results yet.</CardContent></Card>
        )}

        {/* Activities accordion */}
        <Accordion type="multiple" className="space-y-3">
          {grouped.map(({ activity, sessions: actSessions }) => (
            <AccordionItem key={activity.id} value={activity.id} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <div className="flex items-center gap-3 text-left w-full mr-3">
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold">{activity.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.mcer_level} · {activity.knowledge_area} · {actSessions.length} participant{actSessions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="outline">{actSessions.filter(s => s.is_completed).length}/{actSessions.length} completed</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {/* Participants accordion */}
                <Accordion type="multiple" className="space-y-2 mt-2">
                  {actSessions.map(session => {
                    const fb = session.detailed_feedback as unknown as Feedback | null;
                    return (
                      <AccordionItem key={session.id} value={session.id} className="border rounded-md overflow-hidden">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline text-sm">
                          <div className="flex items-center gap-3 w-full mr-3">
                            <span className="font-medium">{session.student_name}</span>
                            <span className="text-xs text-muted-foreground">ID: {session.student_id}</span>
                            <div className="ml-auto flex items-center gap-2">
                              {session.score != null && (
                                <Badge variant={session.score >= 70 ? 'default' : 'destructive'}>{session.score}%</Badge>
                              )}
                              <Badge variant={session.is_completed ? 'default' : 'secondary'} className="text-xs">
                                {session.is_completed ? 'Completed' : 'In Progress'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{new Date(session.started_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          {!fb ? (
                            <p className="text-sm text-muted-foreground py-2">No detailed feedback available.</p>
                          ) : (
                            <div className="space-y-4 mt-2">
                              {/* Overall score */}
                              <div className="flex items-center gap-3">
                                <span className={`text-3xl font-heading font-bold ${scoreColor(fb.score)}`}>{fb.score}%</span>
                                <Progress value={fb.score} className="flex-1 max-w-xs" />
                              </div>

                              {/* Task-by-Task */}
                              {fb.task_analysis && fb.task_analysis.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold flex items-center gap-1"><ClipboardList className="w-4 h-4" /> Task-by-Task Evaluation</h4>
                                  {fb.task_analysis.map((task, i) => (
                                    <div key={i} className="border rounded p-3 space-y-1 text-sm">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">Task {i + 1}</span>
                                        <div className="flex items-center gap-1">
                                          <Badge variant={task.completed ? 'default' : 'destructive'} className="text-xs">
                                            {task.completed ? '✅' : '❌'}
                                          </Badge>
                                          <Badge variant="outline" className={`text-xs ${scoreColor(task.score)}`}>{task.score}%</Badge>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground"><strong>Asked:</strong> {task.task_description}</p>
                                      <p className="text-xs italic border-l-2 border-primary/30 pl-2"><strong>Response:</strong> {task.student_response}</p>
                                      <p className="text-xs text-muted-foreground">{task.feedback}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Skills grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  { title: 'Grammar', icon: Pen, data: fb.grammar },
                                  { title: 'Vocabulary', icon: BookOpen, data: fb.vocabulary },
                                  { title: 'Comprehension', icon: Headphones, data: fb.comprehension },
                                  { title: 'Communication', icon: MessageSquare, data: fb.communication },
                                  ...(fb.participation ? [{ title: 'Participation', icon: Users, data: fb.participation }] : []),
                                ].map(({ title, icon: Icon, data }) => (
                                  <div key={title} className="border rounded p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                      <Icon className="w-3.5 h-3.5" />
                                      {title}
                                      <Badge variant="outline" className={`text-xs ml-auto ${scoreColor(data.score)}`}>{data.score}%</Badge>
                                    </div>
                                    <Progress value={data.score} className="h-1.5" />
                                    <p className="text-xs text-muted-foreground">{data.feedback}</p>
                                    {'errors' in data && (data as any).errors?.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-destructive">Errors:</p>
                                        <ul className="text-xs text-muted-foreground list-disc pl-4">
                                          {(data as any).errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {'correct_usage' in data && (data as any).correct_usage?.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-green-600">Correct usage:</p>
                                        <ul className="text-xs text-muted-foreground list-disc pl-4">
                                          {(data as any).correct_usage.map((e: string, i: number) => <li key={i}>{e}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {'strengths' in data && (data as any).strengths?.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-green-600">Strengths:</p>
                                        <ul className="text-xs text-muted-foreground list-disc pl-4">
                                          {(data as any).strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {'weaknesses' in data && (data as any).weaknesses?.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-destructive">Areas to improve:</p>
                                        <ul className="text-xs text-muted-foreground list-disc pl-4">
                                          {(data as any).weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Teacher's Feedback */}
                              {fb.overall_feedback && (
                                <div className="border rounded p-3">
                                  <h4 className="text-sm font-semibold mb-1">Teacher's Feedback</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{fb.overall_feedback}</p>
                                </div>
                              )}

                              {/* Recommendations */}
                              {fb.recommendations?.length > 0 && (
                                <div className="border rounded p-3">
                                  <h4 className="text-sm font-semibold mb-1">Study Recommendations</h4>
                                  <ul className="space-y-1">
                                    {fb.recommendations.map((r, i) => (
                                      <li key={i} className="text-xs text-muted-foreground flex gap-1">
                                        <span className="font-bold text-primary">{i + 1}.</span> {r}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
}
