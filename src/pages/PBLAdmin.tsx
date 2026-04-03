import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Copy, Trash2, LogOut, BarChart3, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import TopicSelector from '@/components/admin/TopicSelector';
import { TARGET_AUDIENCES, SKILLS } from '@/constants/englishTopics';

export default function PBLAdmin() {
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [mcerLevel, setMcerLevel] = useState('A2');
  const [knowledgeArea, setKnowledgeArea] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['reading', 'writing', 'listening']);
  const [timeLimit, setTimeLimit] = useState(30);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/PBL/admin/login');
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchActivities();
  }, [isAdmin]);

  const fetchActivities = async () => {
    const { data } = await supabase
      .from('pbl_activities')
      .select('*')
      .order('created_at', { ascending: false });
    setActivities(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!title || selectedTopics.length === 0) {
      toast.error('Please fill in the title and select at least one topic.');
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('pbl_activities').insert({
      title,
      mcer_level: mcerLevel,
      knowledge_area: knowledgeArea,
      grammar_topics: selectedTopics.join(', '),
      skills: selectedSkills,
      time_limit_minutes: timeLimit,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });
    if (error) {
      toast.error('Error creating activity.');
    } else {
      toast.success('Activity created!');
      setTitle('');
      setKnowledgeArea('');
      setSelectedTopics([]);
      setSelectedSkills(['reading', 'writing', 'listening']);
      setTimeLimit(30);
      fetchActivities();
    }
    setCreating(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('pbl_activities').update({ is_published: !current }).eq('id', id);
    fetchActivities();
    toast.success(!current ? 'Activity published!' : 'Activity unpublished.');
  };

  const deleteActivity = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('pbl_activities').delete().eq('id', id);
    fetchActivities();
    toast.success('Activity deleted.');
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/PBL/activity/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">PBL English — Admin</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/PBL/admin/results')}>
            <BarChart3 className="w-4 h-4 mr-1" /> Results
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-3xl space-y-6">
        {/* Create form */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Create New Activity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="PBL: Environmental Problems - B1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>MCER Level</Label>
                <Select value={mcerLevel} onValueChange={setMcerLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Knowledge Area</Label>
              <Input value={knowledgeArea} onChange={(e) => setKnowledgeArea(e.target.value)} placeholder="e.g. Environmental Science, Business, Medicine..." />
            </div>

            <div className="space-y-3">
              <Label>Skills</Label>
              <div className="grid grid-cols-3 gap-3">
                {SKILLS.filter(s => s.value !== 'speaking').map((skill) => (
                  <label
                    key={skill.value}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedSkills.includes(skill.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    <Checkbox
                      checked={selectedSkills.includes(skill.value)}
                      onCheckedChange={() => toggleSkill(skill.value)}
                      className="mt-0.5"
                    />
                    <div className="font-medium text-sm">{skill.label}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Grammar Topics</Label>
              <TopicSelector selected={selectedTopics} onChange={setSelectedTopics} />
            </div>

            <Button onClick={handleCreate} disabled={creating || !title || selectedTopics.length === 0}>
              {creating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              Create Activity
            </Button>
          </CardContent>
        </Card>

        {/* Activities list */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Activities ({activities.length})</h2>
          {activities.map((a) => (
            <Card key={a.id} className="glass-card">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-semibold">{a.title}</div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{a.mcer_level}</Badge>
                    <span>{a.time_limit_minutes} min</span>
                    {a.knowledge_area && <span>• {a.knowledge_area}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => copyLink(a.id)} title="Copy link">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublish(a.id, a.is_published)}
                    title={a.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {a.is_published ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteActivity(a.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
