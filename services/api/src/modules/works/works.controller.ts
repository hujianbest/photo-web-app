import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorksService } from './works.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('works')
@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  @ApiOperation({ summary: '获取作品列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('category') category?: string,
    @Query('sort') sort = 'latest',
    @Query('user_id') userId?: number,
  ) {
    return this.worksService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      sort,
      userId: userId ? parseInt(userId.toString()) : undefined,
    });
  }

  @Get('featured')
  @ApiOperation({ summary: '获取精选作品' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findFeatured() {
    return this.worksService.findFeatured();
  }

  @Get('search')
  @ApiOperation({ summary: '搜索作品' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async search(@Query('q') query: string, @Query('page') page = '1') {
    return this.worksService.search(query, { page: parseInt(page) });
  }

  @Get('categories')
  @ApiOperation({ summary: '获取作品分类' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategories() {
    return this.worksService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取作品详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string, @Request() req) {
    const currentUserId = req.user?.id;
    return this.worksService.findOne(+id, currentUserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建作品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createWorkDto: CreateWorkDto, @Request() req) {
    return this.worksService.create(createWorkDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新作品' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkDto: UpdateWorkDto,
    @Request() req,
  ) {
    return this.worksService.update(+id, updateWorkDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除作品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.worksService.remove(+id, req.user.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布作品' })
  @ApiResponse({ status: 200, description: '发布成功' })
  async publish(@Param('id') id: string, @Request() req) {
    return this.worksService.publish(+id, req.user.id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消发布作品' })
  @ApiResponse({ status: 200, description: '取消发布成功' })
  async unpublish(@Param('id') id: string, @Request() req) {
    return this.worksService.unpublish(+id, req.user.id);
  }
}