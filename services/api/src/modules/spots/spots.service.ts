import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckinSpot } from './entities/checkin-spot.entity';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class SpotsService {
  constructor(
    @InjectRepository(CheckinSpot)
    private spotsRepository: Repository<CheckinSpot>,
    private usersService: UsersService,
  ) {}

  async create(createSpotDto: CreateSpotDto, userId: number) {
    const spot = this.spotsRepository.create({
      ...createSpotDto,
      creator_id: userId,
    });

    const savedSpot = await this.spotsRepository.save(spot);

    // 给用户添加积分
    await this.usersService.addPoints(userId, 5, '创建打卡点');

    return this.findOne(savedSpot.id, userId);
  }

  async findAll(params: {
    page: number;
    limit: number;
    city?: string;
    category?: string;
    sort?: string;
  }) {
    const { page, limit, city, category, sort = 'popular' } = params;

    const queryBuilder = this.spotsRepository
      .createQueryBuilder('spot')
      .leftJoinAndSelect('spot.creator', 'creator')
      .where('spot.status = :status', { status: 'active' });

    if (city) {
      queryBuilder.andWhere('spot.city = :city', { city });
    }

    if (category) {
      queryBuilder.andWhere('spot.category = :category', { category });
    }

    // 排序
    switch (sort) {
      case 'rating':
        queryBuilder.orderBy('spot.rating', 'DESC');
        break;
      case 'checkins':
        queryBuilder.orderBy('spot.checkins', 'DESC');
        break;
      case 'latest':
        queryBuilder.orderBy('spot.created_at', 'DESC');
        break;
      case 'popular':
      default:
        queryBuilder.orderBy('spot.views', 'DESC');
        break;
    }

    const [spots, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: spots.map(spot => this.formatSpot(spot)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async search(query: string, params: { lat?: number; lng?: number; radius?: number }) {
    const { lat, lng, radius = 5000 } = params;

    const spots = await this.spotsRepository
      .createQueryBuilder('spot')
      .leftJoinAndSelect('spot.creator', 'creator')
      .where('spot.status = :status', { status: 'active' })
      .andWhere(
        '(spot.name ILIKE :query OR spot.description ILIKE :query OR spot.location ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('spot.views', 'DESC')
      .limit(20)
      .getMany();

    // 如果提供了坐标，计算距离并过滤
    let filteredSpots = spots;
    if (lat && lng) {
      filteredSpots = spots.filter(spot => {
        if (!spot.coordinates) return false;
        const spotCoords = JSON.parse(spot.coordinates);
        const distance = this.calculateDistance(
          lat,
          lng,
          spotCoords.coordinates[1],
          spotCoords.coordinates[0],
        );
        return distance <= radius;
      });
    }

    return {
      success: true,
      data: {
        items: filteredSpots.map(spot => this.formatSpot(spot)),
        query,
        count: filteredSpots.length,
      },
    };
  }

  async findNearby(lat: number, lng: number, radius: number, limit: number) {
    const spots = await this.spotsRepository
      .createQueryBuilder('spot')
      .leftJoinAndSelect('spot.creator', 'creator')
      .where('spot.status = :status', { status: 'active' })
      .getMany();

    // 计算距离并过滤
    const spotsWithDistance = spots
      .filter(spot => {
        if (!spot.coordinates) return false;
        const spotCoords = JSON.parse(spot.coordinates);
        const distance = this.calculateDistance(
          lat,
          lng,
          spotCoords.coordinates[1],
          spotCoords.coordinates[0],
        );
        return distance <= radius;
      })
      .map(spot => {
        const spotCoords = JSON.parse(spot.coordinates);
        const distance = this.calculateDistance(
          lat,
          lng,
          spotCoords.coordinates[1],
          spotCoords.coordinates[0],
        );
        return {
          ...this.formatSpot(spot),
          distance: Math.round(distance),
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return {
      success: true,
      data: {
        items: spotsWithDistance,
        center: { lat, lng },
        radius,
      },
    };
  }

  async getCities() {
    const cities = await this.spotsRepository
      .createQueryBuilder('spot')
      .select('spot.city', 'city')
      .where('spot.status = :status', { status: 'active' })
      .andWhere('spot.city IS NOT NULL')
      .groupBy('spot.city')
      .orderBy('COUNT(spot.id)', 'DESC')
      .getRawMany();

    return {
      success: true,
      data: cities.map(item => ({
        name: item.city,
        count: await this.spotsRepository.count({
          where: { city: item.city, status: 'active' },
        }),
      })),
    };
  }

  async findOne(id: number, currentUserId?: number) {
    const spot = await this.spotsRepository
      .createQueryBuilder('spot')
      .leftJoinAndSelect('spot.creator', 'creator')
      .where('spot.id = :id', { id })
      .getOne();

    if (!spot) {
      throw new NotFoundException('打卡点不存在');
    }

    // 增加浏览量
    await this.spotsRepository.increment({ id }, 'views', 1);

    return {
      success: true,
      data: this.formatSpot(spot, currentUserId),
    };
  }

  async update(id: number, updateSpotDto: UpdateSpotDto, userId: number) {
    const spot = await this.spotsRepository.findOne({ where: { id } });

    if (!spot) {
      throw new NotFoundException('打卡点不存在');
    }

    if (spot.creator_id !== userId) {
      throw new ForbiddenException('无权修改此打卡点');
    }

    await this.spotsRepository.update(id, updateSpotDto);

    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    const spot = await this.spotsRepository.findOne({ where: { id } });

    if (!spot) {
      throw new NotFoundException('打卡点不存在');
    }

    if (spot.creator_id !== userId) {
      throw new ForbiddenException('无权删除此打卡点');
    }

    await this.spotsRepository.update(id, { status: 'deleted' });

    return {
      success: true,
      message: '打卡点删除成功',
    };
  }

  private formatSpot(spot: CheckinSpot, currentUserId?: number) {
    return {
      id: spot.id,
      name: spot.name,
      description: spot.description,
      location: spot.location,
      coordinates: spot.coordinates ? JSON.parse(spot.coordinates) : null,
      city: spot.city,
      province: spot.province,
      images: spot.images,
      best_time: spot.best_time,
      tips: spot.tips,
      category: spot.category,
      difficulty: spot.difficulty,
      views: spot.views,
      checkins: spot.checkins,
      rating: spot.rating,
      created_at: spot.created_at,
      updated_at: spot.updated_at,
      creator: spot.creator ? {
        id: spot.creator.id,
        username: spot.creator.username,
        avatar_url: spot.creator.avatar_url,
      } : null,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // 返回米
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
