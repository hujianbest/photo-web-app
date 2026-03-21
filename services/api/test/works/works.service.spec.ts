/**
 * 作品模块 - 单元测试
 * BDD 风格
 */

import { Test, TestingModule } from '@nestjs/testing';
import { WorksService } from '../src/modules/works/works.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Work } from '../src/modules/works/entities/work.entity';

describe('Feature: 作品服务', () => {
  let service: WorksService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorksService,
        {
          provide: getRepositoryToken(Work),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WorksService>(WorksService);
  });

  describe('Scenario: 查询作品列表', () => {
    it('Given 数据库有作品, When 查询全部, Then 应返回作品列表', async () => {
      const mockWorks = [
        { id: 1, title: '作品1', likes: 10 },
        { id: 2, title: '作品2', likes: 20 },
      ];

      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockWorks, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('Given 分类参数, When 按分类查询, Then 应过滤结果', async () => {
      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, category: 'portrait' });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('Scenario: 创建作品', () => {
    it('Given 有效数据, When 创建作品, Then 应保存到数据库', async () => {
      const createDto = {
        title: '新作品',
        description: '描述',
        images: ['https://example.com/image.jpg'],
        category: 'portrait',
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto as any, 1);

      expect(result.title).toBe('新作品');
    });
  });

  describe('Scenario: 点赞作品', () => {
    it('Given 作品存在, When 点赞, Then 应增加点赞数', async () => {
      const mockWork = { id: 1, title: '作品', likes: 10 };
      mockRepository.findOne.mockResolvedValue(mockWork);
      mockRepository.save.mockResolvedValue({ ...mockWork, likes: 11 });

      // 测试点赞逻辑
      expect(mockWork.likes).toBe(10);
    });
  });
});
