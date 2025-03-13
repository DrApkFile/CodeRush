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
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Question, QuestionSet, QuestionSubmission, Language, Difficulty, QuestionFormat } from '@/src/types/questions';

const questionsCollection = collection(db, 'questions');
const questionSetsCollection = collection(db, 'questionSets');
const submissionsCollection = collection(db, 'submissions');

// Question CRUD operations
export async function createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = Timestamp.now();
  const docRef = await addDoc(questionsCollection, {
    ...question,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function getQuestion(id: string): Promise<Question | null> {
  const docRef = doc(questionsCollection, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Question : null;
}

export async function updateQuestion(id: string, updates: Partial<Question>) {
  const docRef = doc(questionsCollection, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteQuestion(id: string) {
  await deleteDoc(doc(questionsCollection, id));
}

// Question filtering and querying
export async function getQuestions({
  language,
  difficulty,
  format,
  limit: queryLimit = 10,
}: {
  language?: Language;
  difficulty?: Difficulty;
  format?: QuestionFormat;
  limit?: number;
}): Promise<Question[]> {
  let q = query(questionsCollection);

  if (language) {
    q = query(q, where('language', '==', language));
  }
  if (difficulty) {
    q = query(q, where('difficulty', '==', difficulty));
  }
  if (format) {
    q = query(q, where('format', '==', format));
  }

  q = query(q, orderBy('createdAt', 'desc'), limit(queryLimit));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Question);
}

// Question Set operations
export async function createQuestionSet(set: Omit<QuestionSet, 'id'>) {
  const docRef = await addDoc(questionSetsCollection, set);
  return docRef.id;
}

export async function getQuestionSet(id: string): Promise<QuestionSet | null> {
  const docRef = doc(questionSetsCollection, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as QuestionSet : null;
}

export async function getQuestionSets({
  language,
  difficulty,
}: {
  language?: Language;
  difficulty?: Difficulty;
}): Promise<QuestionSet[]> {
  let q = query(questionSetsCollection);

  if (language) {
    q = query(q, where('language', '==', language));
  }
  if (difficulty) {
    q = query(q, where('difficulty', '==', difficulty));
  }

  q = query(q, orderBy('order', 'asc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionSet);
}

// Submission operations
export async function submitQuestion(submission: Omit<QuestionSubmission, 'submittedAt'>) {
  const docRef = await addDoc(submissionsCollection, {
    ...submission,
    submittedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getUserSubmissions(userId: string): Promise<QuestionSubmission[]> {
  const q = query(
    submissionsCollection,
    where('userId', '==', userId),
    orderBy('submittedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as QuestionSubmission);
}

// Analytics and Progress
export async function getUserProgress(userId: string) {
  const submissions = await getUserSubmissions(userId);
  return {
    totalAttempts: submissions.length,
    correctSubmissions: submissions.filter(s => s.isCorrect).length,
    totalPoints: submissions.reduce((sum, s) => sum + (s.isCorrect ? s.points : 0), 0),
    averageTime: submissions.reduce((sum, s) => sum + s.timeTaken, 0) / submissions.length,
  };
} 