import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: '获取约拍列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.findAll({
      userId: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status,
    });
  }

  @Get('sent')
  @ApiOperation({ summary: '获取我发起的约拍' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findSent(@Request() req, @Query('page') page = '1') {
    return this.bookingsService.findSent(req.user.id, { page: parseInt(page) });
  }

  @Get('received')
  @ApiOperation({ summary: '获取我收到的约拍' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findReceived(@Request() req, @Query('page') page = '1') {
    return this.bookingsService.findReceived(req.user.id, { page: parseInt(page) });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取约拍详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.bookingsService.findOne(+id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '创建约拍需求' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(createBookingDto, req.user.id);
  }

  @Put(':id/accept')
  @ApiOperation({ summary: '接受约拍' })
  @ApiResponse({ status: 200, description: '接受成功' })
  async accept(@Param('id') id: string, @Request() req) {
    return this.bookingsService.accept(+id, req.user.id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: '拒绝约拍' })
  @ApiResponse({ status: 200, description: '拒绝成功' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.bookingsService.reject(+id, req.user.id, reason);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消约拍' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.bookingsService.cancel(+id, req.user.id, reason);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: '完成约拍' })
  @ApiResponse({ status: 200, description: '完成成功' })
  async complete(@Param('id') id: string, @Request() req) {
    return this.bookingsService.complete(+id, req.user.id);
  }
}