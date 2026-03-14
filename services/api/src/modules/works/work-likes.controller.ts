import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkLikesService } from './work-likes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('work-likes')
@Controller('works/:workId/likes')
export class WorkLikesController {
  constructor(private readonly workLikesService: WorkLikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞作品' })
  @ApiResponse({ status: 201, description: '点赞成功' })
  async create(@Param('workId') workId: string, @Request() req) {
    return this.worksService.likeWork(+workId, req.user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消点赞' })
  @ApiResponse({ status: 200, description: '取消点赞成功' })
  async remove(@Param('workId') workId: string, @Request() req) {
    return this.worksService.unlikeWork(+workId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取作品点赞列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findLikes(@Param('workId') workId: string) {
    return this.worksService.findWorkLikes(+workId);
  }

  @Post('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查是否已点赞' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkLike(@Param('workId') workId: string, @Request() req) {
    return this.worksService.checkLike(+workId, req.user.id);
  }
}