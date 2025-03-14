'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { getQuestions } from '@/src/lib/firebase/questions';
import { Question, Language, Difficulty, QuestionFormat } from '@/src/types/questions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Timer, Trophy, XCircle } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
import { Game, GameConfig } from '@/src/types/game';

interface GameState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  timeLeft: number;
  isGameOver: boolean;
  showResults: boolean;
}

export default function SoloPlay({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    timeLeft: 180, // 3 minutes default
    isGameOver: false,
    showResults: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchGameAndQuestions = async () => {
      try {
        // Fetch game configuration
        const gameRef = doc(db, 'games', params.id);
        const gameSnap = await getDoc(gameRef);
        
        if (!gameSnap.exists()) {
          setError('Game not found');
          setLoading(false);
          return;
        }

        const game = gameSnap.data() as Game;
        setGameConfig(game.config);

        // Fetch questions based on game configuration
        const questions = await getQuestions({
          language: game.config.language,
          difficulty: game.config.difficulty,
          limit: 10,
        });

        if (questions.length === 0) {
          setError('No questions available yet. Please try again later.');
          setLoading(false);
          return;
        }

        setGameState(prev => ({
          ...prev,
          questions,
          timeLeft: game.config.duration,
          loading: false,
        }));
      } catch (err) {
        console.error('Error fetching game:', err);
        setError('Failed to load game. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGameAndQuestions();
  }, [user, router, params.id]);

  useEffect(() => {
    if (gameState.isGameOver || gameState.showResults) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          return { ...prev, timeLeft: 0, isGameOver: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameOver, gameState.showResults]);

  const handleAnswer = () => {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    let isCorrect = false;

    switch (currentQuestion.format) {
      case 'MultipleChoice':
        isCorrect = answer === currentQuestion.options[currentQuestion.correctAnswer];
        break;
      case 'DragAndDrop':
        isCorrect = JSON.stringify(code.split('\n').sort()) === JSON.stringify(currentQuestion.correctOrder);
        break;
      case 'FixTheCode':
        isCorrect = code === currentQuestion.correctCode;
        break;
      case 'Subobjective':
        isCorrect = JSON.stringify(code.split('\n').sort()) === JSON.stringify(currentQuestion.answers.sort());
        break;
      case 'AccomplishTask':
        // For now, just check if the code matches the solution
        isCorrect = code === currentQuestion.solution;
        break;
    }

    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + currentQuestion.points,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
      setAnswer('');
      setCode('');
    } else {
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
      }));
    }
  };

  const handleNextQuestion = () => {
    if (gameState.currentQuestionIndex >= gameState.questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        showResults: true,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
      setAnswer('');
      setCode('');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (gameState.showResults) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-bold">{gameState.score} points</p>
              <p className="text-gray-500">
                You completed {gameState.currentQuestionIndex} questions
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push('/dashboard/play')}
            >
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <span className="text-xl font-bold">{formatTime(gameState.timeLeft)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-xl font-bold">{gameState.score}</span>
        </div>
      </div>

      <Progress
        value={(gameState.currentQuestionIndex / gameState.questions.length) * 100}
        className="mb-4"
      />

      <Card>
        <CardHeader>
          <CardTitle>Question {gameState.currentQuestionIndex + 1} of {gameState.questions.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{currentQuestion.description}</p>

          {currentQuestion.format === 'MultipleChoice' && (
            <RadioGroup
              value={answer}
              onValueChange={setAnswer}
              className="space-y-2"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {(currentQuestion.format === 'DragAndDrop' || 
            currentQuestion.format === 'FixTheCode' || 
            currentQuestion.format === 'Subobjective' || 
            currentQuestion.format === 'AccomplishTask') && (
            <div className="space-y-2">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                className="font-mono min-h-[200px]"
              />
              {currentQuestion.format === 'FixTheCode' && (
                <div className="bg-gray-100 p-4 rounded-md">
                  <pre className="font-mono text-sm">{currentQuestion.code}</pre>
                </div>
              )}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleAnswer}
            disabled={
              (currentQuestion.format === 'MultipleChoice' && !answer) ||
              ((currentQuestion.format === 'DragAndDrop' || 
                currentQuestion.format === 'FixTheCode' || 
                currentQuestion.format === 'Subobjective' || 
                currentQuestion.format === 'AccomplishTask') && !code.trim())
            }
          >
            Submit Answer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 