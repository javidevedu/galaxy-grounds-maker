import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Clock, Volume2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { Tables } from '@/integrations/supabase/types';

type Msg = { role: 'user' | 'assistant'; content: string };

/** Estimate reading time (words) + thinking/response time */
const estimateInteractionTime = (text: string): { readSec: number; responseSec: number; totalSec: number } => {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // ~150 WPM for ESL readers
  const readSec = Math.max(10, Math.ceil((wordCount / 150) * 60));
  // Response time: base 20s + 5s per 20 words of prompt (longer prompts need more thought)
  const responseSec = Math.max(15, 20 + Math.ceil((wordCount / 20) * 5));
  return { readSec, responseSec, totalSec: readSec + responseSec };
};

export default function PBLChat() {
  const { activityId, sessionId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [studentName, setStudentName] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [finished, setFinished] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<{ readSec: number; responseSec: number; totalSec: number } | null>(null);
  const [interactionTimer, setInteractionTimer] = useState<number | null>(null);
  const interactionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initCalledRef = useRef(false);
  const streamingIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start interaction timer when a new assistant message finishes streaming
  useEffect(() => {
    if (sending || finished || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;

    const est = estimateInteractionTime(lastMsg.content);
    setEstimatedTime(est);
    setInteractionTimer(est.totalSec);

    if (interactionTimerRef.current) clearInterval(interactionTimerRef.current);
    interactionTimerRef.current = setInterval(() => {
      setInteractionTimer(prev => {
        if (prev === null || prev <= 1) {
          if (interactionTimerRef.current) clearInterval(interactionTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (interactionTimerRef.current) clearInterval(interactionTimerRef.current);
    };
  }, [messages, sending, finished]);

  useEffect(() => {
    if (!startTime || !activity || finished) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const total = activity.time_limit_minutes * 60;
      const remaining = total - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        handleFinish();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, activity, finished]);

  const fetchData = async () => {
    const [actRes, sessRes, msgRes] = await Promise.all([
      supabase.from('pbl_activities').select('*').eq('id', activityId!).single(),
      supabase.from('pbl_sessions').select('*').eq('id', sessionId!).single(),
      supabase.from('pbl_messages').select('*').eq('session_id', sessionId!).order('created_at'),
    ]);

    if (!actRes.data || !sessRes.data) {
      toast.error('Session not found');
      return;
    }

    const activityData = { ...actRes.data, student_name: sessRes.data.student_name };
    setActivity(activityData);
    setStudentName(sessRes.data.student_name);
    setStartTime(new Date(sessRes.data.started_at));

    if (sessRes.data.is_completed) {
      setFinished(true);
      navigate(`/pbl/activity/${activityId}/results/${sessionId}`);
      return;
    }

    if (msgRes.data?.length) {
      setMessages(msgRes.data.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    } else {
      // Start conversation with AI - pass activity directly since state may not be set yet
      await sendToAI(null, [], activityData);
    }
    setLoading(false);
  };

  const sendToAI = async (message: string | null, history: Msg[], activityOverride?: any) => {
    setSending(true);
    const activityToSend = activityOverride || activity;
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pbl-chat`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          message,
          activity: activityToSend,
          history,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast.error(err.error || 'Error communicating with AI');
        setSending(false);
        return;
      }

      // Stream response
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      let addedMessage = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

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
              if (!addedMessage) {
                addedMessage = true;
                setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
              } else {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              }
            }
          } catch { /* partial JSON */ }
        }
      }

      if (!assistantContent && textBuffer.trim()) {
        try {
          const data = JSON.parse(textBuffer);
          if (data.choices?.[0]?.message?.content) {
            assistantContent = data.choices[0].message.content;
            setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
          }
        } catch { /* ignore */ }
      }
    } catch (e) {
      console.error(e);
      toast.error('Connection error');
    }
    setSending(false);
  };

  const handleSend = async () => {
    if (!input.trim() || sending || finished) return;
    // Clear interaction timer on send
    if (interactionTimerRef.current) clearInterval(interactionTimerRef.current);
    setInteractionTimer(null);
    setEstimatedTime(null);
    const userMsg = input.trim();
    setInput('');
    const newMessages: Msg[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    await sendToAI(userMsg, messages);
  };

  const handleFinish = async () => {
    if (evaluating || finished) return;
    setEvaluating(true);
    setFinished(true);

    try {
      const { data, error } = await supabase.functions.invoke('pbl-chat', {
        body: { session_id: sessionId, activity, action: 'evaluate' },
      });
      if (error) throw error;
      navigate(`/pbl/activity/${activityId}/results/${sessionId}`);
    } catch (e) {
      console.error(e);
      toast.error('Error generating evaluation');
      setFinished(false);
      setEvaluating(false);
    }
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    const voices = speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  };

  const renderMessageContent = (content: string) => {
    // Handle [AUDIO]...[/AUDIO] tags
    const parts = content.split(/\[AUDIO\]([\s\S]*?)\[\/AUDIO\]/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        // This is audio content
        return (
          <div key={i} className="my-2 p-3 bg-accent/20 rounded-lg border border-accent/30">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">🎧 Listening Activity</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => speakText(part.trim())} className="mt-1">
              <Volume2 className="w-3 h-3 mr-1" /> Play Audio
            </Button>
          </div>
        );
      }
      return <div key={i} className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{part}</ReactMarkdown></div>;
    });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (evaluating) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-primary" />
      <p className="text-muted-foreground font-medium">Evaluating your performance...</p>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-lg">{activity?.title}</h1>
            <Badge variant="outline">{activity?.mcer_level}</Badge>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="flex items-center gap-1 text-sm">
                <Clock className="w-3 h-3" /> {formatTime(timeLeft)}
              </Badge>
            )}
            <Button size="sm" variant="destructive" onClick={handleFinish} disabled={evaluating}>
              Finish Activity
            </Button>
          </div>
        </div>
        {/* Estimated interaction time bar */}
        {estimatedTime && interactionTimer !== null && !sending && !finished && (
          <div className="flex items-center gap-2 mt-2 px-1 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              Estimated time to read & respond: <strong className={interactionTimer < 10 ? 'text-destructive' : 'text-foreground'}>{formatTime(interactionTimer)}</strong>
              <span className="ml-2 opacity-60">(~{estimatedTime.readSec}s read + ~{estimatedTime.responseSec}s respond)</span>
            </span>
          </div>
        )}
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-card border border-border rounded-bl-md'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-accent">Alex 🤖</span>
                  {renderMessageContent(msg.content)}
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {sending && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {!finished && (
        <div className="border-t bg-card/80 backdrop-blur-sm px-4 py-3 shrink-0">
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your response..."
              disabled={sending}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={sending || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
