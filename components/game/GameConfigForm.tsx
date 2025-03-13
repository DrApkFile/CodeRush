import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Language } from '@/src/types/questions';

const LANGUAGES: Language[] = [
  'Java',
  'Python',
  'C++',
  'C#',
  'JavaScript',
  'React',
  'Next.js',
  'TypeScript',
  'HTML',
  'CSS'
];

export interface GameConfig {
  duration: number;
  language: Language;
  topic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isRated?: boolean;
  hasHandicap?: boolean;
  players?: string[];
}

interface GameConfigFormProps {
  mode: 'friend' | 'random' | 'custom' | 'solo';
  onSubmit: (config: GameConfig) => void;
  isLoading?: boolean;
}

export function GameConfigForm({ mode, onSubmit, isLoading = false }: GameConfigFormProps) {
  const [config, setConfig] = useState<GameConfig>({
    duration: mode === 'solo' ? 3 : 10,
    language: 'JavaScript',
    difficulty: 'Medium',
    isRated: mode !== 'solo',
    hasHandicap: false,
    players: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Duration (minutes)</Label>
                {mode === 'solo' ? (
                  <Select
                    value={String(config.duration)}
                    onValueChange={(value) => setConfig({ ...config, duration: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    min={5}
                    max={60}
                    value={config.duration}
                    onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                    required
                  />
                )}
              </div>

              <div>
                <Label>Language</Label>
                <Select
                  value={config.language}
                  onValueChange={(value: Language) => setConfig({ ...config, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Topic (optional)</Label>
                <Input
                  value={config.topic || ''}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder="e.g., Arrays, Algorithms"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={config.difficulty}
                  onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => 
                    setConfig({ ...config, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === 'custom' && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Rated Game</Label>
                    <Switch
                      checked={config.isRated}
                      onCheckedChange={(checked: boolean) => setConfig({ ...config, isRated: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Enable Handicap</Label>
                    <Switch
                      checked={config.hasHandicap}
                      onCheckedChange={(checked: boolean) => setConfig({ ...config, hasHandicap: checked })}
                    />
                  </div>

                  <div>
                    <Label>Invite Players (optional)</Label>
                    <Input
                      placeholder="Enter player emails, comma-separated"
                      value={config.players?.join(', ') || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        players: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                      })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating Game...' : mode === 'solo' ? 'Start Practice' : 'Create Game'}
      </Button>
    </form>
  );
} 