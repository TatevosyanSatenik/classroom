export interface Answer {
  id: string;
  content: string;
}

export interface Question {
  id: string;
  content: string;
  type: 'quiz';
  answers: Answer[];
  correctAnswerId: string;
  groupIds: string[];
  topicIds: string[];
} 