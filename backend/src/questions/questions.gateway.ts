import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  },
  namespace: 'questions'
})
export class QuestionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket) {
    console.log(`Client ${client.id} joined the questions room`);
    return { status: 'joined' };
  }

  emitQuestionCreated(question: any) {
    console.log('Emitting questionCreated event:', question);
    this.server.emit('questionCreated', question);
  }

  emitQuestionUpdated(question: any) {
    console.log('Emitting questionUpdated event:', question);
    this.server.emit('questionUpdated', question);
  }

  emitQuestionDeleted(id: string) {
    console.log('Emitting questionDeleted event:', id);
    this.server.emit('questionDeleted', id);
  }
}