import axios from 'axios';
import type { Question, QuestionParams, Subject, Topic, Year, Group, StudentAnswer } from '@/types';

interface User {
  id: string;
  email: string;
  role: 'student' | 'professor';
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = 'http://localhost:3000';
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async login(email: string, password: string): Promise<{ data: User }> {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, { email, password });
      return response;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/auth/logout`);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async getQuestions(params?: QuestionParams): Promise<Question[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/questions`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    try {
      const response = await axios.post(`${this.baseUrl}/questions`, question);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    try {
      const response = await axios.put(`${this.baseUrl}/questions/${id}`, question);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/questions/${id}`);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  async getAnswers(questionId: string): Promise<StudentAnswer[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/answers/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching answers:', error);
      throw error;
    }
  }

  async submitAnswer(answer: StudentAnswer): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/answers`, answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/subjects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  async getTopics(subjectId: string): Promise<Topic[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/subjects/${subjectId}/topics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  async getYears(): Promise<Year[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/years`);
      return response.data;
    } catch (error) {
      console.error('Error fetching years:', error);
      throw error;
    }
  }

  async getGroups(yearId: string): Promise<Group[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/years/${yearId}/groups`);
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<{ data: T }> {
    const response = await axios.get(`${this.baseUrl}${endpoint}`);
    return response;
  }

  async post<T>(endpoint: string, data: any): Promise<{ data: T }> {
    const response = await axios.post(`${this.baseUrl}${endpoint}`, data);
    return response;
  }

  async put<T>(endpoint: string, data: any): Promise<{ data: T }> {
    const response = await axios.put(`${this.baseUrl}${endpoint}`, data);
    return response;
  }

  async delete<T>(endpoint: string): Promise<{ data: T }> {
    const response = await axios.delete(`${this.baseUrl}${endpoint}`);
    return response;
  }

  async getAllAnswers(): Promise<StudentAnswer[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/answers`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all answers:', error);
      return [];
    }
  }
}

export const apiService = ApiService.getInstance(); 