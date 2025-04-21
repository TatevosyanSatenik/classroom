import { Module } from '@nestjs/common';
import { YearsService } from './years.service';
import { YearsController } from './years.controller';

@Module({
  controllers: [YearsController],
  providers: [YearsService],
  exports: [YearsService]
})
export class YearsModule {} 
