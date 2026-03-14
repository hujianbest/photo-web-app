import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private verificationCodes = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, phone, password, ...rest } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await this.usersService.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('邮箱已被注册');
      }
    }

    // 检查手机号是否已存在
    if (phone) {
      // 假设有findByPhone方法
      // const existingPhone = await this.usersService.findByPhone(phone);
      // if (existingPhone) {
      //   throw new ConflictException('手机号已被注册');
      // }
    }

    // 创建用户
    const user = await this.usersService.create({
      username,
      email,
      phone,
      password,
      ...rest,
    });

    // 生成JWT Token
    const tokens = await this.generateTokens(user.id, user.username);

    // 返回用户信息和Token
    return {
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          points: user.points,
          level: user.level,
          avatar_url: user.avatar_url,
          bio: user.bio,
          location: user.location,
          created_at: user.created_at,
        },
        ...tokens,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查找用户（通过用户名或邮箱）
    let user = await this.usersService.findByUsername(username);
    if (!user) {
      user = await this.usersService.findByEmail(username);
    }

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 更新最后登录时间
    // await this.usersService.updateLastLogin(user.id);

    // 生成JWT Token
    const tokens = await this.generateTokens(user.id, user.username);

    // 返回用户信息和Token
    return {
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          points: user.points,
          level: user.level,
          avatar_url: user.avatar_url,
          bio: user.bio,
          location: user.location,
          created_at: user.created_at,
        },
        ...tokens,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // 验证refresh token
      const payload = this.jwtService.verify(refreshToken);

      // 获取用户信息
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 生成新的token
      const tokens = await this.generateTokens(user.id, user.username);

      return {
        success: true,
        message: 'Token刷新成功',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh Token无效或已过期');
    }
  }

  async getCurrentUser(userId: number) {
    const user = await this.usersService.findOne(userId);
    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        points: user.points,
        level: user.level,
        avatar_url: user.avatar_url,
        bio: user.bio,
        location: user.location,
        website: user.website,
        social_media: user.social_media,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  async logout(userId: number) {
    // 在实际实现中，这里会将refresh token加入黑名单
    // 或者使用Redis存储已登出的token
    return {
      success: true,
      message: '登出成功',
    };
  }

  async sendVerificationCode(phone: string, type: 'register' | 'login' | 'reset_password') {
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 设置过期时间（5分钟）
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // 存储验证码（实际应该使用Redis）
    this.verificationCodes.set(`${type}_${phone}`, { code, expiresAt });

    // 在实际实现中，这里会调用短信服务发送验证码
    console.log(`发送验证码到 ${phone}: ${code} (类型: ${type})`);

    return {
      success: true,
      message: '验证码已发送',
      data: {
        phone,
        type,
        expires_in: 300, // 5分钟
      },
    };
  }

  async verifyCode(phone: string, code: string, type: 'register' | 'login' | 'reset_password') {
    const key = `${type}_${phone}`;
    const storedData = this.verificationCodes.get(key);

    if (!storedData) {
      throw new BadRequestException('验证码不存在或已过期');
    }

    if (storedData.code !== code) {
      throw new BadRequestException('验证码错误');
    }

    if (storedData.expiresAt < Date.now()) {
      this.verificationCodes.delete(key);
      throw new BadRequestException('验证码已过期');
    }

    // 验证成功，删除验证码
    this.verificationCodes.delete(key);

    return {
      success: true,
      message: '验证成功',
    };
  }

  async resetPassword(phone: string, code: string, newPassword: string) {
    // 先验证验证码
    await this.verifyCode(phone, code, 'reset_password');

    // 查找用户
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 重置密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { password_hash: hashedPassword });

    return {
      success: true,
      message: '密码重置成功',
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    // 查找用户（通过用户名或邮箱）
    let user = await this.usersService.findByUsername(username);
    if (!user) {
      user = await this.usersService.findByEmail(username);
    }

    if (!user) {
      return null;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  private async generateTokens(userId: number, username: string) {
    const payload = { sub: userId, username };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 7 * 24 * 60 * 60, // 7天
    };
  }
}