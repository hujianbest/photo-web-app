import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: '获取标签列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('sort') sort = 'hot',
  ) {
    return this.tagsService.findAll(parseInt(page), parseInt(limit), sort);
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门标签' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHot(@Query('limit') limit = '20') {
    return this.tagsService.getHotTags(parseInt(limit));
  }

  @Get('search')
  @ApiOperation({ summary: '搜索标签' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async search(@Query('q') query: string, @Query('limit') limit = '10') {
    return this.tagsService.search(query, parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    return this.tagsService.findOne(+id);
  }

  @Get(':id/works')
  @ApiOperation({ summary: '获取标签下的作品' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWorksByTag(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.tagsService.getWorksByTag(+id, parseInt(page), parseInt(limit));
  }

  @Get(':id/articles')
  @ApiOperation({ summary: '获取标签下的文章' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getArticlesByTag(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.tagsService.getArticlesByTag(+id, parseInt(page), parseInt(limit));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建标签' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.create(createTagDto);
    return {
      success: true,
      message: '标签创建成功',
      data: tag,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新标签' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    const tag = await this.tagsService.update(+id, updateTagDto);
    return {
      success: true,
      message: '标签更新成功',
      data: tag,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除标签' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    await this.tagsService.remove(+id);
    return {
      success: true,
      message: '标签删除成功',
    };
  }
}
