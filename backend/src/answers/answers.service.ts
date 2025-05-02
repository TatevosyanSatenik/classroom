import { Injectable } from '@nestjs/common';
import type { StudentAnswer } from '../types';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class AnswersService {
  private answers: StudentAnswer[] = [];

  constructor(private readonly questionsService: QuestionsService) {}

  async submitAnswer(answer: StudentAnswer) {
    const question = await this.questionsService.getQuestion(answer.questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Calculate score based on question type and status
    let score = 0;
    const totalScore = question.points;
    let status: 'correct' | 'incorrect' | 'invalid' = 'invalid';

    if (answer.answer.tabChanged) {
      // If the answer is marked as invalid (tab change), keep it as invalid
      status = 'invalid';
      score = 0;
    } else if (question.type === 'quiz') {
      const selectedAnswer = question.answers?.find(a => a.id === answer.answer.answerId);
      if (selectedAnswer) {
        status = selectedAnswer.isCorrect ? 'correct' : 'incorrect';
        score = selectedAnswer.isCorrect ? question.points : 0;
      }
    } else if (question.type === 'text') {
      // For text questions, we'll need to implement a more sophisticated scoring system
      // For now, we'll just set it to 0 and let the professor grade it later
      status = 'incorrect';
      score = 0;
    }

    const answerWithScore = {
      ...answer,
      score,
      totalScore,
      status
    };

    this.answers.push(answerWithScore);
    return answerWithScore;
  }

  async getAllAnswers() {
    return this.answers;
  }

  async getAnswers(questionId: string) {
    return this.answers.filter(answer => answer.questionId === questionId);
  }
}