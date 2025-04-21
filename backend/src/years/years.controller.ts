import { Controller, Get, Param } from '@nestjs/common';
import { YearsService } from './years.service';

@Controller('years')
export class YearsController {
  constructor(private readonly yearsService: YearsService) {}

  @Get()
  getAllYears() {
    return this.yearsService.getAllYears();
  }

  @Get(':id')
  getYearById(@Param('id') id: string) {
    return this.yearsService.getYearById(id);
  }

  @Get(':id/groups')
  getGroupsByYearId(@Param('id') id: string) {
    return this.yearsService.getGroupsByYearId(id);
  }

  @Get('class/:classId/groups')
  getGroupsByClassId(@Param('classId') classId: string) {
    return this.yearsService.getGroupsByClassId(classId);
  }
} 