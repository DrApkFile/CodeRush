import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/config';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gameRef = doc(db, 'games', params.id);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const gameData = gameDoc.data();

    // If game is in waiting state and it's a random match, try to find an opponent
    if (gameData.status === 'waiting' && gameData.mode === 'random') {
      // TODO: Implement matchmaking logic
    }

    return NextResponse.json(gameData);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
} 