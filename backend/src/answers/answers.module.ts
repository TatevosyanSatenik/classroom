import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { AnswersGateway } from './answers.gateway';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [QuestionsModule],
  controllers: [AnswersController],
  providers: [AnswersService, AnswersGateway],
  exports: [AnswersService]
})
export class AnswersModule {}