import { NextResponse } from 'next/server';
import { getQuestion, submitQuestion } from '@/src/lib/firebase/questions';
import { Question } from '@/src/types/questions';

function validateAnswer(question: Question, answer: any): { isCorrect: boolean; points: number } {
  switch (question.format) {
    case 'DragAndDrop':
      const isOrderCorrect = JSON.stringify(answer) === JSON.stringify(question.correctOrder);
      return {
        isCorrect: isOrderCorrect,
        points: isOrderCorrect ? question.points : 0
      };

    case 'FixTheCode':
      const isCodeFixed = answer.trim() === question.correctCode.trim();
      return {
        isCorrect: isCodeFixed,
        points: isCodeFixed ? question.points : 0
      };

    case 'MultipleChoice':
      const isChoiceCorrect = answer === question.correctAnswer;
      return {
        isCorrect: isChoiceCorrect,
        points: isChoiceCorrect ? question.points : 0
      };

    case 'Subobjective':
      const allBlanksCorrect = question.blanks.every((blank, index) => 
        answer[index]?.trim().toLowerCase() === blank.correctAnswer.trim().toLowerCase()
      );
      return {
        isCorrect: allBlanksCorrect,
        points: allBlanksCorrect ? question.points : 0
      };

    case 'AccomplishTask':
      // For AccomplishTask, we assume the answer has been validated by running test cases
      // This would typically be handled by a separate code execution service
      return {
        isCorrect: answer.allTestsPassed,
        points: answer.allTestsPassed ? question.points : 0
      };

    default:
      throw new Error('Invalid question format');
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, answer, timeTaken } = await request.json();
    
    // Get the question
    const question = await getQuestion(params.id);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Validate the answer
    const { isCorrect, points } = validateAnswer(question, answer);

    // Submit the result
    const submissionId = await submitQuestion({
      userId,
      questionId: params.id,
      isCorrect,
      timeTaken,
      points,
      answer
    });

    return NextResponse.json({
      submissionId,
      isCorrect,
      points,
      timeTaken
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
} 