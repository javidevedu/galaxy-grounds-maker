import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ENGLISH_TOPICS } from '@/constants/englishTopics';
import { Headphones, Loader2, Play, Square, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface Part {
  text: string;
  role: string;
}

interface Paragraph {
  english: string;
  spanish: string;
  parts?: Part[];
}

const ROLE_STYLES: Record<string, { color: string; label: string }> = {
  subject: { color: 'text-gram-subject', label: 'Sujeto' },
  auxiliary: { color: 'text-gram-auxiliary', label: 'Auxiliar' },
  verb: { color: 'text-gram-verb', label: 'Verbo' },
  object: { color: 'text-gram-object', label: 'Complemento' },
  adverbial: { color: 'text-gram-adverbial', label: 'Adverbial' },
  other: { color: 'text-gram-other', label: 'Otros' },
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default function FullDictationAI() {
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [level, setLevel] = useState('A2');
  const [count, setCount] = useState('1');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [rate, setRate] = useState(0.8);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const pick = () => {
      const voices = window.speechSynthesis?.getVoices() ?? [];
      voiceRef.current = voices.find((v) => v.lang.startsWith('en-US')) ?? voices.find((v) => v.lang.startsWith('en')) ?? null;
    };
    pick();
    window.speechSynthesis?.addEventListener('voiceschanged', pick);
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', pick);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const finalTopic = useMemo(() => (topic === '__custom__' ? customTopic : topic), [topic, customTopic]);

  const generate = async () => {
    if (!finalTopic.trim()) {
      toast.error('Escoge o escribe un tema primero');
      return;
    }
    setLoading(true);
    setRevealed(false);
    setParagraphs([]);
    try {
      const { data, error } = await supabase.functions.invoke('generate-dictation', {
        body: { topic: finalTopic, level, count: Number(count), context },
      });
      if (error) throw error;
      if (!data?.paragraphs?.length) throw new Error('No se generaron párrafos');
      setParagraphs(data.paragraphs);
      toast.success('Dictado generado');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo generar el dictado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string, index: number) => {
    if (!window.speechSynthesis) {
      toast.error('Tu navegador no soporta la lectura de voz');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = rate;
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.onend = () => setSpeakingIndex(null);
    utter.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utter);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Inicio
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <Headphones className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold">FullDictationAI</h1>
              <p className="text-muted-foreground text-sm">
                Crea dictados en inglés con IA. Sin registro, sin inicio de sesión.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurar dictado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 relative" ref={topicBoxRef}>
                <Label>Tema principal</Label>
                <Input
                  value={topicQuery}
                  onChange={(e) => {
                    setTopicQuery(e.target.value);
                    setTopic(e.target.value);
                    setTopicOpen(true);
                  }}
                  onFocus={() => setTopicOpen(true)}
                  placeholder="Escribe iniciales del tema (ej. pres, voc...)"
                  maxLength={200}
                />
                {topicOpen && filteredTopics.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 w-full max-h-56 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                    {filteredTopics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setTopic(t);
                          setTopicQuery(t);
                          setTopicOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Puedes escoger de la lista o escribir tu propio tema.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Nivel de los estudiantes</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cantidad de párrafos (máx. 3)</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['1', '2', '3'].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Velocidad de lectura: {rate.toFixed(1)}x</Label>
                <Slider value={[rate]} min={0.5} max={1.2} step={0.1} onValueChange={(v) => setRate(v[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contexto adicional (opcional)</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ej: situación en un aeropuerto, vocabulario de viajes..."
                maxLength={500}
              />
            </div>

            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando...</> : 'Generar dictado'}
            </Button>
          </CardContent>
        </Card>

        {paragraphs.length > 0 && (
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Párrafo {i + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={() => speak(p.english, i)} variant="default">
                      <Play className="w-4 h-4 mr-2" />
                      {speakingIndex === i ? 'Reproduciendo...' : 'Reproducir'}
                    </Button>
                    <Button onClick={stop} variant="outline">
                      <Square className="w-4 h-4 mr-2" /> Detener
                    </Button>
                  </div>

                  {revealed ? (
                    <div className="space-y-3 rounded-lg border p-4 bg-muted/40">
                      {p.parts?.length ? (
                        <p className="leading-relaxed">
                          {p.parts.map((part, k) => (
                            <span
                              key={k}
                              className={`${(ROLE_STYLES[part.role] ?? ROLE_STYLES.other).color} font-medium`}
                            >
                              {part.text}{k < p.parts!.length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </p>
                      ) : (
                        <p className="leading-relaxed">{p.english}</p>
                      )}
                      <p className="text-sm text-muted-foreground italic leading-relaxed">{p.spanish}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Texto oculto. Reprodúcelo las veces que quieras y revélalo cuando termine el dictado.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button variant="secondary" className="w-full" onClick={() => setRevealed((r) => !r)}>
              {revealed
                ? <><EyeOff className="w-4 h-4 mr-2" /> Ocultar texto y traducción</>
                : <><Eye className="w-4 h-4 mr-2" /> Revelar texto y traducción</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
