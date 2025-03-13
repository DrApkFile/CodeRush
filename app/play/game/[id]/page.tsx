'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, Trophy, Users } from "lucide-react";
import type {
  Question,
  MultipleChoiceQuestion,
  DragAndDropQuestion,
  FixTheCodeQuestion,
  SubobjectiveQuestion,
  AccomplishTaskQuestion
} from '@/src/types/questions';

type GameState = {
  currentQuestion: number;
  score: number;
  timeLeft: number;
  questions: Question[];
  isGameOver: boolean;
  showSummary: boolean;
};

export default function GamePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    timeLeft: 0,
    questions: [],
    isGameOver: false,
    showSummary: false,
  });

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`/api/games/${params.id}`);
        const data = await response.json();
        
        setGameState(prev => ({
          ...prev,
          timeLeft: data.timeLimit * 60, // Convert minutes to seconds
          questions: data.questions,
        }));

        // Start the timer
        const timer = setInterval(() => {
          setGameState(prev => {
            if (prev.timeLeft <= 1) {
              clearInterval(timer);
              return {
                ...prev,
                isGameOver: true,
                showSummary: true,
              };
            }
            return {
              ...prev,
              timeLeft: prev.timeLeft - 1,
            };
          });
        }, 1000);
      } catch (error) {
        console.error('Error fetching game data:', error);
        // TODO: Show error toast
      }
    };

    fetchGameData();
  }, [params.id]);

  const handleAnswer = (answer: string | number | string[]) => {
    const currentQuestion = gameState.questions[gameState.currentQuestion];
    let isCorrect = false;

    switch (currentQuestion.format) {
      case 'MultipleChoice':
        isCorrect = answer === (currentQuestion as MultipleChoiceQuestion).correctAnswer;
        break;
      case 'DragAndDrop':
        isCorrect = JSON.stringify(answer) === JSON.stringify((currentQuestion as DragAndDropQuestion).correctOrder);
        break;
      case 'FixTheCode':
        isCorrect = answer === (currentQuestion as FixTheCodeQuestion).solution;
        break;
      case 'Subobjective':
        isCorrect = JSON.stringify(answer) === JSON.stringify((currentQuestion as SubobjectiveQuestion).answers);
        break;
      case 'AccomplishTask':
        isCorrect = answer === (currentQuestion as AccomplishTaskQuestion).solution;
        break;
    }

    setGameState(prev => {
      const newScore = isCorrect ? prev.score + currentQuestion.points : prev.score;
      const nextQuestion = prev.currentQuestion + 1;

      if (nextQuestion >= prev.questions.length) {
        return {
          ...prev,
          score: newScore,
          isGameOver: true,
          showSummary: true,
        };
      }

      return {
        ...prev,
        currentQuestion: nextQuestion,
        score: newScore,
      };
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestionContent = (question: Question) => {
    switch (question.format) {
      case 'MultipleChoice':
        const mcQuestion = question as MultipleChoiceQuestion;
        return (
          <div className="space-y-2">
            {mcQuestion.options.map((option: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case 'DragAndDrop':
        const ddQuestion = question as DragAndDropQuestion;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-medium">Code Snippets</p>
                {ddQuestion.codeSnippets.map((snippet: string, index: number) => (
                  <div key={index} className="p-2 bg-muted rounded">
                    {snippet}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="font-medium">Drop Zone</p>
                {/* TODO: Implement drag and drop UI */}
              </div>
            </div>
          </div>
        );

      case 'FixTheCode':
        const ftcQuestion = question as FixTheCodeQuestion;
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded">
              <pre className="whitespace-pre-wrap">{ftcQuestion.code}</pre>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Fix the code:</p>
              <textarea
                className="w-full p-2 border rounded"
                rows={5}
                placeholder="Enter your fixed code here..."
              />
              <Button onClick={() => handleAnswer('')}>Submit</Button>
            </div>
          </div>
        );

      case 'Subobjective':
        const soQuestion = question as SubobjectiveQuestion;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              {soQuestion.blanks.map((blank: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <span>{blank}</span>
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    placeholder="Enter answer"
                  />
                </div>
              ))}
              <Button onClick={() => handleAnswer([])}>Submit</Button>
            </div>
          </div>
        );

      case 'AccomplishTask':
        const atQuestion = question as AccomplishTaskQuestion;
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded">
              <pre className="whitespace-pre-wrap">{atQuestion.code}</pre>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Complete the task:</p>
              <textarea
                className="w-full p-2 border rounded"
                rows={5}
                placeholder="Enter your solution here..."
              />
              <Button onClick={() => handleAnswer('')}>Submit</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderQuestion = () => {
    if (gameState.questions.length === 0) return null;
    
    const question = gameState.questions[gameState.currentQuestion];
    const progress = ((gameState.currentQuestion + 1) / gameState.questions.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold">{formatTime(gameState.timeLeft)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-xl font-bold">{gameState.score}</span>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle>Question {gameState.currentQuestion + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg">{question.title}</p>
              {renderQuestionContent(question)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSummary = () => {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Game Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center items-center space-x-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold">{gameState.score}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Questions Solved</p>
                <p className="text-2xl font-bold">{gameState.currentQuestion + 1}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className="text-2xl font-bold">{formatTime(gameState.timeLeft)}</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => router.push('/play')}
                variant="outline"
              >
                Play Again
              </Button>
              <Button
                onClick={() => router.push('/leaderboard')}
              >
                View Leaderboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {gameState.showSummary ? renderSummary() : renderQuestion()}
    </div>
  );
} 