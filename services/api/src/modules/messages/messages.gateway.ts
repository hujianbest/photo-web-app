import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  namespace: '/messages',
  cors: { origin: '*' },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, Set<string>>();

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromToken(client);
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      client.data.userId = userId;

      // Join user's personal room
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    if (!senderId) {
      return { success: false, message: '未授权' };
    }

    try {
      const message = await this.messagesService.send(senderId, data);

      // Emit to receiver
      this.server.to(`user:${data.receiver_id}`).emit('new-message', {
        id: message.id,
        sender_id: senderId,
        content: message.content,
        created_at: message.created_at,
      });

      // Update conversation list for both users
      this.server.to(`user:${senderId}`).emit('conversation-updated', {
        other_user_id: data.receiver_id,
        last_message: data.content,
        last_message_at: message.created_at,
      });

      this.server.to(`user:${data.receiver_id}`).emit('conversation-updated', {
        other_user_id: senderId,
        last_message: data.content,
        last_message_at: message.created_at,
        unread_increment: 1,
      });

      return { success: true, data: message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('mark-typing')
  handleMarkTyping(
    @MessageBody() data: { receiver_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    this.server.to(`user:${data.receiver_id}`).emit('user-typing', {
      sender_id: senderId,
    });
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @MessageBody() data: { message_ids: number[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      await this.messagesService.markAsRead(userId, data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  private getUserIdFromToken(client: Socket): number | null {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) return null;

      // Simple JWT decode (in production, use jwt service)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.sub || payload.userId;
    } catch {
      return null;
    }
  }
}
