export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  createdAt: Date;
  updatedAt: Date;
} 