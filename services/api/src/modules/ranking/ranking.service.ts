import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Work } from '../works/entities/work.entity';
import { User } from '../users/entities/user.entity';

export interface RankingItem {
  id: number;
  title?: string;
  username: string;
  avatar_url: string | null;
  score: number;
  likes?: number;
  works_count?: number;
  rank: number;
}

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getWorksRanking(period: 'day' | 'week' | 'month' = 'week'): Promise<RankingItem[]> {
    const { startDate, endDate } = this.getDateRange(period);
    const works = await this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.user', 'user')
      .where('work.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('work.likes', 'DESC')
      .addOrderBy('work.views', 'DESC')
      .limit(50)
      .getMany();
    return works.map((work, index) => ({
      id: work.id,
      title: work.title,
      username: work.user?.username || '',
      avatar_url: work.user?.avatar_url || null,
      score: work.likes,
      likes: work.likes,
      rank: index + 1,
    }));
  }

  async getPhotographersRanking(period: 'day' | 'week' | 'month' = 'week'): Promise<RankingItem[]> {
    const { startDate, endDate } = this.getDateRange(period);
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.works', 'work', 'work.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .select('user.id', 'id')
      .addSelect('user.username', 'username')
      .addSelect('user.avatar_url', 'avatar_url')
      .addSelect('COUNT(work.id)', 'works_count')
      .addSelect('COALESCE(SUM(work.likes), 0)', 'total_likes')
      .groupBy('user.id')
      .orderBy('total_likes', 'DESC')
      .addOrderBy('works_count', 'DESC')
      .limit(50)
      .getRawMany();
    return users.map((user, index) => ({
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      score: parseInt(user.total_likes) || 0,
      works_count: parseInt(user.works_count) || 0,
      rank: index + 1,
    }));
  }

  async getNewcomersRanking(): Promise<RankingItem[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.works', 'work')
      .where('user.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .select('user.id', 'id')
      .addSelect('user.username', 'username')
      .addSelect('user.avatar_url', 'avatar_url')
      .addSelect('COUNT(work.id)', 'works_count')
      .addSelect('COALESCE(SUM(work.likes), 0)', 'total_likes')
      .groupBy('user.id')
      .orderBy('total_likes', 'DESC')
      .addOrderBy('works_count', 'DESC')
      .limit(20)
      .getRawMany();
    return users.map((user, index) => ({
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      score: parseInt(user.total_likes) || 0,
      works_count: parseInt(user.works_count) || 0,
      rank: index + 1,
    }));
  }

  private getDateRange(period: 'day' | 'week' | 'month'): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case 'day': startDate.setDate(startDate.getDate() - 1); break;
      case 'week': startDate.setDate(startDate.getDate() - 7); break;
      case 'month': startDate.setMonth(startDate.getMonth() - 1); break;
    }
    return { startDate, endDate };
  }
}
