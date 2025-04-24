import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './interfaces/question.interface';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: Omit<Question, 'id'>): Question {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  findAll(@Query('groupIds') groupIds?: string, @Query('topicId') topicId?: string): Question[] {
    return this.questionsService.findAll(groupIds, topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Question | undefined {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: Partial<Question>): Question | undefined {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Question | undefined {
    return this.questionsService.remove(id);
  }
} 