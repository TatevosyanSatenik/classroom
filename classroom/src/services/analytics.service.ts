import { apiService } from './api.service';
import type { StudentAnswer } from '@/types';

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async loadAnswers(questionId: string): Promise<StudentAnswer[]> {
    try {
      const response = await apiService.get<StudentAnswer[]>(`/answers/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error loading answers:', error);
      return [];
    }
  }

  getScoreDistribution(answers: StudentAnswer[]) {
    const ranges = {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-100': 0
    };

    answers.forEach(answer => {
      if (!answer.score || !answer.totalScore) return;
      
      const percentage = (answer.score / answer.totalScore) * 100;
      if (percentage <= 25) ranges['0-25']++;
      else if (percentage <= 50) ranges['26-50']++;
      else if (percentage <= 75) ranges['51-75']++;
      else ranges['76-100']++;
    });

    return ranges;
  }

  getAnswerAccuracy(answers: StudentAnswer[]) {
    let correct = 0;
    let incorrect = 0;

    answers.forEach(answer => {
      if (!answer.score || !answer.totalScore) return;
      
      if (answer.score === answer.totalScore) correct++;
      else incorrect++;
    });

    return { correct, incorrect };
  }

  getChartData(answers: StudentAnswer[]) {
    const scoreDistribution = this.getScoreDistribution(answers);
    const answerAccuracy = this.getAnswerAccuracy(answers);

    return {
      scoreDistribution: {
        labels: Object.keys(scoreDistribution),
        datasets: [{
          data: Object.values(scoreDistribution),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      },
      answerAccuracy: {
        labels: ['Correct', 'Incorrect'],
        datasets: [{
          data: [answerAccuracy.correct, answerAccuracy.incorrect],
          backgroundColor: ['#4CAF50', '#F44336']
        }]
      }
    };
  }
}

export const analyticsService = AnalyticsService.getInstance(); 