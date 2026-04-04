import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface Props {
  onSubmit: (form: {
    title: string;
    mcer_level: string;
    knowledge_area: string;
    grammar_topics: string;
    skills: string[];
    time_limit_minutes: number;
  }) => void;
  creating: boolean;
}

const SKILLS = [
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'listening', label: 'Listening' },
];

export default function PBLCreateForm({ onSubmit, creating }: Props) {
  const [title, setTitle] = useState('');
  const [mcerLevel, setMcerLevel] = useState('A2');
  const [knowledgeArea, setKnowledgeArea] = useState('');
  const [grammarTopics, setGrammarTopics] = useState('');
  const [skills, setSkills] = useState<string[]>(['reading', 'writing', 'listening']);
  const [timeLimit, setTimeLimit] = useState(30);

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      mcer_level: mcerLevel,
      knowledge_area: knowledgeArea,
      grammar_topics: grammarTopics,
      skills,
      time_limit_minutes: timeLimit,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-heading">Create New Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Business Meeting Scenario" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CEFR Level</Label>
              <Select value={mcerLevel} onValueChange={setMcerLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Limit (minutes)</Label>
              <Input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} min={5} max={120} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Knowledge Area</Label>
            <Input value={knowledgeArea} onChange={e => setKnowledgeArea(e.target.value)} placeholder="Business, Technology, Health..." required />
          </div>

          <div className="space-y-2">
            <Label>Grammar Topics</Label>
            <Input value={grammarTopics} onChange={e => setGrammarTopics(e.target.value)} placeholder="Present Perfect, Conditionals..." required />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-4">
              {SKILLS.map(skill => (
                <div key={skill.id} className="flex items-center gap-2">
                  <Checkbox
                    id={skill.id}
                    checked={skills.includes(skill.id)}
                    onCheckedChange={() => toggleSkill(skill.id)}
                  />
                  <Label htmlFor={skill.id} className="font-normal">{skill.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={creating}>
            {creating && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
            Create Activity
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
