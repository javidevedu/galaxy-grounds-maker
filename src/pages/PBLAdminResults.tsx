import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Loader2, MessageSquare, Download } from 'lucide-react';

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

  const getActivityTitle = (id: string) => activities.find(a => a.id === id)?.title || 'Unknown';

  const exportCSV = () => {
    const headers = ['Student Name', 'Student ID', 'Activity', 'Score', 'Completed', 'Date'];
    const rows = sessions.map(s => [
      s.student_name,
      s.student_id,
      getActivityTitle(s.activity_id),
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

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_name}</TableCell>
                    <TableCell>{s.student_id}</TableCell>
                    <TableCell>{getActivityTitle(s.activity_id)}</TableCell>
                    <TableCell>
                      {s.score != null ? (
                        <Badge variant={s.score >= 70 ? 'default' : 'destructive'}>{s.score}%</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.is_completed ? 'default' : 'secondary'}>
                        {s.is_completed ? 'Completed' : 'In Progress'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.started_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No results yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
