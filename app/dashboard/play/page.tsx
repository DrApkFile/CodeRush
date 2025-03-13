'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameConfig, GameMode } from '@/src/types/game';
import { Language } from '@/src/types/questions';
import { createGame } from '@/src/lib/firebase/games';
import {
  Users,
  Shuffle,
  Settings,
  User,
  Clock,
  Share2,
  Trophy,
} from 'lucide-react';

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

interface GameFormProps {
  mode: GameMode;
  onSubmit: (config: GameConfig) => void;
}

function GameForm({ mode, onSubmit }: GameFormProps) {
  const [language, setLanguage] = useState<Language>('JavaScript');
  const [difficulty, setDifficulty] = useState('Easy');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(mode === 'solo' ? 180 : 600); // 3 min for solo, 10 min default
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isRated, setIsRated] = useState(true);
  const [hasHandicap, setHasHandicap] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseConfig = {
      language,
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      topic: topic || undefined,
      duration,
    };

    let config: GameConfig;

    switch (mode) {
      case 'friend':
        config = {
          ...baseConfig,
          mode: 'friend',
          maxPlayers: maxPlayers as 2 | 3 | 4,
        };
        break;

      case 'random':
        config = {
          ...baseConfig,
          mode: 'random',
        };
        break;

      case 'custom':
        config = {
          ...baseConfig,
          mode: 'custom',
          isRated,
          hasHandicap,
          invitedUsers,
          maxPlayers,
        };
        break;

      case 'solo':
        config = {
          ...baseConfig,
          mode: 'solo',
          duration: duration as 180 | 300,
        };
        break;

      default:
        throw new Error('Invalid game mode');
    }

    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={(value: string) => setLanguage(value as Language)}>
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

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
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
      </div>

      <div className="space-y-2">
        <Label>Topic (Optional)</Label>
        <Input
          placeholder="e.g., Arrays, Algorithms, React Hooks"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      {mode === 'solo' ? (
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select 
            value={String(duration)} 
            onValueChange={(value: string) => setDuration(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="180">3 Minutes</SelectItem>
              <SelectItem value="300">5 Minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {mode === 'friend' && (
        <div className="space-y-2">
          <Label>Number of Players</Label>
          <Select 
            value={String(maxPlayers)} 
            onValueChange={(value: string) => setMaxPlayers(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Players</SelectItem>
              <SelectItem value="3">3 Players</SelectItem>
              <SelectItem value="4">4 Players</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === 'custom' && (
        <>
          <div className="flex items-center justify-between">
            <Label>Rated Game</Label>
            <Switch
              checked={isRated}
              onCheckedChange={setIsRated}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Handicap</Label>
            <Switch
              checked={hasHandicap}
              onCheckedChange={setHasHandicap}
            />
          </div>

          <div className="space-y-2">
            <Label>Number of Players</Label>
            <Input
              type="number"
              min={2}
              max={8}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            />
          </div>
        </>
      )}

      <Button type="submit" className="w-full">
        {mode === 'friend' && 'Create Game & Share Link'}
        {mode === 'random' && 'Find Match'}
        {mode === 'custom' && 'Create Custom Game'}
        {mode === 'solo' && 'Start Solo Practice'}
      </Button>
    </form>
  );
}

export default function Play() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<GameMode>('friend');

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleCreateGame = async (config: GameConfig) => {
    try {
      const gameId = await createGame(
        config,
        user.uid,
        user.email || 'anonymous@coderush.com',
        user.displayName || 'Anonymous'
      );

      if (config.mode === 'solo') {
        router.push(`/play/solo/${gameId}`);
      } else if (config.mode === 'random') {
        router.push(`/play/lobby/${gameId}`);
      } else {
        router.push(`/play/room/${gameId}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Play Code Rush</h1>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GameMode)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="friend">
            <Users className="mr-2 h-4 w-4" />
            Play with Friends
          </TabsTrigger>
          <TabsTrigger value="random">
            <Shuffle className="mr-2 h-4 w-4" />
            Random Challenge
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Settings className="mr-2 h-4 w-4" />
            Custom Match
          </TabsTrigger>
          <TabsTrigger value="solo">
            <User className="mr-2 h-4 w-4" />
            Play Solo
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'friend' && 'Play with Friends'}
                {activeTab === 'random' && 'Random Challenge'}
                {activeTab === 'custom' && 'Custom Match'}
                {activeTab === 'solo' && 'Solo Practice'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'friend' && 'Create a game and invite your friends to join'}
                {activeTab === 'random' && 'Join a random match with players of similar skill'}
                {activeTab === 'custom' && 'Create a custom game with specific settings'}
                {activeTab === 'solo' && 'Practice coding challenges on your own'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GameForm mode={activeTab} onSubmit={handleCreateGame} />
            </CardContent>
          </Card>

          {activeTab === 'friend' && (
            <Card>
              <CardHeader>
                <CardTitle>Game Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Shareable Link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>Rated Matches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Time-based Scoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>
    </div>
  );
} 