import { Injectable } from '@nestjs/common';
import { Subject, Topic } from '../types';

@Injectable()
export class SubjectsService {
  private subjects: Subject[] = [
    {
      id: '1',
      name: 'Computer Science',
      description: 'Study of computers and computational systems',
      topics: [
        { id: '1', name: 'Algorithms', description: 'Study of algorithms and their complexity' },
        { id: '2', name: 'Data Structures', description: 'Study of data organization and storage' },
        { id: '3', name: 'Programming', description: 'Study of programming languages and paradigms' },
      ],
    },
    {
      id: '2',
      name: 'Mathematics',
      description: 'Study of numbers, quantities, and shapes',
      topics: [
        { id: '1', name: 'Algebra', description: 'Study of mathematical symbols and rules' },
        { id: '2', name: 'Calculus', description: 'Study of continuous change' },
        { id: '3', name: 'Geometry', description: 'Study of shapes and spatial relationships' },
      ],
    },
  ];

  findAll(): Subject[] {
    return this.subjects;
  }

  findOne(id: string): Subject | undefined {
    return this.subjects.find(subject => subject.id === id);
  }

  findTopicsBySubjectId(subjectId: string): Topic[] {
    const subject = this.subjects.find(s => s.id === subjectId);
    return subject?.topics || [];
  }
} 