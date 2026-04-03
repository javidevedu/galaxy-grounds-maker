import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageCircle, Clock, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PBLStart() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      const { data, error } = await supabase
        .from('pbl_activities')
        .select('*')
        .eq('id', activityId)
        .eq('is_published', true)
        .single();
      if (error || !data) {
        toast.error('Activity not found or not available.');
        return;
      }
      setActivity(data);
      setLoading(false);
    };
    fetchActivity();
  }, [activityId]);

  const handleStart = async () => {
    if (!studentName.trim() || !studentId.trim()) {
      toast.error('Please enter your name and ID.');
      return;
    }
    setStarting(true);
    const { data, error } = await supabase
      .from('pbl_sessions')
      .insert({
        activity_id: activityId!,
        student_name: studentName.trim(),
        student_id: studentId.trim(),
      })
      .select()
      .single();
    if (error) {
      toast.error('Could not start session.');
      setStarting(false);
      return;
    }
    navigate(`/PBL/chat/${data.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Activity not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{activity.title}</CardTitle>
          <CardDescription>
            Problem-Based Learning Activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{activity.time_limit_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>Level {activity.mcer_level}</span>
            </div>
          </div>

          {activity.knowledge_area && (
            <div className="text-sm text-muted-foreground">
              <strong>Area:</strong> {activity.knowledge_area}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Your ID</Label>
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
              />
            </div>
          </div>

          <Button
            onClick={handleStart}
            disabled={starting || !studentName.trim() || !studentId.trim()}
            className="w-full"
            size="lg"
          >
            {starting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
            Start Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
