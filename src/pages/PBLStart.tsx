import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

export default function PBLStart() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Tables<'pbl_activities'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (activityId) fetchActivity();
  }, [activityId]);

  const fetchActivity = async () => {
    const { data } = await supabase
      .from('pbl_activities')
      .select('*')
      .eq('id', activityId!)
      .eq('is_published', true)
      .single();
    if (data) setActivity(data);
    setLoading(false);
  };

  const startActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setStarting(true);

    const { data: existing } = await supabase
      .from('pbl_sessions')
      .select('student_name')
      .eq('activity_id', activityId!)
      .eq('student_id', studentId.trim())
      .limit(1)
      .maybeSingle();

    if (existing) {
      toast.error(`This Student ID is already registered by "${existing.student_name}".`);
      setStarting(false);
      return;
    }

    const { data, error } = await supabase.from('pbl_sessions').insert({
      activity_id: activityId!,
      student_name: studentName.trim(),
      student_id: studentId.trim(),
    }).select().single();

    if (error || !data) {
      toast.error('Error starting activity');
      setStarting(false);
      return;
    }

    navigate(`/pbl/activity/${activityId}/chat/${data.id}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  if (!activity) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Activity not found or not published.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg glass-card">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl font-heading">{activity.title}</CardTitle>
          <CardDescription>
            {activity.knowledge_area} • Level {activity.mcer_level}
          </CardDescription>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {activity.skills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {activity.time_limit_minutes} min
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Grammar: {activity.grammar_topics}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={startActivity} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label>Student ID</Label>
              <Input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="1234567890" required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={starting}>
              {starting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
              Start Activity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
