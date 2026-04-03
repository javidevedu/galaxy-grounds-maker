import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Download } from 'lucide-react';

export default function PBLAdminResults() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/PBL/admin/login');
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchSessions();
  }, [isAdmin]);

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('pbl_sessions')
      .select('*, pbl_activities(title, mcer_level)')
      .order('started_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  const exportCSV = () => {
    const sorted = [...sessions].sort((a, b) => {
      const actA = (a as any).pbl_activities?.title || '';
      const actB = (b as any).pbl_activities?.title || '';
      if (actA !== actB) return actA.localeCompare(actB);
      return a.student_name.localeCompare(b.student_name);
    });

    const headers = ['Activity', 'Level', 'Student Name', 'Student ID', 'Score', 'Status', 'Date'];
    const rows = sorted.map((s) => [
      `"${((s as any).pbl_activities?.title || '').replace(/"/g, '""')}"`,
      (s as any).pbl_activities?.mcer_level || '',
      `"${s.student_name.replace(/"/g, '""')}"`,
      `"${s.student_id.replace(/"/g, '""')}"`,
      s.score ?? '',
      s.is_completed ? 'Completed' : 'In Progress',
      new Date(s.started_at).toLocaleDateString(),
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pbl_results_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/PBL/admin')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">PBL Results</h1>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-3">
          {sessions.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No results yet.</p>
          )}
          {sessions.map((s) => (
            <Card key={s.id} className="glass-card">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-semibold">{s.student_name}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {s.student_id} • {(s as any).pbl_activities?.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.started_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.score !== null && (
                    <span className="text-xl font-bold text-primary">{s.score}%</span>
                  )}
                  <Badge variant={s.is_completed ? 'default' : 'secondary'}>
                    {s.is_completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
