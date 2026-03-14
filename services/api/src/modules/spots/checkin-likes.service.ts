import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckinLike } from './entities/checkin-like.entity';
import { Checkin } from './entities/checkin.entity';

@Injectable()
export class CheckinLikesService {
  constructor(
    @InjectRepository(CheckinLike)
    private checkinLikesRepository: Repository<CheckinLike>,
    @InjectRepository(Checkin)
    private checkinsRepository: Repository<Checkin>,
  ) {}

  async likeCheckin(checkinId: number, userId: number) {
    const checkin = await this.checkinsRepository.findOne({
      where: { id: checkinId },
    });
    if (!checkin) {
      throw new NotFoundException('打卡记录不存在');
    }

    // 检查是否已点赞
    const existingLike = await this.checkinLikesRepository.findOne({
      where: { checkin_id: checkinId, user_id: userId },
    });

    if (existingLike) {
      return {
        success: true,
        message: '已经点赞过了',
      };
    }

    // 创建点赞记录
    await this.checkinLikesRepository.save({
      checkin_id: checkinId,
      user_id: userId,
    });

    // 增加打卡点赞数
    await this.checkinsRepository.increment({ id: checkinId }, 'likes',1);

    return {
      success: true,
      message: '点赞成功',
    };
  }

  async unlikeCheckin(checkinId: number, userId: number) {
    const checkin = await this.checkinsRepository.findOne({
      where: { id: checkinId },
    });
    if (!checkin) {
      throw new NotFoundException('打卡记录不存在');
    }

    // 检查是否已点赞
    const existingLike = await this.checkinLikesRepository.findOne({
      where: { checkin_id: checkinId, user_id: userId },
    });

    if (!existingLike) {
      return {
        success: true,
        message: '未点赞',
      };
    }

    // 删除点赞记录
    await this.checkinLikesRepository.delete({
      checkin_id: checkinId,
      user_id: userId,
    });

    // 减少打卡点赞数
    await this.checkinsRepository.decrement({ id: checkinId }, 'likes',1);

    return {
      success: true,
      message: '取消点赞成功',
    };
  }

  async findCheckinLikes(checkinId: number, page = 1, limit = 20) {
    const [likes, total] = await this.checkinLikesRepository
      .createQueryBuilder('like')
      .leftJoinAndSelect('like.user', 'user')
      .where('like.checkin_id = :checkinId', { checkinId })
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
}
