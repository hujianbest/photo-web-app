import { Controller, Get, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('works')
  async getWorksRanking(@Query('period') period: 'day' | 'week' | 'month' = 'week') {
    const data = await this.rankingService.getWorksRanking(period);
    return { success: true, data };
  }

  @Get('photographers')
  async getPhotographersRanking(@Query('period') period: 'day' | 'week' | 'month' = 'week') {
    const data = await this.rankingService.getPhotographersRanking(period);
    return { success: true, data };
  }

  @Get('newcomers')
  async getNewcomersRanking() {
    const data = await this.rankingService.getNewcomersRanking();
    return { success: true, data };
  }
}
