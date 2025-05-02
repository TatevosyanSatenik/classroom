import { socketService } from './socket.service';
import { apiService } from './api.service';
import type { Question, Subject, Topic, Year, Group, StudentAnswer } from '@/types';

class ProfessorService {
  private static instance: ProfessorService;

  private constructor() {}

  public static getInstance(): ProfessorService {
    if (!ProfessorService.instance) {
      ProfessorService.instance = new ProfessorService();
    }
    return ProfessorService.instance;
  }

  async loadQuestions(params?: { groupIds?: string; topicId?: string }): Promise<Question[]> {
    return apiService.getQuestions(params);
  }

  async loadSubjects(): Promise<Subject[]> {
    return apiService.getSubjects();
  }

  async loadTopics(subjectId: string): Promise<Topic[]> {
    return apiService.getTopics(subjectId);
  }

  async loadYears(): Promise<Year[]> {
    return apiService.getYears();
  }

  async loadGroups(yearId: string): Promise<Group[]> {
    return apiService.getGroups(yearId);
  }

  async getAnswers(questionId?: string): Promise<StudentAnswer[]> {
    try {
      if (questionId) {
        return apiService.getAnswers(questionId);
      }
      const allAnswers = await apiService.getAllAnswers();
      return allAnswers || [];
    } catch (error) {
      console.error('Error fetching answers:', error);
      return [];
    }
  }

  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    return apiService.createQuestion(question);
  }

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    return apiService.updateQuestion(id, question);
  }

  async deleteQuestion(id: string): Promise<void> {
    return apiService.deleteQuestion(id);
  }

  onStudentAnswer(callback: (answer: StudentAnswer) => void): void {
    socketService.on('new-answer', callback);
  }

  offStudentAnswer(callback: (answer: StudentAnswer) => void): void {
    socketService.off('new-answer', callback);
  }

  cleanup(): void {
    socketService.off('new-answer', () => {});
  }
}

export const professorService = ProfessorService.getInstance(); 