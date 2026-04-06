import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, BookOpen, Pen, Headphones, MessageSquare, Home, Users } from 'lucide-react';

interface Feedback {
  score: number;
  grammar: { score: number; errors: string[]; correct_usage?: string[]; feedback: string };
  vocabulary: { score: number; strengths: string[]; weaknesses: string[]; feedback: string };
  comprehension: { score: number; feedback: string };
  communication: { score: number; feedback: string };
  participation?: { score: number; feedback: string };
  overall_feedback: string;
  recommendations: string[];
}

export default function PBLResults() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const { data } = await supabase
      .from('pbl_sessions')
      .select('*')
      .eq('id', sessionId!)
      .single();

    if (data) {
      setSession(data);
      setFeedback(data.detailed_feedback as unknown as Feedback);
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (!session || !feedback) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Results not available yet.</p>
    </div>
  );

  const scoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 pt-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-heading font-bold">Activity Completed!</h1>
          <p className="text-muted-foreground">Here's your detailed performance report</p>
        </div>

        {/* Overall Score */}
        <Card className="glass-card">
          <CardContent className="py-8 text-center">
            <div className={`text-6xl font-heading font-bold ${scoreColor(feedback.score)}`}>
              {feedback.score}%
            </div>
            <p className="text-muted-foreground mt-2">Overall Score</p>
            <Progress value={feedback.score} className="mt-4 max-w-xs mx-auto" />
          </CardContent>
        </Card>

        {/* Skill Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Grammar', icon: Pen, data: feedback.grammar },
            { title: 'Vocabulary', icon: BookOpen, data: feedback.vocabulary },
            { title: 'Comprehension', icon: Headphones, data: feedback.comprehension },
            { title: 'Communication', icon: MessageSquare, data: feedback.communication },
            ...(feedback.participation ? [{ title: 'Participation', icon: Users, data: feedback.participation }] : []),
          ].map(({ title, icon: Icon, data }) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {title}
                  <Badge variant="outline" className={scoreColor(data.score)}>{data.score}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={data.score} className="mb-3" />
                <p className="text-sm text-muted-foreground">{data.feedback}</p>
                {'errors' in data && (data as any).errors?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-destructive mb-1">Errors found:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                      {(data as any).errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                {'correct_usage' in data && (data as any).correct_usage?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-green-600 mb-1">Correct usage:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                      {(data as any).correct_usage.map((e: string, i: number) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                {'strengths' in data && (data as any).strengths?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-green-600 mb-1">Strengths:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                      {(data as any).strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {'weaknesses' in data && (data as any).weaknesses?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-destructive mb-1">Areas to improve:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                      {(data as any).weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teacher's Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{feedback.overall_feedback}</p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {feedback.recommendations?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="text-center pb-8">
          <Link to="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
