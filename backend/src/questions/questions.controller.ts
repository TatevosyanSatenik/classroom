import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from '../types';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: Omit<Question, 'id'>): Promise<Question> {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  findAll(@Query('groupIds') groupIds?: string, @Query('topicId') topicId?: string): Promise<Question[]> {
    return this.questionsService.findAll(groupIds, topicId);
  }

  @Get(':id')
  getQuestion(@Param('id') id: string): Promise<Question | null> {
    return this.questionsService.getQuestion(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: Partial<Question>): Promise<Question | null> {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Question | null> {
    return this.questionsService.remove(id);
  }
} 