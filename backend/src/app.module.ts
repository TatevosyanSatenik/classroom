import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { YearsModule } from './years/years.module';
import { ClassesModule } from './classes/classes.module';
import { AnswersModule } from './answers/answers.module';

dotenv.config();

@Module({
  imports: [
    UsersModule,
    QuestionsModule,
    YearsModule,
    ClassesModule,
    AnswersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
