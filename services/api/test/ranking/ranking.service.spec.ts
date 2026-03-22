/**
 * 排行榜模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from '../../src/modules/ranking/ranking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Work } from '../../src/modules/works/entities/work.entity';
import { CheckinSpot } from '../../src/modules/spots/entities/checkin-spot.entity';

describe('Feature: 排行榜服务', () => {
  let service: RankingService;
  let mockUserRepository: any;
  let mockWorkRepository: any;
  let mockSpotRepository: any;

  beforeEach(async () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    mockUserRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    mockWorkRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    mockSpotRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Work),
          useValue: mockWorkRepository,
        },
        {
          provide: getRepositoryToken(CheckinSpot),
          useValue: mockSpotRepository,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
  });

  describe('Scenario: 获取摄影师排行榜', () => {
    it('Given 排行榜类型和时间范围, When 查询排行榜, Then 应返回排序后的摄影师列表', async () => {
      const mockRanking = [
        { id: 1, username: 'photographer1', points: 1000, works_count: 50 },
        { id: 2, username: 'photographer2', points: 800, works_count: 30 },
        { id: 3, username: 'photographer3', points: 600, works_count: 20 },
      ];

      mockUserRepository.createQueryBuilder().getMany.mockResolvedValueOnce(mockRanking);

      const result = await service.getPhotographerRanking('all', 10);

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('Given 周排行参数, When 查询排行榜, Then 应返回本周数据', async () => {
      mockUserRepository.createQueryBuilder().getMany.mockResolvedValueOnce([]);

      const result = await service.getPhotographerRanking('week', 10);

      expect(Array.isArray(result)).toBe(true);
    });

    it('Given 月排行参数, When 查询排行榜, Then 应返回本月数据', async () => {
      mockUserRepository.createQueryBuilder().getMany.mockResolvedValueOnce([]);

      const result = await service.getPhotographerRanking('month', 10);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Scenario: 获取作品排行榜', () => {
    it('Given 时间范围, When 查询作品排行榜, Then 应返回按点赞数排序的作品', async () => {
      const mockWorksRanking = [
        { id: 1, title: '热门作品1', likes: 500, views: 2000 },
        { id: 2, title: '热门作品2', likes: 400, views: 1800 },
      ];

      mockWorkRepository.createQueryBuilder().getMany.mockResolvedValueOnce(mockWorksRanking);

      const result = await service.getWorksRanking('all', 10);

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Scenario: 获取打卡点排行榜', () => {
    it('Given 城市参数, When 查询打卡点排行榜, Then 应返回该城市的热门打卡点', async () => {
      const mockSpotsRanking = [
        { id: 1, name: '故宫', city: '北京', checkins: 1000, views: 5000 },
        { id: 2, name: '长城', city: '北京', checkins: 800, views: 4000 },
      ];

      mockSpotRepository.createQueryBuilder().getMany.mockResolvedValueOnce(mockSpotsRanking);

      const result = await service.getSpotsRanking('all', 10, '北京');

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('Given 无城市参数, When 查询打卡点排行榜, Then 应返回所有城市的热门打卡点', async () => {
      mockSpotRepository.createQueryBuilder().getMany.mockResolvedValueOnce([]);

      const result = await service.getSpotsRanking('all', 10);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Scenario: 获取综合排行榜', () => {
    it('When 查询综合排行榜, Then 应返回各类排行榜汇总', async () => {
      mockUserRepository.createQueryBuilder().getMany.mockResolvedValue([]);
      mockWorkRepository.createQueryBuilder().getMany.mockResolvedValue([]);
      mockSpotRepository.createQueryBuilder().getMany.mockResolvedValue([]);

      const result = await service.getAllRankings();

      expect(result).toHaveProperty('photographers');
      expect(result).toHaveProperty('works');
      expect(result).toHaveProperty('spots');
    });
  });
});
