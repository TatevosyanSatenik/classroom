export enum QuestionType {
  TEXT = 'text',
  QUIZ = 'quiz',
  WORD_SELECT = 'word-select',
}

export interface QuestionParams {
  groupIds?: string;
  topicId?: string;
}

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  answers?: Answer[];
  groupIds: string[];
  topicIds: string[];
  correctAnswerId?: string;
  points: number;
}

export interface Answer {
  id: string;
  content: string;
  isCorrect?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Year {
  id: string;
  name: string;
  groups: Group[];
}

export interface Group {
  id: string;
  name: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: {
    type: QuestionType;
    answerId?: string;
    text?: string;
    isCorrect?: boolean;
    tabChanged?: boolean;
  };
  email: string;
  timestamp: number;
  score?: number;
  totalScore?: number;
  status?: 'correct' | 'incorrect' | 'invalid';
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'professor';
} 