import { Injectable } from '@nestjs/common';

export interface QuizAnswer {
  questionId: string;
  answerId: string;
  type: 'quiz';
  isCorrect: boolean;
}

export interface TextAnswer {
  questionId: string;
  text: string;
  type: 'text';
}

export interface UserAnswer {
  email: string;
  groupId: string;
  classId: string;
  answer: QuizAnswer | TextAnswer;
  timestamp: number;
}

const answers: UserAnswer[] = [];

@Injectable()
export class AnswersService {
  constructor() {}

  getAllAnswers() {
    return answers;
  }

  getAnswersByEmail(email: string) {
    return answers.filter((answer) => answer.email === email);
  }

  getAnswersByGroupId(groupId: string) {
    return answers.filter((answer) => answer.groupId === groupId);
  }

  createAnswer(answer: Omit<UserAnswer, 'timestamp'>) {
    const newAnswer: UserAnswer = {
      ...answer,
      timestamp: Date.now()
    };
    answers.push(newAnswer);
    return newAnswer;
  }
} 