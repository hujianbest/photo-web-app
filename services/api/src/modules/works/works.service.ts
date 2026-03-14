import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Work } from './entities/work.entity';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private worksRepository: Repository<Work>,
    private usersService: UsersService,
  ) {}

  async create(createWorkDto: CreateWorkDto, userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const work = this.worksRepository.create({
      ...createWorkDto,
      user_id: userId,
      status: 'published',
      published_at: new Date(),
    });

    const savedWork = await this.worksRepository.save(work);

    // 给用户添加积分
    await this.usersService.addPoints(userId, 10, '发布作品');

    return this.findOne(savedWork.id, userId);
  }

  async findAll(params: {
    page: number;
    limit: number;
    category?: string;
    sort?: string;
    userId?: number;
  }) {
    const { page, limit, category, sort = 'latest', userId } = params;

    const queryBuilder = this.worksRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.user', 'user')
      .where('work.status = :status', { status: 'published' });

    if (category) {
      queryBuilder.andWhere('work.category = :category', { category });
    }

    if (userId) {
      queryBuilder.andWhere('work.user_id = :userId', { userId });
    }

    // 排序
    switch (sort) {
      case 'popular':
        queryBuilder.orderBy('work.views', 'DESC');
        break;
      case 'random':
        queryBuilder.orderBy('RANDOM()');
        break;
      case 'latest':
      default:
        queryBuilder.orderBy('work.published_at', 'DESC');
        break;
    }

    const [works, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: works.map(work => this.formatWork(work)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async findFeatured() {
    const works = await this.worksRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.user', 'user')
      .where('work.status = :status', { status: 'published' })
      .andWhere('work.is_featured = :featured', { featured: true })
      .orderBy('work.published_at', 'DESC')
      .limit(10)
      .getMany();

    return {
      success: true,
      data: works.map(work => this.formatWork(work)),
    };
  }

  async search(query: string, params: { page: number }) {
    const { page } = params;
    const limit = 20;

    const [works, total] = await this.worksRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.user', 'user')
      .where('work.status = :status', { status: 'published' })
      .andWhere(
        '(work.title ILIKE :query OR work.description ILIKE :query OR :query = ANY(work.tags))',
        { query: `%${query}%` },
      )
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: works.map(work => this.formatWork(work)),
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

  async getCategories() {
    const categories = await this.worksRepository
      .createQueryBuilder('work')
      .select('work.category', 'category')
      .where('work.status = :status', { status: 'published' })
      .andWhere('work.category IS NOT NULL')
      .groupBy('work.category')
      .orderBy('COUNT(work.id)', 'DESC')
      .getRawMany();

    return {
      success: true,
      data: categories.map(item => ({
        name: item.category,
        count: await this.worksRepository.count({
          where: { category: item.category, status: 'published' },
        }),
      })),
    };
  }

  async findOne(id: number, currentUserId?: number) {
    const work = await this.worksRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.user', 'user')
      .where('work.id = :id', { id })
      .getOne();

    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    // 增加浏览量
    await this.worksRepository.increment({ id }, 'views', 1);

    return {
      success: true,
      data: this.formatWork(work, currentUserId),
    };
  }

  async update(id: number, updateWorkDto: UpdateWorkDto, userId: number) {
    const work = await this.worksRepository.findOne({ where: { id } });

    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    if (work.user_id !== userId) {
      throw new ForbiddenException('无权修改此作品');
    }

    await this.worksRepository.update(id, updateWorkDto);

    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    const work = await this.worksRepository.findOne({ where: { id } });

    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    if (work.user_id !== userId) {
      throw new ForbiddenException('无权删除此作品');
    }

    await this.worksRepository.delete(id);

    return {
      success: true,
      message: '作品删除成功',
    };
  }

  async publish(id: number, userId: number) {
    const work = await this.worksRepository.findOne({ where: { id } });

    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    if (work.user_id !== userId) {
      throw new ForbiddenException('无权操作此作品');
    }

    await this.worksRepository.update(id, {
      status: 'published',
      published_at: new Date(),
    });

    return this.findOne(id, userId);
  }

  async unpublish(id: number, userId: number) {
    const work = await this.worksRepository.findOne({ where: { id } });

    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    if (work.user_id !== userId) {
      throw new ForbiddenException('无权操作此作品');
    }

    await this.worksRepository.update(id, {
      status: 'draft',
    });

    return {
      success: true,
      message: '作品已取消发布',
    };
  }

  private formatWork(work: Work, currentUserId?: number) {
    return {
      id: work.id,
      title: work.title,
      description: work.description,
      images: work.images,
      category: work.category,
      tags: work.tags,
      camera_info: work.camera_info,
      location: work.location,
      coordinates: work.coordinates,
      views: work.views,
      likes: work.likes,
      comments_count: work.comments_count,
      is_featured: work.is_featured,
      created_at: work.created_at,
      updated_at: work.updated_at,
      user: {
        id: work.user.id,
        username: work.user.username,
        avatar_url: work.user.avatar_url,
      },
      is_liked: false, // TODO: 根据currentUserId检查是否点赞
    };
  }
}