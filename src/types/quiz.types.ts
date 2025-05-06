/**
 * Quiz Types
 */

export interface QuizQuestion {
  _id: string;
  text: string;
  question: string;
  imageUrl?: string;
  image?: string;
  options: string[] | Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswerIndex?: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
  createdBy?: string;
  isPublic?: boolean;
  timePerQuestion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizFormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: QuizQuestion[];
  isPublic: boolean;
} 