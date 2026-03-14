import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkin } from './entities/checkin.entity';
import { CheckinSpot } from './entities/checkin-spot.entity';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CheckinsService {
  constructor(
    @InjectRepository(Checkin)
    private checkinsRepository: Repository<Checkin>,
    @InjectRepository(CheckinSpot)
    private spotsRepository: Repository<CheckinSpot>,
    private usersService: UsersService,
  ) {}

  async create(spotId: number, createCheckinDto: CreateCheckinDto, userId: number) {
    const spot = await this.spotsRepository.findOne({ where: { id: spotId } });
    if (!spot) {
      throw new NotFoundException('打卡点不存在');
    }

    const checkin = this.checkinsRepository.create({
      ...createCheckinDto,
      user_id: userId,
      spot_id: spotId,
    });

    const savedCheckin = await this.checkinsRepository.save(checkin);

    // 增加打卡点打卡数
    await this.spotsRepository.increment({ id: spotId }, 'checkins',1);

    // 给用户添加积分
    await this.usersService.addPoints(userId,5, '打卡');

    return this.findOne(savedCheckin.id);
  }

  async findAll(spotId: number, params: { page: number; limit: number }) {
    const { page, limit } = params;

    const [checkins, total] = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .leftJoinAndSelect('checkin.user', 'user')
      .where('checkin.spot_id = :spotId', { spotId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('checkin.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: checkins.map(checkin => this.formatCheckin(checkin)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async findMyCheckins(userId: number, params: { page: number; limit: number }) {
    const { page, limit } = params;

    const [checkins, total] = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .leftJoinAndSelect('checkin.spot', 'spot')
      .where('checkin.user_id = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('checkin.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: checkins.map(checkin => this.formatCheckin(checkin)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async findOne(id: number) {
    const checkin = await this.checkinsRepository
      .createQueryBuilder('checkin')
      .leftJoinAndSelect('checkin.user', 'user')
      .leftJoinAndSelect('checkin.spot', 'spot')
      .where('checkin.id = :id', { id })
      .getOne();

    if (!checkin) {
      throw new NotFoundException('打卡记录不存在');
    }

    return {
      success: true,
      data: this.formatCheckin(checkin),
    };
  }

  async remove(checkinId: number, userId: number) {
    const checkin = await this.checkinsRepository.findOne({
      where: { id: checkinId },
    });

    if (!checkin) {
      throw new NotFoundException('打卡记录不存在');
    }

    if (checkin.user_id !== userId) {
      throw new ForbiddenException('无权删除此打卡记录');
    }

    await this.checkinsRepository.delete(checkinId);

    return {
      success: true,
      message: '打卡记录删除成功',
    };
  }

  private formatCheckin(checkin: Checkin) {
    return {
      id: checkin.id,
      photos: checkin.photos,
      caption: checkin.caption,
      tags: checkin.tags,
      location: checkin.location,
      coordinates: checkin.coordinates ? JSON.parse(checkin.coordinates) : null,
      weather: checkin.weather,
      camera_info: checkin.camera_info,
      likes: checkin.likes,
      comments_count: checkin.comments_count,
      created_at: checkin.created_at,
      user: {
        id: checkin.user.id,
        username: checkin.user.username,
        avatar_url: checkin.user.avatar_url,
      },
      spot: checkin.spot
        ? {
            id: checkin.spot.id,
            name: checkin.spot.name,
            location: checkin.spot.location,
          }
        : null,
    };
  }
}
