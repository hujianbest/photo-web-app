/**
 * 用户模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('Feature: 用户服务', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('Scenario: 创建用户', () => {
    it('Given 有效用户数据, When 创建用户, Then 应哈希密码并保存', async () => {
      const createDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        username: createDto.username,
        email: createDto.email,
        password_hash: 'hashed_password',
      };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto as any);

      expect(result.username).toBe(createDto.username);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('Scenario: 查询用户', () => {
    it('Given 用户ID, When 查询用户, Then 应返回用户信息', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        points: 100,
        level: 'newbie',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Array),
      });
    });

    it('Given 不存在的ID, When 查询用户, Then 应抛出 NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Scenario: 查询所有用户', () => {
    it('When 查询所有用户, Then 应返回用户列表', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' },
      ];

      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledWith({
        select: expect.any(Array),
      });
    });
  });

  describe('Scenario: 按字段查询用户', () => {
    it('Given 用户名, When 按用户名查询, Then 应返回匹配的用户', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('Given 邮箱, When 按邮箱查询, Then 应返回匹配的用户', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('Given 手机号, When 按手机号查询, Then 应返回匹配的用户', async () => {
      const mockUser = { id: 1, phone: '13800138000' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByPhone('13800138000');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { phone: '13800138000' },
      });
    });
  });

  describe('Scenario: 更新用户', () => {
    it('Given 用户ID和更新数据, When 更新用户, Then 应保存更改', async () => {
      const updateDto = { bio: '新简介', location: '北京' };
      const mockUser = { id: 1, username: 'testuser', ...updateDto };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.update(1, updateDto as any);

      expect(result.bio).toBe(updateDto.bio);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('Scenario: 更新最后登录时间', () => {
    it('Given 用户ID, When 更新最后登录, Then 应更新时间戳', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateLastLogin(1);

      expect(mockRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ last_login_at: expect.any(Date) })
      );
    });
  });

  describe('Scenario: 更新密码', () => {
    it('Given 用户ID和哈希密码, When 更新密码, Then 应保存', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updatePassword(1, 'new_hashed_password');

      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        password_hash: 'new_hashed_password',
      });
    });
  });

  describe('Scenario: 删除用户', () => {
    it('Given 用户ID, When 删除用户, Then 应从数据库移除', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Scenario: 获取用户统计', () => {
    it('Given 用户ID, When 获取统计, Then 应返回统计信息', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        points: 500,
        level: 'intermediate',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getStats(1);

      expect(result.user_id).toBe(1);
      expect(result.username).toBe('testuser');
      expect(result.points).toBe(500);
    });

    it('Given 不存在的用户ID, When 获取统计, Then 应抛出异常', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getStats(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Scenario: 增加积分', () => {
    it('Given 用户ID和积分, When 增加积分, Then 应更新用户积分', async () => {
      const mockUser = { id: 1, username: 'testuser', points: 100 };
      const updatedUser = { ...mockUser, points: 150 };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.addPoints(1, 50, '完成任务');

      expect(result.points).toBe(150);
    });

    it('Given 不存在的用户ID, When 增加积分, Then 应抛出异常', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.addPoints(999, 50, 'test')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Scenario: 更新等级', () => {
    it('Given 用户积分达到1000, When 更新等级, Then 应升级为 intermediate', async () => {
      const mockUser = { id: 1, username: 'testuser', points: 1000, level: 'newbie' };
      const updatedUser = { ...mockUser, level: 'intermediate' };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateLevel(1);

      expect(result.level).toBe('intermediate');
    });

    it('Given 用户积分达到5000, When 更新等级, Then 应升级为 professional', async () => {
      const mockUser = { id: 1, username: 'testuser', points: 5000, level: 'intermediate' };
      const updatedUser = { ...mockUser, level: 'professional' };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateLevel(1);

      expect(result.level).toBe('professional');
    });

    it('Given 用户积分达到10000, When 更新等级, Then 应升级为 master', async () => {
      const mockUser = { id: 1, username: 'testuser', points: 10000, level: 'professional' };
      const updatedUser = { ...mockUser, level: 'master' };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateLevel(1);

      expect(result.level).toBe('master');
    });

    it('Given 用户等级不变, When 更新等级, Then 不应调用 save', async () => {
      const mockUser = { id: 1, username: 'testuser', points: 500, level: 'newbie' };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.updateLevel(1);

      expect(result.level).toBe('newbie');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
