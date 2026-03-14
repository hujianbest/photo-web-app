import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingRequest } from './entities/booking-request.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingRequest)
    private bookingsRepository: Repository<BookingRequest>,
    private usersService: UsersService,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const targetUser = await this.usersService.findOne(
      createBookingDto.target_user_id,
    );
    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    // 检查是否在约拍自己
    if (createBookingDto.target_user_id === userId) {
      throw new ForbiddenException('不能约拍自己');
    }

    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      requester_id: userId,
      response_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后过期
    });

    const savedBooking = await this.bookingsRepository.save(booking);

    return this.findOne(savedBooking.id, userId);
  }

  async findAll(params: {
    userId: number;
    page: number;
    limit: number;
    type?: string;
    status?: string;
  }) {
    const { userId, page, limit, type, status } = params;

    const queryBuilder = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.requester', 'requester')
      .leftJoinAndSelect('booking.targetUser', 'targetUser')
      .where(
        '(booking.requester_id = :userId OR booking.target_user_id = :userId)',
        { userId },
      );

    if (type) {
      queryBuilder.andWhere('booking.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    const [bookings, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('booking.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: bookings.map(booking => this.formatBooking(booking, userId)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async findSent(userId: number, params: { page: number }) {
    const { page } = params;
    const limit = 20;

    const [bookings, total] = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.targetUser', 'targetUser')
      .where('booking.requester_id = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('booking.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: bookings.map(booking => this.formatBooking(booking, userId)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async findReceived(userId: number, params: { page: number }) {
    const { page } = params;
    const limit = 20;

    const [bookings, total] = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.requester', 'requester')
      .where('booking.target_user_id = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('booking.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: bookings.map(booking => this.formatBooking(booking, userId)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async findOne(id: number, userId: number) {
    const booking = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.requester', 'requester')
      .leftJoinAndSelect('booking.targetUser', 'targetUser')
      .where('booking.id = :id', { id })
      .getOne();

    if (!booking) {
      throw new NotFoundException('约拍不存在');
    }

    return {
      success: true,
      data: this.formatBooking(booking, userId),
    };
  }

  async accept(id: number, userId: number) {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('约拍不存在');
    }

    if (booking.target_user_id !== userId) {
      throw new ForbiddenException('无权操作此约拍');
    }

    if (booking.status !== 'pending') {
      throw new ForbiddenException('约拍状态不正确');
    }

    await this.bookingsRepository.update(id, { status: 'accepted' });

    return this.findOne(id, userId);
  }

  async reject(id: number, userId: number, reason: string) {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('约拍不存在');
    }

    if (booking.target_user_id !== userId) {
      throw new ForbiddenException('无权操作此约拍');
    }

    if (booking.status !== 'pending') {
      throw new ForbiddenException('约拍状态不正确');
    }

    await this.bookingsRepository.update(id, {
      status: 'rejected',
      // 在实际实现中，这里应该存储拒绝原因
    });

    return {
      success: true,
      message: '约拍已拒绝',
    };
  }

  async cancel(id: number, userId: number, reason: string) {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('约拍不存在');
    }

    if (booking.requester_id !== userId && booking.target_user_id !== userId) {
      throw new ForbiddenException('无权操作此约拍');
    }

    if (!['pending', 'accepted'].includes(booking.status)) {
      throw new ForbiddenException('约拍状态不正确');
    }

    await this.bookingsRepository.update(id, {
      status: 'cancelled',
    });

    return {
      success: true,
      message: '约拍已取消',
    };
  }

  async complete(id: number, userId: number) {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('约拍不存在');
    }

    if (booking.requester_id !== userId && booking.target_user_id !== userId) {
      throw new ForbiddenException('无权操作此约拍');
    }

    if (booking.status !== 'accepted') {
      throw new ForbiddenException('约拍状态不正确');
    }

    await this.bookingsRepository.update(id, { status: 'completed' });

    return {
      success: true,
      message: '约拍已完成',
    };
  }

  private formatBooking(booking: BookingRequest, currentUserId: number) {
    const isRequester = booking.requester_id === currentUserId;
    const isTargetUser = booking.target_user_id === currentUserId;

    return {
      id: booking.id,
      type: booking.type,
      title: booking.title,
      description: booking.description,
      date: booking.date,
      time_range: booking.time_range,
      location: booking.location,
      coordinates: booking.coordinates ? JSON.parse(booking.coordinates) : null,
      budget: booking.budget,
      requirements: booking.requirements,
      style_preferences: booking.style_preferences,
      sample_images: booking.sample_images,
      status: booking.status,
      response_deadline: booking.response_deadline,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      can_accept: isTargetUser && booking.status === 'pending',
      can_reject: isTargetUser && booking.status === 'pending',
      can_cancel: (isRequester || isTargetUser) &&
        ['pending', 'accepted'].includes(booking.status),
      requester: {
        id: booking.requester.id,
        username: booking.requester.username,
        avatar_url: booking.requester.avatar_url,
      },
      target_user: {
        id: booking.targetUser.id,
        username: booking.targetUser.username,
        avatar_url: booking.targetUser.avatar_url,
      },
    };
  }
}
