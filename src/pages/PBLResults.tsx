import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Home } from 'lucide-react';

export default function PBLResults() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('pbl_sessions')
        .select('*')
        .eq('id', sessionId!)
        .single();
      if (data) setSession(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Results not available yet.</p>
    </div>
  );

  const score = session.score ?? 0;
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-16 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        <h1 className="text-3xl font-heading font-bold">Activity Completed!</h1>

        <Card className="glass-card">
          <CardContent className="py-10">
            <div className={`text-7xl font-heading font-bold ${scoreColor}`}>
              {score}%
            </div>
            <p className="text-muted-foreground mt-3 text-lg">Your Score</p>
            <Progress value={score} className="mt-5 max-w-xs mx-auto" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your teacher will review your performance and send you detailed feedback soon. Great job completing the activity! 🎉
            </p>
          </CardContent>
        </Card>

        <div className="pb-8">
          <a href="https://www.google.com/?hl=es">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
