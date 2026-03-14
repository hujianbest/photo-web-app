import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../bookings/entities/order.entity';
import { BookingRequest } from '../bookings/entities/booking-request.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(BookingRequest)
    private bookingsRepository: Repository<BookingRequest>,
    private usersService: UsersService,
  ) {}

  async create(bookingId: number, userId: number) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('约拍不存在');
    }

    if (booking.requester_id !== userId) {
      throw new ForbiddenException('无权创建此订单');
    }

    if (booking.status !== 'accepted') {
      throw new ForbiddenException('约拍状态不正确');
    }

    // 生成订单号
    const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const order = this.ordersRepository.create({
      booking_id: booking.id,
      order_no: orderNo,
      client_id: booking.requester_id,
      photographer_id: booking.target_user_id,
      amount: booking.budget || 0,
      status: 'pending',
    });

    const savedOrder = await this.ordersRepository.save(order);

    return this.findOne(savedOrder.id, userId);
  }

  async findAll(params: {
    userId: number;
    page: number;
    limit: number;
    status?: string;
  }) {
    const { userId, page, limit, status } = params;

    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.photographer', 'photographer')
      .leftJoinAndSelect('order.booking', 'booking')
      .where('order.client_id = :userId OR order.photographer_id = :userId', {
        userId,
      });

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    const [orders, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: orders.map(order => this.formatOrder(order, userId)),
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
    const order = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.photographer', 'photographer')
      .leftJoinAndSelect('order.booking', 'booking')
      .where('order.id = :id', { id })
      .getOne();

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return {
      success: true,
      data: this.formatOrder(order, userId),
    };
  }

  async pay(id: number, paymentMethod: string, userId: number) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.client_id !== userId) {
      throw new ForbiddenException('无权操作此订单');
    }

    if (order.status !== 'pending') {
      throw new ForbiddenException('订单状态不正确');
    }

    // 模拟支付成功
    await this.ordersRepository.update(id, {
      status: 'paid',
      payment_method: paymentMethod,
      transaction_id: `TXN${Date.now()}`,
    });

    return {
      success: true,
      message: '支付成功',
    };
  }

  async complete(id: number, userId: number) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.photographer_id !== userId) {
      throw new ForbiddenException('无权操作此订单');
    }

    if (order.status !== 'paid') {
      throw new ForbiddenException('订单状态不正确');
    }

    await this.ordersRepository.update(id, {
      status: 'completed',
      completion_date: new Date(),
    });

    return {
      success: true,
      message: '订单已完成',
    };
  }

  async refund(id: number, reason: string, userId: number) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.client_id !== userId) {
      throw new ForbiddenException('无权操作此订单');
    }

    if (!['paid', 'shooting', 'editing'].includes(order.status)) {
      throw new ForbiddenException('订单状态不正确');
    }

    await this.ordersRepository.update(id, {
      status: 'refunded',
      refund_amount: order.amount,
      refund_reason: reason,
    });

    return {
      success: true,
      message: '退款申请已提交',
    };
  }

  private formatOrder(order: Order, currentUserId: number) {
    const isClient = order.client_id === currentUserId;
    const isPhotographer = order.photographer_id === currentUserId;

    return {
      id: order.id,
      order_no: order.order_no,
      amount: order.amount,
      status: order.status,
      payment_method: order.payment_method,
      transaction_id: order.transaction_id,
      contract_url: order.contract_url,
      contract_signed_at: order.contract_signed_at,
      shooting_date: order.shooting_date,
      completion_date: order.completion_date,
      refund_amount: order.refund_amount,
      refund_reason: order.refund_reason,
      created_at: order.created_at,
      updated_at: order.updated_at,
      client: {
        id: order.client.id,
        username: order.client.username,
        avatar_url: order.client.avatar_url,
      },
      photographer: {
        id: order.photographer.id,
        username: order.photographer.username,
        avatar_url: order.photographer.avatar_url,
      },
      booking: order.booking
        ? {
            id: order.booking.id,
            type: order.booking.type,
            date: order.booking.date,
            location: order.booking.location,
          }
        : null,
      can_pay: isClient && order.status === 'pending',
      can_complete: isPhotographer && order.status === 'paid',
      can_refund: isClient && ['paid', 'shooting', 'editing'].includes(order.status),
    };
  }
}
