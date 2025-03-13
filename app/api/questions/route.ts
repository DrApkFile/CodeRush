import { NextResponse } from 'next/server';
import { getQuestions, createQuestion } from '@/src/lib/firebase/questions';
import { Question, Language, Difficulty, QuestionFormat } from '@/src/types/questions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as Language | undefined;
    const difficulty = searchParams.get('difficulty') as Difficulty | undefined;
    const format = searchParams.get('format') as QuestionFormat | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const questions = await getQuestions({ language, difficulty, format, limit });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const question = await request.json();
    const questionId = await createQuestion(question);
    return NextResponse.json({ id: questionId }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
} 