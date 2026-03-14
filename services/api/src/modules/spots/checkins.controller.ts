import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CheckinsService } from './checkins.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCheckinDto } from './dto/create-checkin.dto';

@ApiTags('checkins')
@Controller('spots/:spotId/checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Get()
  @ApiOperation({ summary: '获取打卡记录列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Param('spotId') spotId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.checkinsService.findAll(+spotId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '打卡' })
  @ApiResponse({ status: 201, description: '打卡成功' })
  async create(
    @Param('spotId') spotId: string,
    @Body() createCheckinDto: CreateCheckinDto,
    @Request() req,
  ) {
    return this.checkinsService.create(
      +spotId,
      createCheckinDto,
      req.user.id,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的打卡记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findMyCheckins(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.checkinsService.findMyCheckins(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Delete(':checkinId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除打卡记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(
    @Param('spotId') spotId: string,
    @Param('checkinId') checkinId: string,
    @Request() req,
  ) {
    return this.checkinsService.remove(+checkinId, req.user.id);
  }
}