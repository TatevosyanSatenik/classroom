import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { QuestionsService } from '../questions/questions.service';
import type { StudentAnswer } from '../types';

@Controller('answers')
export class AnswersController {
  constructor(
    private readonly answersService: AnswersService,
    private readonly questionsService: QuestionsService
  ) {}

  @Post()
  async submitAnswer(@Body() answer: StudentAnswer) {
    const question = await this.questionsService.getQuestion(answer.questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Calculate score based on question type
    let score = 0;
    const totalScore = question.points;

    if (question.type === 'quiz') {
      const selectedAnswer = question.answers?.find(a => a.id === answer.answer.answerId);
      score = selectedAnswer?.isCorrect ? question.points : 0;
    } else if (question.type === 'text') {
      // For text questions, we'll need to implement a more sophisticated scoring system
      // For now, we'll just set it to 0 and let the professor grade it later
      score = 0;
    }

    const answerWithScore = {
      ...answer,
      score,
      totalScore
    };

    return this.answersService.submitAnswer(answerWithScore);
  }

  @Get()
  async getAllAnswers() {
    console.log('Getting all answers');
    const answers = await this.answersService.getAllAnswers();
    console.log('Found answers:', answers);
    return answers;
  }

  @Get(':questionId')
  async getAnswers(@Param('questionId') questionId: string) {
    return this.answersService.getAnswers(questionId);
  }
}
