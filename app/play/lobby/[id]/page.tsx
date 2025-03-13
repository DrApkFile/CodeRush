'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Timer } from "lucide-react";

type GameState = {
  status: 'waiting' | 'active' | 'cancelled';
  players: number;
  currentPlayers: number;
  timeLimit: number;
  language: string;
  difficulty: string;
  topic?: string;
};

export default function LobbyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`/api/games/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game data');
        }
        const data = await response.json();
        setGameState(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();

    // Set up polling for game state updates
    const pollInterval = setInterval(fetchGameData, 5000);

    return () => clearInterval(pollInterval);
  }, [params.id]);

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/games/${params.id}/cancel`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to cancel game');
      }
      router.push('/play');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel game');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-4 text-lg">Loading game lobby...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-lg text-red-500">{error}</p>
            <Button
              onClick={() => router.push('/play')}
              className="mt-4"
            >
              Back to Play
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameState) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Waiting for Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center items-center space-x-4">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold">
                {gameState.currentPlayers}/{gameState.players} Players
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Timer className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Time Limit</p>
                <p className="text-lg font-semibold">{gameState.timeLimit} minutes</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <Badge variant="outline" className="text-lg">
                  {gameState.language}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">Language</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <Badge variant="outline" className="text-lg">
                  {gameState.difficulty}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">Difficulty</p>
              </div>
            </div>

            {gameState.topic && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Topic</p>
                <p className="text-lg font-semibold">{gameState.topic}</p>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="destructive"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 