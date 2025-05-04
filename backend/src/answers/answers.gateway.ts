import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnswersService } from './answers.service';
import { Logger } from '@nestjs/common';
import { StudentAnswer } from '../types';

@WebSocketGateway({
  namespace: 'answers',
  cors: {
    origin: '*',
  },
})
export class AnswersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('AnswersGateway');
  private professorSockets = new Map<string, Socket>();
  private studentSockets = new Map<string, Socket>();

  constructor(private readonly answersService: AnswersService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    console.log('New client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    console.log('Client disconnected:', client.id);
    // Remove from professor sockets if it was a professor
    for (const [email, socket] of this.professorSockets.entries()) {
      if (socket.id === client.id) {
        this.professorSockets.delete(email);
        console.log('Removed professor socket:', email);
        break;
      }
    }
    // Remove from student sockets if it was a student
    for (const [id, socket] of this.studentSockets.entries()) {
      if (socket.id === client.id) {
        this.studentSockets.delete(id);
        console.log('Removed student socket:', id);
        break;
      }
    }
  }

  @SubscribeMessage('professor-connect')
  handleProfessorConnect(client: Socket, email: string) {
    this.logger.log(`Professor connected: ${email}`);
    console.log('Professor connected:', email);
    this.professorSockets.set(email, client);
  }

  @SubscribeMessage('student-connect')
  handleStudentConnect(client: Socket) {
    this.logger.log(`Student connected: ${client.id}`);
    console.log('Student connected:', client.id);
    this.studentSockets.set(client.id, client);
  }

  @SubscribeMessage('submit-answer')
  async handleAnswer(client: Socket, answer: StudentAnswer) {
    this.logger.log(`New answer received for question: ${answer.questionId}`);
    console.log('New answer received:', answer);
    
    try {
      const newAnswer = await this.answersService.submitAnswer(answer);
      console.log('Answer submitted successfully:', newAnswer);
    
    // Emit to all professors
      console.log('Emitting new-answer event to all professors');
    this.server.emit('new-answer', newAnswer);
    
      return { success: true, answer: newAnswer };
    } catch (error) {
      console.error('Error submitting answer:', error);
      return { success: false, error: error.message };
    }
  }
} 