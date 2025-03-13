export type Language =
  | 'Java'
  | 'Python'
  | 'C++'
  | 'C#'
  | 'JavaScript'
  | 'React'
  | 'Next.js'
  | 'TypeScript'
  | 'HTML'
  | 'CSS';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionFormat = 
  | 'DragAndDrop'
  | 'FixTheCode'
  | 'MultipleChoice'
  | 'Subobjective'
  | 'AccomplishTask';

// Base interface for all question types
export interface BaseQuestion {
  id: string;
  title: string;
  description: string;
  format: QuestionFormat;
  language: Language;
  difficulty: Difficulty;
  topic: string;
  points: number;
  timeLimit: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

// For "Drag and Drop" questions
export interface DragAndDropQuestion extends BaseQuestion {
  format: 'DragAndDrop';
  codeSnippets: string[];
  correctOrder: number[];
}

// For "Fix the Code" questions
export interface FixTheCodeQuestion extends BaseQuestion {
  format: 'FixTheCode';
  code: string;
  errorLine: number;
  correctCode: string;
}

// For "Multiple Choice" questions
export interface MultipleChoiceQuestion extends BaseQuestion {
  format: 'MultipleChoice';
  code: string;
  options: string[];
  correctAnswer: number;
}

// For "Subobjective" questions
export interface SubobjectiveQuestion extends BaseQuestion {
  format: 'Subobjective';
  code: string;
  blanks: string[];
  answers: string[];
}

// For "Accomplish Task" questions
export interface AccomplishTaskQuestion extends BaseQuestion {
  format: 'AccomplishTask';
  initialCode: string;
  testCases: {
    input: string;
    output: string;
  }[];
  solution: string;
}

export type Question =
  | DragAndDropQuestion
  | FixTheCodeQuestion
  | MultipleChoiceQuestion
  | SubobjectiveQuestion
  | AccomplishTaskQuestion;

// For tracking user progress and submissions
export interface QuestionSubmission {
  userId: string;
  questionId: string;
  isCorrect: boolean;
  submittedAt: Date;
  timeTaken: number; // in seconds
  points: number;
  answer: any; // Type depends on question format
}

// For organizing questions into sets/levels
export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  language: Language;
  questionIds: string[];
  requiredPoints: number;
  order: number;
} 