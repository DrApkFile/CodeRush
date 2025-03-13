'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Share2, Users, Shuffle, User } from "lucide-react";

const LANGUAGES = [
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

const TIME_OPTIONS = [
  { value: '3', label: '3 minutes' },
  { value: '5', label: '5 minutes' },
  { value: '10', label: '10 minutes' },
  { value: '15', label: '15 minutes' }
];

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
];

type GameMode = 'friend' | 'random' | 'custom' | 'solo';

export default function PlayPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [formData, setFormData] = useState({
    time: '',
    language: '',
    topic: '',
    difficulty: '',
    isRated: true,
    handicap: false,
    specificUsers: '',
    players: 2
  });

  const handleStartGame = async () => {
    try {
      let gameId = '';
      let gameUrl = '';

      switch (selectedMode) {
        case 'friend':
          // Create a new game with a shareable link
          const friendResponse = await fetch('/api/games/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              mode: 'friend',
              status: 'waiting'
            })
          });
          const friendData = await friendResponse.json();
          gameId = friendData.gameId;
          gameUrl = `${window.location.origin}/play/game/${gameId}`;
          break;

        case 'random':
          // Create a game and join the waiting lobby
          const randomResponse = await fetch('/api/games/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              mode: 'random',
              status: 'waiting'
            })
          });
          const randomData = await randomResponse.json();
          router.push(`/play/lobby/${randomData.gameId}`);
          break;

        case 'custom':
          // Create a custom game with optional settings
          const customResponse = await fetch('/api/games/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              mode: 'custom',
              status: 'waiting'
            })
          });
          const customData = await customResponse.json();
          gameId = customData.gameId;
          gameUrl = `${window.location.origin}/play/game/${gameId}`;
          break;

        case 'solo':
          // Start a solo game immediately
          const soloResponse = await fetch('/api/games/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              mode: 'solo',
              status: 'active'
            })
          });
          const soloData = await soloResponse.json();
          router.push(`/play/game/${soloData.gameId}`);
          break;
      }

      // If we have a shareable link, show it in a dialog
      if (gameUrl) {
        // TODO: Implement share dialog
        console.log('Share URL:', gameUrl);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      // TODO: Show error toast
    }
  };

  const renderGameForm = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Time Limit</Label>
            <Select
              value={formData.time}
              onValueChange={(value) => setFormData({ ...formData, time: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
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
            <Label>Topic (Optional)</Label>
            <Input
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Arrays, Functions, OOP"
            />
          </div>

          <div>
            <Label>Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedMode === 'custom' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isRated}
                onCheckedChange={(checked) => setFormData({ ...formData, isRated: checked })}
              />
              <Label>Rated Game</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.handicap}
                onCheckedChange={(checked) => setFormData({ ...formData, handicap: checked })}
              />
              <Label>Handicap Mode</Label>
            </div>

            <div>
              <Label>Specific Users (Optional)</Label>
              <Input
                value={formData.specificUsers}
                onChange={(e) => setFormData({ ...formData, specificUsers: e.target.value })}
                placeholder="Enter usernames separated by commas"
              />
            </div>
          </div>
        )}

        {selectedMode === 'friend' && (
          <div>
            <Label>Number of Players</Label>
            <Select
              value={formData.players.toString()}
              onValueChange={(value) => setFormData({ ...formData, players: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of players" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Players
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={handleStartGame}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Start Game
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Play Code Rush</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card
          className={`cursor-pointer transition-all ${
            selectedMode === 'friend' ? 'border-primary shadow-lg' : ''
          }`}
          onClick={() => setSelectedMode('friend')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Share2 className="w-6 h-6 text-primary" />
              <CardTitle>Play with a Friend</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create a shareable link and challenge your friends to a rated match.
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedMode === 'random' ? 'border-primary shadow-lg' : ''
          }`}
          onClick={() => setSelectedMode('random')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shuffle className="w-6 h-6 text-primary" />
              <CardTitle>Random Challenge</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Match with random players in a rated game.
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedMode === 'custom' ? 'border-primary shadow-lg' : ''
          }`}
          onClick={() => setSelectedMode('custom')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-primary" />
              <CardTitle>Custom Match</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create a custom game with specific settings and players.
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedMode === 'solo' ? 'border-primary shadow-lg' : ''
          }`}
          onClick={() => setSelectedMode('solo')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-primary" />
              <CardTitle>Play Solo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Practice on your own with time-based challenges.
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedMode && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {renderGameForm()}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 