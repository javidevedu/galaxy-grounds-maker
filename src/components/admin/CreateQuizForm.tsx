import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2 } from 'lucide-react';
import TopicSelector from './TopicSelector';
import { TARGET_AUDIENCES, SKILLS } from '@/constants/englishTopics';

interface CreateQuizFormProps {
  onSubmit: (form: {
    title: string;
    target_audience: string;
    mcer_level: string;
    topics: string;
    skills: string[];
    time_limit_minutes: number;
    num_questions: number;
    audio_speed: number;
    writing_word_limit: number;
  }) => Promise<void>;
  creating: boolean;
}

export default function CreateQuizForm({ onSubmit, creating }: CreateQuizFormProps) {
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [mcerLevel, setMcerLevel] = useState('A2');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['reading', 'writing', 'listening', 'speaking']);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [numQuestions, setNumQuestions] = useState(14);
  const [audioSpeed, setAudioSpeed] = useState(0.9);
  const [writingWordLimit, setWritingWordLimit] = useState(100);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    await onSubmit({
      title,
      target_audience: targetAudience,
      mcer_level: mcerLevel,
      topics: selectedTopics.join(', '),
      skills: selectedSkills,
      time_limit_minutes: timeLimit,
      num_questions: numQuestions,
      audio_speed: audioSpeed,
      writing_word_limit: writingWordLimit,
    });
    setTitle('');
    setTargetAudience('');
    setMcerLevel('A2');
    setSelectedSkills(['reading', 'writing', 'listening', 'speaking']);
    setSelectedTopics([]);
    setTimeLimit(60);
    setNumQuestions(14);
    setAudioSpeed(0.9);
    setWritingWordLimit(100);
  };

  return (
    <Card className="mb-6 glass-card">
      <CardHeader>
        <CardTitle>Create New Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Saber Pro English Test - Level B1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_AUDIENCES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        </div>

        <div className="space-y-3">
          <Label>Skills to Evaluate</Label>
          <div className="grid grid-cols-2 gap-3">
            {SKILLS.map((skill) => (
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
                <div>
                  <div className="font-medium text-sm">{skill.label}</div>
                  <div className="text-xs text-muted-foreground">{skill.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Topics</Label>
          <TopicSelector selected={selectedTopics} onChange={setSelectedTopics} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Number of Questions ({numQuestions})</Label>
            <input
              type="range"
              min={10}
              max={20}
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>20</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time Limit (minutes)</Label>
            <Input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
            />
          </div>
        </div>

        {selectedSkills.includes('listening') && (
          <div className="space-y-2">
            <Label>Audio Speed for Listening ({audioSpeed}x)</Label>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={audioSpeed}
              onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Fast)</span>
            </div>
          </div>
        )}

        {selectedSkills.includes('writing') && (
          <div className="space-y-2">
            <Label>Writing Word Limit ({writingWordLimit} words)</Label>
            <input
              type="range"
              min={50}
              max={300}
              step={10}
              value={writingWordLimit}
              onChange={(e) => setWritingWordLimit(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50</span>
              <span>150</span>
              <span>300</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={creating || !title || !targetAudience || selectedSkills.length === 0 || selectedTopics.length === 0}
        >
          {creating ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          Create Quiz
        </Button>
      </CardContent>
    </Card>
  );
}
