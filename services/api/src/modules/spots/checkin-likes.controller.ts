import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CheckinLikesService } from './checkin-likes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('checkin-likes')
@Controller('checkins/:checkinId/likes')
export class CheckinLikesController {
  constructor(private readonly checkinLikesService: CheckinLikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞打卡' })
  @ApiResponse({ status: 201, description: '点赞成功' })
  async create(@Param('checkinId') checkinId: string, @Request() req) {
    return this.checkinLikesService.likeCheckin(+checkinId, req.user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消点赞' })
  @ApiResponse({ status: 200, description: '取消点赞成功' })
  async remove(@Param('checkinId') checkinId: string, @Request() req) {
    return this.checkinLikesService.unlikeCheckin(+checkinId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取打卡点赞列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findLikes(@Param('checkinId') checkinId: string) {
    return this.checkinLikesService.findCheckinLikes(+checkinId);
  }
}