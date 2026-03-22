/**
 * 私信模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from '../../src/modules/messages/messages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from '../../src/modules/messages/entities/message.entity';
import { Conversation } from '../../src/modules/messages/entities/conversation.entity';
import { ForbiddenException } from '@nestjs/common';

describe('Feature: 私信服务', () => {
  let service: MessagesService;
  let mockMessageRepository: any;
  let mockConversationRepository: any;

  beforeEach(async () => {
    mockMessageRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
    };

    mockConversationRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  describe('Scenario: 发送私信', () => {
    it('Given 有效消息内容, When 发送私信, Then 应创建消息并更新会话', async () => {
      const sendMessageDto = {
        receiver_id: 2,
        content: '你好，想咨询约拍事宜',
      };

      const mockMessage = {
        id: 1,
        sender_id: 1,
        receiver_id: 2,
        content: sendMessageDto.content,
      };

      mockMessageRepository.create.mockReturnValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);
      mockConversationRepository.findOne.mockResolvedValue(null);
      mockConversationRepository.create.mockReturnValue({});
      mockConversationRepository.save.mockResolvedValue({});

      const result = await service.send(1, sendMessageDto as any);

      expect(result.content).toBe(sendMessageDto.content);
      expect(mockMessageRepository.save).toHaveBeenCalled();
    });

    it('Given 发送给自己, When 发送消息, Then 应抛出 ForbiddenException', async () => {
      await expect(
        service.send(1, { receiver_id: 1, content: 'test' } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Scenario: 获取会话列表', () => {
    it('Given 用户ID, When 查询会话列表, Then 应返回该用户的所有会话', async () => {
      const mockConversations = [
        {
          id: 1,
          user_id: 1,
          other_user_id: 2,
          last_message_content: '最新消息',
          last_message_at: new Date(),
          unread_count: 2,
          other_user: { id: 2, username: 'user2', avatar_url: 'avatar.jpg' },
        },
      ];

      mockConversationRepository.findAndCount.mockResolvedValue([mockConversations, 1]);

      const result = await service.getConversations(1, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].last_message).toBe('最新消息');
    });
  });

  describe('Scenario: 获取会话消息', () => {
    it('Given 会话双方ID, When 查询消息, Then 应返回分页消息列表', async () => {
      const mockMessages = [
        { id: 1, sender_id: 1, receiver_id: 2, content: '消息1', sender: {}, receiver: {} },
        { id: 2, sender_id: 2, receiver_id: 1, content: '消息2', sender: {}, receiver: {} },
      ];

      mockMessageRepository.findAndCount.mockResolvedValue([mockMessages, 2]);
      mockMessageRepository.update.mockResolvedValue({ affected: 2 });

      const result = await service.getMessages(1, 2, 1, 50);

      expect(result.data).toHaveLength(2);
    });
  });

  describe('Scenario: 标记消息已读', () => {
    it('Given 会话双方ID, When 标记已读, Then 应更新未读消息状态', async () => {
      mockMessageRepository.update.mockResolvedValue({ affected: 5 });

      await service.markAsRead(1, 2);

      expect(mockMessageRepository.update).toHaveBeenCalled();
    });
  });
});
