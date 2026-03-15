import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(userId: number, params: {
    page: number;
    limit: number;
    unread?: boolean;
  }) {
    const { page, limit, unread } = params;

    const queryBuilder = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId });

    if (unread) {
      queryBuilder.andWhere('notification.is_read = :isRead', { isRead: false });
    }

    const [notifications, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('notification.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: notifications.map(notification => this.formatNotification(notification)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
        unread_count: await this.notificationsRepository.count({
          where: { user_id: userId, is_read: false },
        }),
      },
    };
  }

  async getUnreadCount(userId: number) {
    const count = await this.notificationsRepository.count({
      where: { user_id: userId, is_read: false },
    });

    return {
      success: true,
      data: { unread_count: count },
    };
  }

  async findOne(id: number, userId: number) {
    const notification = await this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.id = :id', { id })
      .getOne();

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('无权查看此通知');
    }

    return {
      success: true,
      data: this.formatNotification(notification),
    };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('无权操作此通知');
    }

    await this.notificationsRepository.update(id, { is_read: true });

    return {
      success: true,
      message: '通知已标记为已读',
    };
  }

  async markAllAsRead(userId: number) {
    await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );

    return {
      success: true,
      message: '所有通知已标记为已读',
    };
  }

  async remove(id: number, userId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('无权删除此通知');
    }

    await this.notificationsRepository.delete(id);

    return {
      success: true,
      message: '通知删除成功',
    };
  }

  async create(userId: number, notificationData: {
    type: string;
    title: string;
    content?: string;
    data?: Record<string, any>;
  }) {
    const notification = this.notificationsRepository.create({
      user_id: userId,
      ...notificationData,
    });

    const saved = await this.notificationsRepository.save(notification);
    const formatted = this.formatNotification(saved);
    if (this.notificationsGateway.server) {
      this.notificationsGateway.pushToUser(userId, formatted);
    }
    return saved;
  }

  private formatNotification(notification: Notification) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data,
      is_read: notification.is_read,
      created_at: notification.created_at,
    };
  }
}
