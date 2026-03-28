import { useState, useRef, useEffect } from 'react';
import { ENGLISH_TOPICS } from '@/constants/englishTopics';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';

interface TopicSelectorProps {
  selected: string[];
  onChange: (topics: string[]) => void;
}

export default function TopicSelector({ selected, onChange }: TopicSelectorProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = ENGLISH_TOPICS.filter(
    (t) =>
      !selected.includes(t) &&
      t.toLowerCase().includes(search.toLowerCase())
  );

  const addTopic = (topic: string) => {
    onChange([...selected, topic]);
    setSearch('');
  };

  const removeTopic = (topic: string) => {
    onChange(selected.filter((t) => t !== topic));
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search topics..."
          className="pl-9"
        />
      </div>

      {open && search.length > 0 && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
          {filtered.slice(0, 10).map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => addTopic(topic)}
              className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((topic) => (
            <Badge key={topic} variant="secondary" className="gap-1 pr-1">
              {topic}
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
