import { Controller, Get, Param } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  getAllClasses() {
    return this.classesService.getAllClasses();
  }

  @Get(':id')
  getClassById(@Param('id') id: string) {
    return this.classesService.getClassById(id);
  }
} 