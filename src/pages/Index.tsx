import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Shield, Sparkles, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="container mx-auto px-4 py-20 text-center max-w-3xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
          EnglishTest Pro
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          AI-powered English assessment platform. Create standardized tests similar to Saber Pro, share with students, and track results — all in one place.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate('/LantestAI/admin/login')}>
            <Shield className="w-4 h-4 mr-2" /> Admin Panel
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-20 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: 'AI Generation', desc: 'Generate questions automatically with AI — multiple choice, fill in the blank, and listening.' },
            { icon: AlertTriangle, title: 'Anti-Cheat', desc: 'Fullscreen mode, tab detection, and automatic quiz closure for academic integrity.' },
            { icon: BarChart3, title: 'Analytics', desc: 'View student results, export to CSV, and track performance over time.' },
          ].map((f, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="py-6 text-center space-y-3">
                <f.icon className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-heading font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
