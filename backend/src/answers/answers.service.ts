import { Injectable } from '@nestjs/common';
import { QuestionsService } from '../questions/questions.service';

export interface QuizAnswer {
  questionId: string;
  answerId: string;
  type: 'quiz';
  tabChanged?: boolean;
}

export interface UserAnswer {
  email: string;
  groupId: string;
  classId: string;
  answer: QuizAnswer;
  isCorrect: boolean;
  timestamp: number;
}

const answers: UserAnswer[] = [];

@Injectable()
export class AnswersService {
  constructor(private readonly questionsService: QuestionsService) {}

  getAllAnswers() {
    return answers;
  }

  getAnswersByEmail(email: string) {
    return answers.filter((answer) => answer.email === email);
  }

  getAnswersByGroupId(groupId: string) {
    return answers.filter((answer) => answer.groupId === groupId);
  }

  createAnswer(answer: Omit<UserAnswer, 'timestamp' | 'isCorrect'>) {
    const question = this.questionsService.findOne(answer.answer.questionId);
    let isCorrect = false;

    if (question) {
      if (answer.answer.tabChanged) {
        isCorrect = false;
      } else {
        isCorrect = answer.answer.answerId === question.correctAnswerId;
      }
    }

    const newAnswer: UserAnswer = {
      ...answer,
      isCorrect,
      timestamp: Date.now()
    };
    
    answers.push(newAnswer);
    return newAnswer;
  }
}