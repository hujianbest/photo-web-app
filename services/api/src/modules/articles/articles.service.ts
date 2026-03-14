import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    private usersService: UsersService,
  ) {}

  async create(createArticleDto: CreateArticleDto, userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const article = this.articlesRepository.create({
      ...createArticleDto,
      user_id: userId,
      status: 'published',
      published_at: new Date(),
    });

    const savedArticle = await this.articlesRepository.save(article);

    // 给用户添加积分
    await this.usersService.addPoints(userId, 15, '发布文章');

    return this.findOne(savedArticle.id, userId);
  }

  async findAll(params: {
    page: number;
    limit: number;
    category?: string;
    sort?: string;
  }) {
    const { page, limit, category, sort = 'latest' } = params;

    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .where('article.status = :status', { status: 'published' });

    if (category) {
      queryBuilder.andWhere('article.category = :category', { category });
    }

    // 排序
    switch (sort) {
      case 'popular':
        queryBuilder.orderBy('article.views', 'DESC');
        break;
      case 'latest':
      default:
        queryBuilder.orderBy('article.published_at', 'DESC');
        break;
    }

    const [articles, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: articles.map(article => this.formatArticle(article)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async search(query: string, params: { page: number }) {
    const { page } = params;
    const limit = 20;

    const [articles, total] = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .where('article.status = :status', { status: 'published' })
      .andWhere(
        '(article.title ILIKE :query OR article.summary ILIKE :query OR article.content ILIKE :query OR :query = ANY(article.tags))',
        { query: `%${query}%` },
      )
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: articles.map(article => this.formatArticle(article)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
        query,
      },
    };
  }

  async findOne(id: number, currentUserId?: number) {
    const article = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .where('article.id = :id', { id })
      .getOne();

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 增加浏览量
    await this.articlesRepository.increment({ id }, 'views', 1);

    return {
      success: true,
      data: this.formatArticle(article, currentUserId),
    };
  }

  async update(id: number, createArticleDto: CreateArticleDto, userId: number) {
    const article = await this.articlesRepository.findOne({ where: { id } });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    if (article.user_id !== userId) {
      throw new ForbiddenException('无权修改此文章');
    }

    await this.articlesRepository.update(id, createArticleDto);

    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    const article = await this.articlesRepository.findOne({ where: { id } });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    if (article.user_id !== userId) {
      throw new ForbiddenException('无权删除此文章');
    }

    await this.articlesRepository.delete(id);

    return {
      success: true,
      message: '文章删除成功',
    };
  }

  async publish(id: number, userId: number) {
    const article = await this.articlesRepository.findOne({ where: { id } });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    if (article.user_id !== userId) {
      throw new ForbiddenException('无权操作此文章');
    }

    await this.articlesRepository.update(id, {
      status: 'published',
      published_at: new Date(),
    });

    return this.findOne(id, userId);
  }

  private formatArticle(article: Article, currentUserId?: number) {
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      cover_image: article.cover_image,
      category: article.category,
      tags: article.tags,
      equipment: article.equipment,
      camera_settings: article.camera_settings,
      poses: article.poses,
      views: article.views,
      likes: article.likes,
      comments_count: article.comments_count,
      is_featured: article.is_featured,
      created_at: article.created_at,
      updated_at: article.updated_at,
      published_at: article.published_at,
      user: {
        id: article.user.id,
        username: article.user.username,
        avatar_url: article.user.avatar_url,
        bio: article.user.bio,
      },
      is_liked: false, // TODO: 根据currentUserId检查是否点赞
    };
  }
}
