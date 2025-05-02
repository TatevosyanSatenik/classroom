import { io, Socket } from 'socket.io-client';
import type { Question, StudentAnswer } from '@/types';

class SocketService {
  private static instance: SocketService;
  private socket: Socket;

  private constructor() {
    this.socket = io('http://localhost:3000/answers', {
      transports: ['websocket'],
      autoConnect: true
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.socket.off(event, callback);
  }

  emit(event: string, data: any, callback?: (response: any) => void): void {
    this.socket.emit(event, data, callback);
  }
}

export const socketService = SocketService.getInstance(); 