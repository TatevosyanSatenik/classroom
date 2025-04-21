import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { AnswersGateway } from './answers.gateway';

@Module({
  controllers: [AnswersController],
  providers: [AnswersService, AnswersGateway],
  exports: [AnswersService]
})
export class AnswersModule {}