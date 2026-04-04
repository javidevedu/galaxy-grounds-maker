import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Sparkles, Share2, LogOut, BarChart3, Eye, Trash2, Loader2, MessageSquare } from 'lucide-react';
import PBLCreateForm from '@/components/pbl/PBLCreateForm';
import type { Tables } from '@/integrations/supabase/types';

type Activity = Tables<'pbl_activities'>;

export default function PBLIndex() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/pbl/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchActivities();
  }, [user, isAdmin]);

  const fetchActivities = async () => {
    const { data } = await supabase.from('pbl_activities').select('*').order('created_at', { ascending: false });
    if (data) setActivities(data);
  };

  const createActivity = async (form: {
    title: string;
    mcer_level: string;
    knowledge_area: string;
    grammar_topics: string;
    skills: string[];
    time_limit_minutes: number;
  }) => {
    setCreating(true);
    const { error } = await supabase.from('pbl_activities').insert({
      title: form.title,
      mcer_level: form.mcer_level,
      knowledge_area: form.knowledge_area,
      grammar_topics: form.grammar_topics,
      skills: form.skills,
      time_limit_minutes: form.time_limit_minutes,
      created_by: user!.id,
    }).select().single();
    setCreating(false);
    if (error) {
      toast.error('Error creating activity');
      return;
    }
    toast.success('Activity created!');
    setShowCreate(false);
    fetchActivities();
  };

  const publishActivity = async (activity: Activity) => {
    await supabase.from('pbl_activities').update({ is_published: !activity.is_published }).eq('id', activity.id);
    toast.success(activity.is_published ? 'Activity unpublished' : 'Activity published!');
    fetchActivities();
  };

  const deleteActivity = async (id: string) => {
    await supabase.from('pbl_activities').delete().eq('id', id);
    toast.success('Activity deleted');
    fetchActivities();
  };

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/pbl/activity/${id}`);
    toast.success('Link copied!');
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-xl font-heading font-bold">PBL English</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/pbl/admin/results')}>
              <BarChart3 className="w-4 h-4 mr-1" /> Results
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold">Activities</h2>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-4 h-4 mr-1" /> New Activity
          </Button>
        </div>

        {showCreate && <PBLCreateForm onSubmit={createActivity} creating={creating} />}

        <div className="space-y-4">
          {activities.map(activity => (
            <Card key={activity.id} className="glass-card">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold">{activity.title}</h3>
                    <Badge variant={activity.is_published ? 'default' : 'secondary'}>
                      {activity.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline">{activity.mcer_level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.knowledge_area} • {activity.grammar_topics} • {activity.time_limit_minutes} min
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => publishActivity(activity)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {activity.is_published && (
                    <Button variant="ghost" size="sm" onClick={() => copyLink(activity.id)}>
                      📋
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteActivity(activity.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No activities yet. Create your first PBL activity!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
