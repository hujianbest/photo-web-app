import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

export const NOTIFICATION_EVENT = 'notification';
export const ROOM_PREFIX = 'user:';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/ws',
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly socketToUserId = new Map<string, number>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: any) {
    try {
      const token =
        client.handshake?.auth?.token ||
        client.handshake?.query?.token ||
        client.handshake?.headers?.authorization?.replace?.('Bearer ', '');
      if (!token) {
        client.emit('error', { message: '未提供认证信息' });
        client.disconnect(true);
        return;
      }
      const payload = this.jwtService.verify(token);
      const userId = payload.sub as number;
      if (!userId) {
        client.emit('error', { message: '无效的认证信息' });
        client.disconnect(true);
        return;
      }
      const room = `${ROOM_PREFIX}${userId}`;
      client.join(room);
      this.socketToUserId.set(client.id, userId);
      this.logger.debug(`Client ${client.id} joined room ${room}`);
    } catch (e) {
      this.logger.warn('WS auth failed', e?.message);
      client.emit('error', { message: '认证失败' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: any) {
    this.socketToUserId.delete(client.id);
  }

  /** 向指定用户推送一条通知（供 NotificationsService 调用） */
  pushToUser(userId: number, payload: Record<string, unknown>) {
    const room = `${ROOM_PREFIX}${userId}`;
    this.server?.to(room).emit(NOTIFICATION_EVENT, payload);
    this.logger.debug(`Pushed notification to room ${room}`);
  }
}
