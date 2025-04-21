import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnswersService, UserAnswer } from './answers.service';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get()
  getAllAnswers(): UserAnswer[] {
    return this.answersService.getAllAnswers();
  }

  @Get(':email')
  getAnswersByEmail(@Param('email') email: string) {
    return this.answersService.getAnswersByEmail(email);
  }

  @Post()
  createAnswer(@Body() answer: UserAnswer) {
    return this.answersService.createAnswer(answer);
  }
}
