/**
 * 订单模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../../src/modules/orders/orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../../src/modules/bookings/entities/order.entity';
import { BookingRequest } from '../../src/modules/bookings/entities/booking-request.entity';
import { UsersService } from '../../src/modules/users/users.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('Feature: 订单服务', () => {
  let service: OrdersService;
  let mockOrderRepository: any;
  let mockBookingRepository: any;
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

    mockOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    mockBookingRepository = {
      findOne: jest.fn(),
    };

    mockUsersService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(BookingRequest),
          useValue: mockBookingRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('Scenario: 创建订单', () => {
    it('Given 有效的约拍ID, When 创建订单, Then 应生成订单号并保存', async () => {
      const mockBooking = {
        id: 1,
        requester_id: 1,
        target_user_id: 2,
        status: 'accepted',
        budget: 500,
      };

      const mockOrder = {
        id: 1,
        booking_id: 1,
        order_no: 'ORD1234567890123',
        client_id: 1,
        photographer_id: 2,
        amount: 500,
        status: 'pending',
        client: { id: 1 },
        photographer: { id: 2 },
        booking: mockBooking,
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockQueryBuilder.getOne.mockResolvedValue(mockOrder);

      const result = await service.create(1, 1);

      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('Given 不存在的约拍ID, When 创建订单, Then 应抛出 NotFoundException', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.create(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('Given 非请求者, When 创建订单, Then 应抛出 ForbiddenException', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: 1,
        requester_id: 1,
        status: 'accepted',
      });

      await expect(service.create(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('Given 未接受的约拍, When 创建订单, Then 应抛出 ForbiddenException', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: 1,
        requester_id: 1,
        status: 'pending',
      });

      await expect(service.create(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Scenario: 查询订单列表', () => {
    it('Given 用户ID和分页参数, When 查询列表, Then 应返回分页结果', async () => {
      const mockOrders = [
        { id: 1, client_id: 1, photographer_id: 2, status: 'pending', client: {}, photographer: {}, booking: {} },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockOrders, 1]);

      const result = await service.findAll({ userId: 1, page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(1);
    });

    it('Given 状态筛选参数, When 查询列表, Then 应过滤结果', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.findAll({ userId: 1, page: 1, limit: 10, status: 'paid' });

      expect(result.success).toBe(true);
    });
  });

  describe('Scenario: 支付订单', () => {
    it('Given 存在的订单, When 支付, Then 应更新状态为已支付', async () => {
      const mockOrder = { id: 1, client_id: 1, status: 'pending', amount: 500 };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.pay(1, 'alipay', 1);

      expect(mockOrderRepository.update).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('Given 非订单参与者, When 支付, Then 应抛出 ForbiddenException', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ id: 1, client_id: 1, photographer_id: 2 });

      await expect(service.pay(1, 'alipay', 3)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Scenario: 完成订单', () => {
    it('Given 已支付的订单和摄影师, When 完成, Then 应更新状态为已完成', async () => {
      const mockOrder = { id: 1, client_id: 1, photographer_id: 2, status: 'paid' };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.complete(1, 2);

      expect(mockOrderRepository.update).toHaveBeenCalled();
    });
  });

  describe('Scenario: 退款', () => {
    it('Given 存在的订单, When 退款, Then 应更新状态为已退款', async () => {
      const mockOrder = { id: 1, client_id: 1, photographer_id: 2, status: 'paid' };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.refund(1, '服务不满意', 1);

      expect(mockOrderRepository.update).toHaveBeenCalled();
    });
  });

  describe('Scenario: 查询订单详情', () => {
    it('Given 存在的订单ID, When 查询, Then 应返回订单详情', async () => {
      const mockOrder = {
        id: 1,
        client_id: 1,
        photographer_id: 2,
        status: 'pending',
        client: { id: 1, username: 'client' },
        photographer: { id: 2, username: 'photographer' },
        booking: {},
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockOrder);

      const result = await service.findOne(1, 1);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
    });

    it('Given 不存在的订单ID, When 查询, Then 应抛出 NotFoundException', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
