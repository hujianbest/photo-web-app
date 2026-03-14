import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SpotsService } from './spots.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('spots')
@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get()
  @ApiOperation({ summary: '获取打卡点列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('sort') sort = 'popular',
  ) {
    return this.spotsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      city,
      category,
      sort,
    });
  }

  @Get('search')
  @ApiOperation({ summary: '搜索打卡点' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async search(
    @Query('q') query: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius = 5000,
  ) {
    return this.spotsService.search(query, { lat, lng, radius });
  }

  @Get('nearby')
  @ApiOperation({ summary: '获取附近打卡点' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius = 5000,
    @Query('limit') limit = 20,
  ) {
    return this.spotsService.findNearby(lat, lng, radius, limit);
  }

  @Get('cities')
  @ApiOperation({ summary: '获取支持的城市列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCities() {
    return this.spotsService.getCities();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取打卡点详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string, @Request() req) {
    const currentUserId = req.user?.id;
    return this.spotsService.findOne(+id, currentUserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建打卡点' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createSpotDto: CreateSpotDto, @Request() req) {
    return this.spotsService.create(createSpotDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新打卡点' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateSpotDto: UpdateSpotDto,
    @Request() req,
  ) {
    return this.spotsService.update(+id, updateSpotDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除打卡点' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.spotsService.remove(+id, req.user.id);
  }
}