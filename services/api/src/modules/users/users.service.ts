import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'email', 'avatar_url', 'bio', 'location', 'points', 'level', 'created_at'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'avatar_url', 'bio', 'location', 'points', 'level', 'created_at'],
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      last_login_at: new Date(),
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto as Partial<User>);
    return this.findOne(id);
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password_hash: hashedPassword });
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async getStats(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    // TODO: 实现用户统计信息的具体逻辑
    return {
      user_id: user.id,
      username: user.username,
      points: user.points,
      level: user.level,
      works_count: 0,
      followers_count: 0,
      following_count: 0,
      checkins_count: 0,
    };
  }

  async addPoints(userId: number, points: number, reason: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }

    user.points += points;
    await this.userRepository.save(user);

    // TODO: 创建积分记录
    return user;
  }

  async updateLevel(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }

    // 根据积分更新等级
    let newLevel = 'newbie';
    if (user.points >= 10000) {
      newLevel = 'master';
    } else if (user.points >= 5000) {
      newLevel = 'professional';
    } else if (user.points >= 1000) {
      newLevel = 'intermediate';
    }

    if (newLevel !== user.level) {
      user.level = newLevel;
      await this.userRepository.save(user);
    }

    return user;
  }
}