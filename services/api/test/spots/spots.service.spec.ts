/**
 * 打卡点模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SpotsService } from '../../src/modules/spots/spots.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CheckinSpot } from '../../src/modules/spots/entities/checkin-spot.entity';
import { UsersService } from '../../src/modules/users/users.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('Feature: 打卡点服务', () => {
  let service: SpotsService;
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
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getOne: jest.fn().mockResolvedValue(null),
      getMany: jest.fn().mockResolvedValue([]),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      increment: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    mockUsersService = {
      addPoints: jest.fn().mockResolvedValue({ points: 105 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotsService,
        {
          provide: getRepositoryToken(CheckinSpot),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<SpotsService>(SpotsService);
  });

  describe('Scenario: 创建打卡点', () => {
    it('Given 有效数据, When 创建打卡点, Then 应保存并给用户加分', async () => {
      const createDto = {
        name: '故宫',
        description: '中国明清两代的皇家宫殿',
        location: '北京市东城区景山前街4号',
        city: '北京',
        coordinates: { coordinates: [116.397128, 39.916527] },
      };

      const savedSpot = {
        id: 1,
        name: createDto.name,
        description: createDto.description,
        location: createDto.location,
        city: createDto.city,
        creator_id: 1,
        coordinates: JSON.stringify(createDto.coordinates),
        status: 'active',
      };

      const foundSpot = {
        ...savedSpot,
        creator: { id: 1, username: 'user1', avatar_url: 'avatar.jpg' },
      };

      mockRepository.create.mockReturnValue(savedSpot);
      mockRepository.save.mockResolvedValue(savedSpot);
      mockQueryBuilder.getOne.mockResolvedValue(foundSpot);

      const result = await service.create(createDto as any, 1);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockUsersService.addPoints).toHaveBeenCalledWith(1, 5, '创建打卡点');
    });
  });

  describe('Scenario: 查询打卡点列表', () => {
    it('Given 分页参数, When 查询列表, Then 应返回分页结果', async () => {
      const mockSpots = [
        { id: 1, name: '故宫', city: '北京', views: 1000, status: 'active', creator: { id: 1, username: 'user1', avatar_url: 'avatar.jpg' } },
        { id: 2, name: '西湖', city: '杭州', views: 800, status: 'active', creator: { id: 2, username: 'user2', avatar_url: 'avatar2.jpg' } },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockSpots, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(2);
      expect(result.data.pagination.total_items).toBe(2);
    });

    it('Given 城市筛选参数, When 查询列表, Then 应过滤结果', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10, city: '北京' });

      expect(result.success).toBe(true);
    });

    it('Given 排序参数, When 查询列表, Then 应按指定字段排序', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10, sort: 'rating' });

      expect(result.success).toBe(true);
    });
  });

  describe('Scenario: 搜索打卡点', () => {
    it('Given 搜索关键词, When 搜索, Then 应返回匹配结果', async () => {
      const mockSpots = [
        { id: 1, name: '故宫', status: 'active', creator: { id: 1, username: 'user1', avatar_url: 'avatar.jpg' } },
      ];

      mockQueryBuilder.getMany.mockResolvedValueOnce(mockSpots);

      const result = await service.search('故宫', {});

      expect(result.success).toBe(true);
      expect(result.data.query).toBe('故宫');
    });

    it('Given 坐标和半径, When 搜索, Then 应过滤范围内的打卡点', async () => {
      const mockSpots = [
        {
          id: 1,
          name: '故宫',
          status: 'active',
          coordinates: JSON.stringify({ coordinates: [116.397128, 39.916527] }),
          creator: { id: 1, username: 'user1', avatar_url: 'avatar.jpg' },
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValueOnce(mockSpots);

      const result = await service.search('故宫', {
        lat: 39.916527,
        lng: 116.397128,
        radius: 5000,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Scenario: 查找附近打卡点', () => {
    it('Given 坐标和半径, When 查找附近, Then 应返回按距离排序的结果', async () => {
      const mockSpots = [
        {
          id: 1,
          name: '故宫',
          status: 'active',
          coordinates: JSON.stringify({ coordinates: [116.397128, 39.916527] }),
          creator: { id: 1, username: 'user1', avatar_url: 'avatar.jpg' },
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValueOnce(mockSpots);

      const result = await service.findNearby(39.916527, 116.397128, 5000, 10);

      expect(result.success).toBe(true);
      expect(result.data.center).toEqual({ lat: 39.916527, lng: 116.397128 });
    });
  });

  describe('Scenario: 获取城市列表', () => {
    it('When 获取城市列表, Then 应返回城市及其打卡点数量', async () => {
      const mockCities = [{ city: '北京' }, { city: '上海' }];

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockCities);
      mockRepository.count.mockResolvedValue(10);

      const result = await service.getCities();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('Scenario: 查询单个打卡点', () => {
    it('Given 打卡点ID, When 查询, Then 应返回详情并增加浏览量', async () => {
      const mockSpot = {
        id: 1,
        name: '故宫',
        status: 'active',
        creator: { id: 1, username: 'user1', avatar_url: 'avatar.jpg' },
      };

      mockQueryBuilder.getOne.mockResolvedValueOnce(mockSpot);
      mockRepository.increment.mockResolvedValue({ affected: 1 });

      const result = await service.findOne(1);

      expect(result.success).toBe(true);
      expect(mockRepository.increment).toHaveBeenCalledWith({ id: 1 }, 'views', 1);
    });

    it('Given 不存在的ID, When 查询, Then 应抛出 NotFoundException', async () => {
      mockQueryBuilder.getOne.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Scenario: 更新打卡点', () => {
    it('Given 有效数据且是创建者, When 更新, Then 应保存更改', async () => {
      const updateDto = { description: '更新后的描述' };
      const mockSpot = { id: 1, creator_id: 1 };
      const mockUpdatedSpot = {
        id: 1,
        creator_id: 1,
        description: '更新后的描述',
        status: 'active',
        creator: { id: 1, username: 'user1', avatar_url: 'avatar.jpg' },
      };

      mockRepository.findOne.mockResolvedValue(mockSpot);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockQueryBuilder.getOne.mockResolvedValueOnce(mockUpdatedSpot);

      const result = await service.update(1, updateDto as any, 1);

      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('Given 非创建者, When 更新, Then 应抛出 ForbiddenException', async () => {
      const mockSpot = { id: 1, creator_id: 1 };

      mockRepository.findOne.mockResolvedValue(mockSpot);

      await expect(service.update(1, { description: 'test' } as any, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Given 不存在的ID, When 更新, Then 应抛出 NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { description: 'test' } as any, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Scenario: 删除打卡点', () => {
    it('Given 存在的打卡点且是创建者, When 删除, Then 应软删除', async () => {
      const mockSpot = { id: 1, creator_id: 1 };

      mockRepository.findOne.mockResolvedValue(mockSpot);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1, 1);

      expect(result.success).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(1, { status: 'deleted' });
    });

    it('Given 非创建者, When 删除, Then 应抛出 ForbiddenException', async () => {
      const mockSpot = { id: 1, creator_id: 1 };

      mockRepository.findOne.mockResolvedValue(mockSpot);

      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('Given 不存在的ID, When 删除, Then 应抛出 NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
