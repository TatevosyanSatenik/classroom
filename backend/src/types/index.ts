export enum QuestionType {
  TEXT = 'text',
  QUIZ = 'quiz',
  WORD_SELECT = 'word-select',
}

export interface Topic {
  name: string;
  description: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  answers?: Array<{
    id: string;
    content: string;
  }>;
  groupIds: string[];
  topicIds: string[];
  correctAnswerId?: string;
} 