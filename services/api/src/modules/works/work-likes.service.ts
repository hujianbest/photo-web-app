import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkLike } from './entities/work-likes.entity';
import { Work } from './entities/work.entity';

@Injectable()
export class WorkLikesService {
  constructor(
    @InjectRepository(WorkLike)
    private workLikesRepository: Repository<WorkLike>,
    @InjectRepository(Work)
    private worksRepository: Repository<Work>,
  ) {}

  async likeWork(workId: number, userId: number) {
    const work = await this.worksRepository.findOne({ where: { id: workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    // 检查是否已点赞
    const existingLike = await this.workLikesRepository.findOne({
      where: { work_id: workId, user_id: userId },
    });

    if (existingLike) {
      return {
        success: true,
        message: '已经点赞过了',
      };
    }

    // 创建点赞记录
    await this.workLikesRepository.save({
      work_id: workId,
      user_id: userId,
    });

    // 增加作品点赞数
    await this.worksRepository.increment({ id: workId }, 'likes', 1);

    return {
      success: true,
      message: '点赞成功',
    };
  }

  async unlikeWork(workId: number, userId: number) {
    const work = await this.worksRepository.findOne({ where: { id: workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    // 检查是否已点赞
    const existingLike = await this.workLikesRepository.findOne({
      where: { work_id: workId, user_id: userId },
    });

    if (!existingLike) {
      return {
        success: true,
        message: '未点赞',
      };
    }

    // 删除点赞记录
    await this.workLikesRepository.delete({
      work_id: workId,
      user_id: userId,
    });

    // 减少作品点赞数
    await this.worksRepository.decrement({ id: workId }, 'likes', 1);

    return {
      success: true,
      message: '取消点赞成功',
    };
  }

  async findWorkLikes(workId: number, page = 1, limit = 20) {
    const [likes, total] = await this.workLikesRepository
      .createQueryBuilder('like')
      .leftJoinAndSelect('like.user', 'user')
      .where('like.work_id = :workId', { workId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('like.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: likes.map(like => ({
          id: like.id,
          user: {
            id: like.user.id,
            username: like.user.username,
            avatar_url: like.user.avatar_url,
          },
          created_at: like.created_at,
        })),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async checkLike(workId: number, userId: number) {
    const like = await this.workLikesRepository.findOne({
      where: { work_id: workId, user_id: userId },
    });

    return {
      success: true,
      data: {
        is_liked: !!like,
      },
    };
  }
}