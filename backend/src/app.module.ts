import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';

dotenv.config();

@Module({
  imports: [
	MongooseModule.forRoot(process.env.MONGODB_CONNECTION_STRING!),
	UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
