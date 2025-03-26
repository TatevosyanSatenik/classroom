import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionsGateway } from './questions.gateway';

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsGateway],
  exports: [QuestionsService]
})
export class QuestionsModule {} 