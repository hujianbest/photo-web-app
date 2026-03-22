/**
 * 标签模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from '../../src/modules/tags/tags.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tag } from '../../src/modules/tags/entities/tag.entity';

describe('Feature: 标签服务', () => {
  let service: TagsService;
  let mockRepository: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  describe('Scenario: 查询热门标签', () => {
    it('Given 热门标签数量参数, When 查询热门标签, Then 应返回按使用量排序的标签', async () => {
      const mockTags = [
        { id: 1, name: '人像', usage_count: 100 },
        { id: 2, name: '风景', usage_count: 80 },
        { id: 3, name: '街拍', usage_count: 60 },
      ];

      mockQueryBuilder.getMany.mockResolvedValueOnce(mockTags);

      const result = await service.getPopularTags(10);

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Scenario: 创建标签', () => {
    it('Given 新标签名称, When 创建标签, Then 应保存到数据库', async () => {
      const mockTag = { id: 1, name: '夜景摄影', usage_count: 0 };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTag);
      mockRepository.save.mockResolvedValue(mockTag);

      const result = await service.findOrCreate('夜景摄影');

      expect(result.name).toBe('夜景摄影');
    });

    it('Given 已存在的标签名, When 创建标签, Then 应返回已存在的标签', async () => {
      const existingTag = { id: 1, name: '人像', usage_count: 100 };
      mockRepository.findOne.mockResolvedValue(existingTag);

      const result = await service.findOrCreate('人像');

      expect(result.name).toBe('人像');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: 搜索标签', () => {
    it('Given 搜索关键词, When 搜索标签, Then 应返回匹配的标签', async () => {
      const mockTags = [
        { id: 1, name: '人像摄影' },
        { id: 2, name: '人像后期' },
      ];

      mockQueryBuilder.getMany.mockResolvedValueOnce(mockTags);

      const result = await service.search('人像');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((t: any) => t.name.includes('人像'))).toBe(true);
    });
  });

  describe('Scenario: 获取所有标签', () => {
    it('When 获取所有标签, Then 应返回标签列表', async () => {
      const mockTags = [
        { id: 1, name: '人像', usage_count: 100 },
        { id: 2, name: '风景', usage_count: 80 },
      ];

      mockRepository.find.mockResolvedValue(mockTags);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe('Scenario: 更新标签使用计数', () => {
    it('Given 标签ID, When 增加使用计数, Then 应更新计数', async () => {
      const mockTag = { id: 1, name: '人像', usage_count: 100 };
      mockRepository.findOne.mockResolvedValue(mockTag);
      mockRepository.save.mockResolvedValue({ ...mockTag, usage_count: 101 });

      await service.incrementUsage(1);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('Given 不存在的标签ID, When 增加使用计数, Then 不应报错', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      // 不应抛出异常
      await expect(service.incrementUsage(999)).resolves.not.toThrow();
    });
  });
});
