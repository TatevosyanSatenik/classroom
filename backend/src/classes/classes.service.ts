import { Injectable } from '@nestjs/common';

@Injectable()
export class ClassesService {
  private readonly classes = [
    {
      id: 'cs101',
      name: 'Programming Styles',
      description: 'Introduction to different programming styles and paradigms'
    },
    {
      id: 'cs201',
      name: 'Algorithms',
      description: 'Study of algorithms and data structures'
    },
    {
      id: 'cs301',
      name: 'Operating Systems',
      description: 'Principles and design of operating systems'
    },
  ];

  getAllClasses() {
    return this.classes;
  }

  getClassById(id: string) {
    return this.classes.find(c => c.id === id);
  }
} 