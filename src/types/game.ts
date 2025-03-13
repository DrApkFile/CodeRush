import { Language } from './questions';

export type GameMode = 'friend' | 'random' | 'custom' | 'solo';
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';
export type GameDuration = 180 | 300; // 3 or 5 minutes in seconds
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface BaseGameConfig {
  language: Language;
  topic?: string;
  duration: number; // in seconds
  difficulty: Difficulty;
}

export interface FriendGameConfig extends BaseGameConfig {
  mode: 'friend';
  maxPlayers: 2 | 3 | 4;
}

export interface RandomGameConfig extends BaseGameConfig {
  mode: 'random';
}

export interface CustomGameConfig extends BaseGameConfig {
  mode: 'custom';
  isRated: boolean;
  hasHandicap: boolean;
  invitedUsers: string[]; // user IDs
  maxPlayers: number;
}

export interface SoloGameConfig extends BaseGameConfig {
  mode: 'solo';
  duration: GameDuration;
}

export type GameConfig = 
  | FriendGameConfig 
  | RandomGameConfig 
  | CustomGameConfig 
  | SoloGameConfig;

export interface PlayerState {
  userId: string;
  displayName: string;
  photoURL?: string;
  currentScore: number;
  questionsAnswered: number;
  isReady: boolean;
  joinedAt: Date;
  handicap?: number; // percentage modifier for scoring
}

export interface Game {
  id: string;
  config: GameConfig;
  status: GameStatus;
  players: Record<string, PlayerState>;
  currentQuestionIds: string[];
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  winnerId?: string;
  shareableLink?: string;
}

export interface GameInvite {
  id: string;
  gameId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface GameResult {
  gameId: string;
  userId: string;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  ratingChange?: number;
  createdAt: Date;
} 