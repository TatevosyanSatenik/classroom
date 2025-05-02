import { ref } from 'vue';
import { socketService } from './socket.service';
import { apiService } from './api.service';
import type { Question, Subject, Topic, Year, Group, StudentAnswer, QuestionParams } from '@/types';

class StudentService {
  private static instance: StudentService;
  private questions = ref<Question[]>([]);

  private constructor() {
    this.setupSocketListeners();
    // Initialize socket connection
    socketService.emit('student-connect', 'student');
  }

  public static getInstance(): StudentService {
    if (!StudentService.instance) {
      StudentService.instance = new StudentService();
    }
    return StudentService.instance;
  }

  private setupSocketListeners() {
    socketService.on('questionUpdate', (question: Question) => {
      const index = this.questions.value.findIndex(q => q.id === question.id);
      if (index !== -1) {
        this.questions.value[index] = question;
      } else {
        this.questions.value.push(question);
      }
    });
  }

  public getQuestions() {
    return this.questions.value;
  }

  async loadQuestions(params?: QuestionParams): Promise<Question[]> {
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

  async submitAnswer(answer: StudentAnswer): Promise<void> {
    console.log('Submitting answer via socket:', answer);
    return new Promise((resolve, reject) => {
      socketService.emit('submit-answer', answer, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to submit answer'));
        }
      });
    });
  }

  onQuestionUpdate(callback: (question: Question) => void): void {
    socketService.on('questionUpdate', callback);
  }

  offQuestionUpdate(callback: (question: Question) => void): void {
    socketService.off('questionUpdate', callback);
  }

  public cleanup() {
    socketService.off('questionUpdate', () => {});
    this.questions.value = [];
  }
}

export const studentService = StudentService.getInstance(); 