import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnswersService, UserAnswer } from './answers.service';
import { Logger } from '@nestjs/common';

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

  constructor(private readonly answersService: AnswersService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove from professor sockets if it was a professor
    for (const [email, socket] of this.professorSockets.entries()) {
      if (socket.id === client.id) {
        this.professorSockets.delete(email);
        break;
      }
    }
  }

  @SubscribeMessage('professor-connect')
  handleProfessorConnect(client: Socket, email: string) {
    this.logger.log(`Professor connected: ${email}`);
    this.professorSockets.set(email, client);
  }

  @SubscribeMessage('submit-answer')
  handleAnswer(client: Socket, answer: Omit<UserAnswer, 'timestamp'>) {
    this.logger.log(`New answer received for question: ${answer.answer.questionId}`);
    const newAnswer = this.answersService.createAnswer(answer);
    
    // Emit to all professors
    this.server.emit('new-answer', newAnswer);
    
    return { success: true };
  }
} 