/**
 * 约拍模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from '../../src/modules/bookings/bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookingRequest } from '../../src/modules/bookings/entities/booking-request.entity';
import { UsersService } from '../../src/modules/users/users.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('Feature: 约拍服务', () => {
  let service: BookingsService;
  let mockRepository: any;
  let mockUsersService: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getOne: jest.fn().mockResolvedValue(null),
    };

    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    mockUsersService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(BookingRequest),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('Scenario: 创建约拍', () => {
    it('Given 有效数据, When 创建约拍, Then 应保存到数据库', async () => {
      const createDto = {
        target_user_id: 2,
        type: 'portrait',
        date: '2026-04-01',
        location: '北京',
      };

      const mockTargetUser = { id: 2, username: 'photographer' };
      const mockBooking = {
        id: 1,
        ...createDto,
        requester_id: 1,
        status: 'pending',
        requester: { id: 1, username: 'user1' },
        targetUser: mockTargetUser,
      };

      mockUsersService.findOne.mockResolvedValue(mockTargetUser);
      mockRepository.create.mockReturnValue(mockBooking);
      mockRepository.save.mockResolvedValue(mockBooking);
      mockQueryBuilder.getOne.mockResolvedValue(mockBooking);

      const result = await service.create(createDto as any, 1);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('Given 不存在的目标用户, When 创建约拍, Then 应抛出 NotFoundException', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.create({ target_user_id: 999, date: '2026-04-01' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('Given 约拍自己, When 创建约拍, Then 应抛出 ForbiddenException', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: 1 });

      await expect(
        service.create({ target_user_id: 1, date: '2026-04-01' } as any, 1),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Scenario: 查询约拍列表', () => {
    it('Given 用户ID和分页参数, When 查询列表, Then 应返回分页结果', async () => {
      const mockBookings = [
        { id: 1, requester_id: 1, target_user_id: 2, status: 'pending', requester: {}, targetUser: {} },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockBookings, 1]);

      const result = await service.findAll({ userId: 1, page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(1);
    });

    it('Given 状态筛选参数, When 查询列表, Then 应过滤结果', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.findAll({ userId: 1, page: 1, limit: 10, status: 'accepted' });

      expect(result.success).toBe(true);
    });
  });

  describe('Scenario: 接受约拍', () => {
    it('Given 有效的约拍ID和目标用户, When 接受, Then 应更新状态', async () => {
      const mockBooking = {
        id: 1,
        target_user_id: 2,
        status: 'pending',
        requester_id: 1,
        requester: { id: 1, username: 'user1' },
        targetUser: { id: 2, username: 'user2' },
      };
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockQueryBuilder.getOne.mockResolvedValue({ ...mockBooking, status: 'accepted' });

      const result = await service.accept(1, 2);

      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('Given 非目标用户, When 接受, Then 应抛出 ForbiddenException', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, target_user_id: 2 });

      await expect(service.accept(1, 3)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Scenario: 拒绝约拍', () => {
    it('Given 有效的约拍ID和目标用户, When 拒绝, Then 应更新状态', async () => {
      const mockBooking = { id: 1, target_user_id: 2, status: 'pending' };
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.reject(1, 2, '不合适');

      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('Scenario: 取消约拍', () => {
    it('Given 存在的约拍且是请求者, When 取消, Then 应更新状态', async () => {
      const mockBooking = { id: 1, requester_id: 1, status: 'pending' };
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.cancel(1, 1, '临时有事');

      expect(result.success).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(1, { status: 'cancelled' });
    });

    it('Given 非请求者, When 取消, Then 应抛出 ForbiddenException', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, requester_id: 1 });

      await expect(service.cancel(1, 2, 'test')).rejects.toThrow(ForbiddenException);
    });
  });
});
