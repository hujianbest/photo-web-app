import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll({
      userId: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(+id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body('booking_id') bookingId: number, @Request() req) {
    return this.ordersService.create(bookingId, req.user.id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '支付订单' })
  @ApiResponse({ status: 200, description: '支付成功' })
  async pay(
    @Param('id') id: string,
    @Body('payment_method') paymentMethod: string,
    @Request() req,
  ) {
    return this.ordersService.pay(+id, paymentMethod, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成订单' })
  @ApiResponse({ status: 200, description: '完成成功' })
  async complete(@Param('id') id: string, @Request() req) {
    return this.ordersService.complete(+id, req.user.id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: '申请退款' })
  @ApiResponse({ status: 200, description: '退款申请成功' })
  async refund(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.ordersService.refund(+id, reason, req.user.id);
  }
}