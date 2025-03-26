import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';

dotenv.config();

@Module({
  imports: [
    UsersModule,
    QuestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
