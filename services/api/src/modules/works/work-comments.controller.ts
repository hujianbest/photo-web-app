import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkCommentsService } from './work-comments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('work-comments')
@Controller('works/:workId/comments')
export class WorkCommentsController {
  constructor(private readonly workCommentsService: WorkCommentsService) {}

  @Get()
  @ApiOperation({ summary: '获取作品评论' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Param('workId') workId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.workCommentsService.findAll(+workId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  @ApiResponse({ status: 201, description: '评论成功' })
  async create(
    @Param('workId') workId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.worksService.create(
      +workId,
      createCommentDto,
      req.user.id,
    );
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(
    @Param('workId') workId: string,
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.worksService.remove(+commentId, req.user.id);
  }
}