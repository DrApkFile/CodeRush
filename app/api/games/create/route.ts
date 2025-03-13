import { NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, time, language, topic, difficulty, isRated, handicap, specificUsers, players } = body;

    // Fetch questions based on criteria
    const questionsRef = collection(db, 'questions');
    let q = query(questionsRef);

    // Apply filters
    if (language) {
      q = query(q, where('language', '==', language));
    }
    if (difficulty) {
      q = query(q, where('difficulty', '==', difficulty));
    }
    if (topic) {
      q = query(q, where('topic', '==', topic));
    }

    // Get random questions
    q = query(q, orderBy('createdAt'), limit(20));
    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Shuffle questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    // Create game document
    const gameData = {
      id: nanoid(),
      mode,
      timeLimit: parseInt(time),
      language,
      topic,
      difficulty,
      isRated,
      handicap,
      specificUsers: specificUsers ? specificUsers.split(',').map((user: string) => user.trim()) : [],
      players,
      questions: shuffledQuestions,
      status: 'waiting',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to games collection
    const gamesRef = collection(db, 'games');
    const docRef = await addDoc(gamesRef, gameData);

    return NextResponse.json({
      gameId: docRef.id,
      ...gameData
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
} 