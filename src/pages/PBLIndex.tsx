import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Shield, Brain, Target, BookOpen, Headphones } from 'lucide-react';

export default function PBLIndex() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20 text-center max-w-3xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
          <MessageCircle className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
          PBL English
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Learn English by solving real-world problems with an AI companion. Practice reading, writing, and listening through interactive conversations.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate('/PBL/admin/login')}>
            <Shield className="w-4 h-4 mr-2" /> Admin Panel
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'AI Companion', desc: 'An intelligent AI guides you through problems, corrects your English in real-time, and adapts to your level.' },
            { icon: Target, title: 'Problem-Based', desc: 'Learn by solving contextualized problems in your area of study while practicing grammar and vocabulary.' },
            { icon: BookOpen, title: 'Full Skills', desc: 'Practice reading, writing, and listening skills integrated into natural conversations.' },
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
