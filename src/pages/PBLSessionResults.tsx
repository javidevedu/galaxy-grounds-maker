import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, BookOpen, PenTool, Headphones, MessageCircle } from 'lucide-react';

export default function PBLSessionResults() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('pbl_sessions')
        .select('*, pbl_activities(*)')
        .eq('id', sessionId)
        .single();
      setSession(data);
      setLoading(false);
    };
    fetch();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Results not found.</p>
      </div>
    );
  }

  const feedback = session.detailed_feedback as any;
  const score = session.score ?? 0;

  const skillIcons: Record<string, any> = {
    grammar: PenTool,
    vocabulary: BookOpen,
    comprehension: Headphones,
    context_usage: MessageCircle,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="glass-card text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Activity Completed!</CardTitle>
            <p className="text-muted-foreground">{(session as any).pbl_activities?.title}</p>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary mb-2">{score}%</div>
            <Progress value={score} className="h-3 mb-4" />
            <p className="text-sm text-muted-foreground">
              {session.student_name} • {session.student_id}
            </p>
          </CardContent>
        </Card>

        {feedback && (
          <>
            {/* Skill breakdown */}
            {feedback.skills && (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(feedback.skills).map(([skill, data]: [string, any]) => {
                  const Icon = skillIcons[skill] || BookOpen;
                  return (
                    <Card key={skill} className="glass-card">
                      <CardContent className="pt-6 text-center space-y-2">
                        <Icon className="w-6 h-6 mx-auto text-primary" />
                        <div className="font-semibold text-sm capitalize">{skill.replace('_', ' ')}</div>
                        <div className="text-2xl font-bold">{data.score ?? '-'}%</div>
                        <p className="text-xs text-muted-foreground">{data.comment}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Tips */}
            {feedback.tips && feedback.tips.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Tips to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.tips.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* General comment */}
            {feedback.general_comment && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">📝 Teacher Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feedback.general_comment}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="text-center">
          <Link to="/PBL">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
