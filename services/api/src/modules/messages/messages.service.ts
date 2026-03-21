import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async send(senderId: number, sendMessageDto: SendMessageDto): Promise<Message> {
    const { receiver_id, content } = sendMessageDto;

    if (senderId === receiver_id) {
      throw new ForbiddenException('不能给自己发送消息');
    }

    const message = this.messageRepository.create({
      sender_id: senderId,
      receiver_id,
      content,
    });
    const savedMessage = await this.messageRepository.save(message);

    // Update or create conversation for sender
    await this.updateConversation(senderId, receiver_id, content);

    // Update or create conversation for receiver
    await this.updateConversation(receiver_id, senderId, content, true);

    return savedMessage;
  }

  async getConversations(userId: number, page = 1, limit = 20) {
    const [conversations, total] = await this.conversationRepository.findAndCount({
      where: { user_id: userId },
      relations: ['other_user'],
      order: { last_message_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: conversations.map(c => ({
        id: c.id,
        user: {
          id: c.other_user.id,
          username: c.other_user.username,
          avatar_url: c.other_user.avatar_url,
        },
        last_message: c.last_message_content,
        last_message_at: c.last_message_at,
        unread_count: c.unread_count,
      })),
      total,
      page,
      limit,
    };
  }

  async getMessages(userId: number, otherUserId: number, page = 1, limit = 50) {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mark messages as read
    await this.messageRepository.update(
      {
        sender_id: otherUserId,
        receiver_id: userId,
        is_read: false,
      },
      { is_read: true },
    );

    // Update unread count
    const conversation = await this.conversationRepository.findOne({
      where: { user_id: userId, other_user_id: otherUserId },
    });
    if (conversation && conversation.unread_count > 0) {
      await this.conversationRepository.update(conversation.id, { unread_count: 0 });
    }

    return {
      data: messages.reverse().map(m => ({
        id: m.id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        content: m.content,
        is_read: m.is_read,
        created_at: m.created_at,
      })),
      total,
      page,
      limit,
    };
  }

  async markAsRead(userId: number, markReadDto: MarkReadDto): Promise<void> {
    const { message_ids } = markReadDto;

    // Verify messages belong to user
    const messages = await this.messageRepository.find({
      where: { id: In(message_ids) },
    });

    const validMessages = messages.filter(m => m.receiver_id === userId);
    if (validMessages.length === 0) {
      throw new NotFoundException('没有找到相关的消息');
    }

    await this.messageRepository.update(
      { id: In(validMessages.map(m => m.id)) },
      { is_read: true },
    );

    // Update unread count for conversations
    const senderIds = [...new Set(validMessages.map(m => m.sender_id))];
    for (const senderId of senderIds) {
      const conversation = await this.conversationRepository.findOne({
        where: { user_id: userId, other_user_id: senderId },
      });
      if (conversation && conversation.unread_count > 0) {
        const unreadCount = validMessages.filter(m => m.sender_id === senderId && !m.is_read).length;
        await this.conversationRepository.update(conversation.id, {
          unread_count: Math.max(0, conversation.unread_count - unreadCount),
        });
      }
    }
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.messageRepository.count({
      where: { receiver_id: userId, is_read: false },
    });
    return { count };
  }

  private async updateConversation(
    userId: number,
    otherUserId: number,
    lastMessage: string,
    incrementUnread = false,
  ): Promise<void> {
    let conversation = await this.conversationRepository.findOne({
      where: { user_id: userId, other_user_id: otherUserId },
    });

    if (conversation) {
      await this.conversationRepository.update(conversation.id, {
        last_message_content: lastMessage,
        last_message_at: new Date(),
        unread_count: incrementUnread ? conversation.unread_count + 1 : 0,
      });
    } else {
      conversation = this.conversationRepository.create({
        user_id: userId,
        other_user_id: otherUserId,
        last_message_content: lastMessage,
        last_message_at: new Date(),
        unread_count: incrementUnread ? 1 : 0,
      });
      await this.conversationRepository.save(conversation);
    }
  }

  async deleteConversation(userId: number, otherUserId: number): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { user_id: userId, other_user_id: otherUserId },
    });

    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }

    await this.conversationRepository.delete(conversation.id);
  }
}
