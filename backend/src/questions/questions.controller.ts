import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from '../schemas/question.schema';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async create(@Body() createQuestionDto: any): Promise<Question> {
    try {
      return await this.questionsService.create(createQuestionDto);
    } catch (error) {
      throw new HttpException('Failed to create question', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
	findAll() {
    try {
      return this.questionsService.findAll();
    } catch (error) {
      throw new HttpException('Failed to fetch questions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const question = await this.questionsService.findOne(id);
      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }
      return question;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch question', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateQuestionDto: any) {
    try {
      const question = await this.questionsService.update(id, updateQuestionDto);
      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }
      return question;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update question', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const question = await this.questionsService.remove(id);
      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }
      return question;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete question', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 