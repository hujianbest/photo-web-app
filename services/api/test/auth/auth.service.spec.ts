/**
 * 用户认证模块 - 单元测试
 * BDD 风格
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('Feature: 用户认证服务', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('Scenario: 用户注册', () => {
    it('Given 新用户信息, When 注册, Then 应创建用户', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: '123456',
      };

      (usersService.findByUsername as jest.Mock).mockResolvedValue(null);
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...registerDto,
      });

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalled();
    });

    it('Given 已存在的用户名, When 注册, Then 应抛出错误', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(
        service.register({
          username: 'existing',
          email: 'test@example.com',
          password: '123456',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Scenario: 用户登录', () => {
    it('Given 正确的凭据, When 登录, Then 应返回 Token', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('123456', 10),
        status: 'active',
      };

      (usersService.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await service.login({
        username: 'testuser',
        password: '123456',
      });

      expect(result).toHaveProperty('access_token');
    });

    it('Given 错误的密码, When 登录, Then 应抛出错误', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('123456', 10),
      };

      (usersService.findByUsername as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.login({
          username: 'testuser',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow();
    });
  });
});
