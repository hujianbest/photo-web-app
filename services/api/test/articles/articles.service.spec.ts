/**
 * 文章模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from '../../src/modules/articles/articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from '../../src/modules/articles/entities/article.entity';
import { UsersService } from '../../src/modules/users/users.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('Feature: 文章服务', () => {
  let service: ArticlesService;
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
      increment: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    mockUsersService = {
      findOne: jest.fn(),
      addPoints: jest.fn().mockResolvedValue({ points: 115 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  describe('Scenario: 创建文章', () => {
    it('Given 有效文章数据, When 创建文章, Then 应保存并给用户加分', async () => {
      const createDto = {
        title: '人像摄影技巧分享',
        content: '这是一篇关于人像摄影的经验分享...',
        category: 'photography',
      };

      const mockUser = { id: 1, username: 'testuser' };
      const mockArticle = {
        id: 1,
        ...createDto,
        user_id: 1,
        status: 'published',
        user: mockUser,
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockRepository.create.mockReturnValue(mockArticle);
      mockRepository.save.mockResolvedValue(mockArticle);
      mockQueryBuilder.getOne.mockResolvedValue(mockArticle);

      const result = await service.create(createDto as any, 1);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockUsersService.addPoints).toHaveBeenCalledWith(1, 15, '发布文章');
    });

    it('Given 不存在的用户, When 创建文章, Then 应抛出 NotFoundException', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.create({ title: 'test', content: 'content' } as any, 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Scenario: 查询文章列表', () => {
    it('Given 分页参数, When 查询文章列表, Then 应返回分页结果', async () => {
      const mockArticles = [
        { id: 1, title: '文章1', views: 100, user: { id: 1 } },
        { id: 2, title: '文章2', views: 200, user: { id: 2 } },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockArticles, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(2);
    });

    it('Given 分类筛选参数, When 查询文章, Then 应过滤结果', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10, category: 'photography' });

      expect(result.success).toBe(true);
    });

    it('Given 排序参数, When 查询文章, Then 应按指定字段排序', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10, sort: 'popular' });

      expect(result.success).toBe(true);
    });
  });

  describe('Scenario: 查看文章详情', () => {
    it('Given 文章ID, When 查看文章, Then 应返回详情并增加浏览量', async () => {
      const mockArticle = {
        id: 1,
        title: '测试文章',
        views: 100,
        status: 'published',
        user: { id: 1, username: 'author' },
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockArticle);
      mockRepository.increment.mockResolvedValue({ affected: 1 });

      const result = await service.findOne(1);

      expect(result.success).toBe(true);
      expect(mockRepository.increment).toHaveBeenCalled();
    });

    it('Given 不存在的文章ID, When 查看文章, Then 应抛出 NotFoundException', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Scenario: 更新文章', () => {
    it('Given 文章ID和作者ID, When 更新, Then 应保存更改', async () => {
      const updateDto = { title: '更新后的标题' };
      const mockArticle = { id: 1, user_id: 1, title: '原标题' };

      mockRepository.findOne.mockResolvedValue(mockArticle);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockQueryBuilder.getOne.mockResolvedValue({ ...mockArticle, ...updateDto, user: { id: 1 } });

      const result = await service.update(1, updateDto as any, 1);

      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('Given 非作者, When 更新, Then 应抛出 ForbiddenException', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, user_id: 1 });

      await expect(service.update(1, { title: 'test' } as any, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Scenario: 删除文章', () => {
    it('Given 文章ID和作者ID, When 删除, Then 应删除文章', async () => {
      const mockArticle = { id: 1, user_id: 1 };

      mockRepository.findOne.mockResolvedValue(mockArticle);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1, 1);

      expect(result.success).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('Given 非作者, When 删除, Then 应抛出 ForbiddenException', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, user_id: 1 });

      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });
});
