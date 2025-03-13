import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { GameConfig } from '@/components/game/GameConfigForm';

interface Player {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  score: number;
  rating?: number;
  ratingChange?: number;
}

interface Spectator {
  id: string;
  email: string;
  displayName: string;
}

interface QuestionSubmission {
  playerId: string;
  correct: boolean;
  points: number;
  timeSpent: number;
}

interface GameQuestion {
  id: string;
  format: string;
  submissions: QuestionSubmission[];
}

export interface Game {
  id: string;
  config: GameConfig;
  status: 'waiting' | 'in_progress' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  players: Player[];
  spectators?: Spectator[];
  questions: GameQuestion[];
  shareableLink?: string;
  winner?: string;
}

export interface GameInvite {
  id: string;
  gameId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'rejected';
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

const gamesCollection = collection(db, 'games');
const invitesCollection = collection(db, 'gameInvites');
const resultsCollection = collection(db, 'gameResults');

// Game CRUD operations
export async function createGame(config: GameConfig, userId: string, userEmail: string, userDisplayName: string) {
  const gameData = {
    config,
    status: 'waiting',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    players: [{
      id: userId,
      email: userEmail,
      displayName: userDisplayName,
      score: 0,
    }],
    questions: [],
  };

  const gameRef = await addDoc(gamesCollection, gameData);
  const shareableLink = `${window.location.origin}/play/join/${gameRef.id}`;
  await updateDoc(gameRef, { shareableLink });

  return gameRef.id;
}

export async function getGame(gameId: string): Promise<Game> {
  const gameRef = doc(gamesCollection, gameId);
  const gameSnap = await getDoc(gameRef);
  
  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  return {
    id: gameSnap.id,
    ...gameSnap.data()
  } as Game;
}

export async function updateGame(id: string, updates: Partial<Game>) {
  const docRef = doc(gamesCollection, id);
  await updateDoc(docRef, updates);
}

// Player management
export async function joinGame(gameId: string, userId: string, userEmail: string, userDisplayName: string) {
  const gameRef = doc(gamesCollection, gameId);
  const gameSnap = await getDoc(gameRef);
  
  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  const game = gameSnap.data() as Game;
  
  if (game.status !== 'waiting') {
    throw new Error('Game has already started');
  }

  if (game.players.some(player => player.id === userId)) {
    return; // Player already joined
  }

  await updateDoc(gameRef, {
    players: [
      ...game.players,
      {
        id: userId,
        email: userEmail,
        displayName: userDisplayName,
        score: 0,
      }
    ],
    updatedAt: serverTimestamp(),
  });
}

export async function leaveGame(gameId: string, userId: string) {
  const gameRef = doc(gamesCollection, gameId);
  const gameSnap = await getDoc(gameRef);
  
  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  const game = gameSnap.data() as Game;
  const updatedPlayers = game.players.filter(player => player.id !== userId);

  await updateDoc(gameRef, {
    players: updatedPlayers,
    updatedAt: serverTimestamp(),
  });
}

// Game invites
export async function createGameInvite(gameId: string, inviterId: string, inviteeId: string): Promise<string> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  const invite: Omit<GameInvite, 'id'> = {
    gameId,
    inviterId,
    inviteeId,
    status: 'pending',
    createdAt: now,
    expiresAt,
  };

  const docRef = await addDoc(invitesCollection, invite);
  return docRef.id;
}

export async function updateGameInvite(id: string, status: GameInvite['status']) {
  const docRef = doc(invitesCollection, id);
  await updateDoc(docRef, { status });
}

export async function getGameInvites(userId: string): Promise<GameInvite[]> {
  const q = query(
    invitesCollection,
    where('inviteeId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as GameInvite);
}

// Game results
export async function saveGameResult(result: Omit<GameResult, 'createdAt'>) {
  const docRef = await addDoc(resultsCollection, {
    ...result,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getGameResults(gameId: string): Promise<GameResult[]> {
  const q = query(
    resultsCollection,
    where('gameId', '==', gameId),
    orderBy('score', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      gameId: data.gameId,
      userId: data.userId,
      score: data.score,
      questionsAnswered: data.questionsAnswered,
      correctAnswers: data.correctAnswers,
      ratingChange: data.ratingChange,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as GameResult;
  });
}

// Matchmaking
export async function findAvailableGame(config: Partial<GameConfig>) {
  const q = query(
    gamesCollection,
    where('status', '==', 'waiting'),
    where('config.language', '==', config.language),
    where('config.difficulty', '==', config.difficulty),
    orderBy('createdAt', 'asc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  return {
    id: querySnapshot.docs[0].id,
    ...querySnapshot.docs[0].data()
  } as Game;
}

// Game state management
export async function startGame(gameId: string) {
  const gameRef = doc(gamesCollection, gameId);
  await updateDoc(gameRef, {
    status: 'in_progress',
    updatedAt: serverTimestamp(),
  });
}

export async function endGame(gameId: string) {
  const gameRef = doc(gamesCollection, gameId);
  const gameSnap = await getDoc(gameRef);
  
  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  const game = gameSnap.data() as Game;
  const winner = game.players.reduce((prev, current) => 
    (prev.score > current.score) ? prev : current
  );

  await updateDoc(gameRef, {
    status: 'completed',
    winner: winner.id,
    updatedAt: serverTimestamp(),
  });
}

export async function updatePlayerScore(gameId: string, userId: string, score: number, questionsAnswered: number) {
  const docRef = doc(gamesCollection, gameId);
  await updateDoc(docRef, {
    [`players.${userId}.currentScore`]: score,
    [`players.${userId}.questionsAnswered`]: questionsAnswered,
  });
}

export async function submitAnswer(
  gameId: string,
  questionId: string,
  playerId: string,
  correct: boolean,
  points: number,
  timeSpent: number
) {
  const gameRef = doc(gamesCollection, gameId);
  const gameSnap = await getDoc(gameRef);
  
  if (!gameSnap.exists()) {
    throw new Error('Game not found');
  }

  const game = gameSnap.data() as Game;
  const questionIndex = game.questions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1) {
    throw new Error('Question not found');
  }

  const submission: QuestionSubmission = {
    playerId,
    correct,
    points,
    timeSpent,
  };

  const updatedQuestions = [...game.questions];
  updatedQuestions[questionIndex].submissions.push(submission);

  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex !== -1) {
    const updatedPlayers = [...game.players];
    updatedPlayers[playerIndex].score += points;
    
    await updateDoc(gameRef, {
      questions: updatedQuestions,
      players: updatedPlayers,
      updatedAt: serverTimestamp(),
    });
  }
} 