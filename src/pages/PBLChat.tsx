import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function PBLChat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: sess, error } = await supabase
        .from('pbl_sessions')
        .select('*, pbl_activities(*)')
        .eq('id', sessionId)
        .single();
      if (error || !sess) {
        toast.error('Session not found.');
        return;
      }
      if (sess.is_completed) {
        navigate(`/PBL/results/${sessionId}`);
        return;
      }
      setSession(sess);
      setActivity((sess as any).pbl_activities);

      // Calculate time left
      const startedAt = new Date(sess.started_at).getTime();
      const limitMs = ((sess as any).pbl_activities?.time_limit_minutes || 30) * 60 * 1000;
      const remaining = Math.max(0, Math.floor((startedAt + limitMs - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Load existing messages
      const { data: msgs } = await supabase
        .from('pbl_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (msgs && msgs.length > 0) {
        setMessages(msgs.map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
      } else {
        // Send initial greeting from AI
        await sendToAI([], sess, (sess as any).pbl_activities);
      }
      setLoading(false);
    };
    fetchSession();
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToAI = async (conversationHistory: Message[], sess?: any, act?: any) => {
    const currentSession = sess || session;
    const currentActivity = act || activity;
    setSending(true);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pbl-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            messages: conversationHistory,
            activity: {
              title: currentActivity.title,
              mcer_level: currentActivity.mcer_level,
              knowledge_area: currentActivity.knowledge_area,
              grammar_topics: currentActivity.grammar_topics,
              skills: currentActivity.skills,
            },
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast.error('Too many requests. Please wait a moment.');
        } else if (resp.status === 402) {
          toast.error('Service temporarily unavailable.');
        } else {
          toast.error('Failed to get response from AI.');
        }
        setSending(false);
        return;
      }

      // Stream response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message to DB
      if (assistantContent) {
        await supabase.from('pbl_messages').insert({
          session_id: sessionId!,
          role: 'assistant',
          content: assistantContent,
        });
      }
    } catch (e) {
      console.error('Chat error:', e);
      toast.error('Connection error. Please try again.');
    }
    setSending(false);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    // Save user message
    await supabase.from('pbl_messages').insert({
      session_id: sessionId!,
      role: 'user',
      content: userMessage.content,
    });

    await sendToAI(newMessages);
    inputRef.current?.focus();
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      // Call evaluation edge function
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pbl-evaluate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            messages: messages,
            activity: {
              title: activity?.title,
              mcer_level: activity?.mcer_level,
              knowledge_area: activity?.knowledge_area,
              grammar_topics: activity?.grammar_topics,
              skills: activity?.skills,
            },
          }),
        }
      );

      if (resp.ok) {
        const result = await resp.json();
        await supabase
          .from('pbl_sessions')
          .update({
            is_completed: true,
            finished_at: new Date().toISOString(),
            score: result.score,
            detailed_feedback: result.feedback,
          })
          .eq('id', sessionId!);
      } else {
        await supabase
          .from('pbl_sessions')
          .update({
            is_completed: true,
            finished_at: new Date().toISOString(),
          })
          .eq('id', sessionId!);
      }
    } catch (e) {
      console.error('Evaluation error:', e);
      await supabase
        .from('pbl_sessions')
        .update({
          is_completed: true,
          finished_at: new Date().toISOString(),
        })
        .eq('id', sessionId!);
    }
    navigate(`/PBL/results/${sessionId}`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">AI</span>
          </div>
          <div>
            <h2 className="font-semibold text-sm">{activity?.title}</h2>
            <p className="text-xs text-muted-foreground">{session?.student_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1 text-sm font-mono ${timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleFinish} disabled={finishing}>
            {finishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
            Finish
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {sending && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-card">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message in English..."
            disabled={sending || finishing}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || sending || finishing} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
