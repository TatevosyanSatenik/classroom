import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { YearsModule } from './years/years.module';
import { ClassesModule } from './classes/classes.module';
import { AnswersModule } from './answers/answers.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [
    UsersModule,
    QuestionsModule,
    YearsModule,
    ClassesModule,
    AnswersModule,
    SubjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
