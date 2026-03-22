/**
 * 摄影师服务平台 - BDD 自动化测试套件
 * 基于 docs/0320_test_plan.md
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('摄影师服务平台 - 功能测试', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================
  // 一、用户认证模块
  // ============================================
  describe('Feature: 用户认证', () => {
    describe('Scenario: 用户注册', () => {
      it('Given 用户填写注册信息, When 提交注册, Then 应创建新用户', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'testuser_' + Date.now(),
            email: `test_${Date.now()}@example.com`,
            password: '123456',
          })
          .expect(201)
          .then((response) => {
            expect(response.body).toHaveProperty('success');
          });
      });
    });

    describe('Scenario: 用户登录', () => {
      it('Given 正确的用户名和密码, When 登录, Then 应返回 JWT Token', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            username: 'testuser',
            password: '123456',
          })
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('access_token');
        accessToken = response.body.data.access_token;
        userId = response.body.data.user.id;
      });

      it('Given 错误的密码, When 登录, Then 应返回错误', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            username: 'testuser',
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });

    describe('Scenario: Token 验证', () => {
      it('Given 无效的 Token, When 访问受保护资源, Then 应返回 401', () => {
        return request(app.getHttpServer())
          .get('/api/v1/notifications')
          .set('Authorization', 'Bearer invalid_token')
          .expect(401);
      });

      it('Given 有效的 Token, When 访问受保护资源, Then 应返回数据', () => {
        return request(app.getHttpServer())
          .get('/api/v1/notifications')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });
    });
  });

  // ============================================
  // 二、作品模块
  // ============================================
  describe('Feature: 作品管理', () => {
    describe('Scenario: 获取作品列表', () => {
      it('Given 系统中有作品, When 请求作品列表, Then 应返回分页数据', () => {
        return request(app.getHttpServer())
          .get('/api/v1/works')
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('items');
          });
      });

      it('Given 分类筛选参数, When 按分类查询, Then 应返回对应分类的作品', () => {
        return request(app.getHttpServer())
          .get('/api/v1/works?category=portrait')
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('success', true);
          });
      });
    });

    describe('Scenario: 创建作品', () => {
      it('Given 用户已登录, When 提交新作品, Then 应创建成功', () => {
        return request(app.getHttpServer())
          .post('/api/v1/works')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: '测试作品',
            description: '这是一个测试作品',
            images: ['https://example.com/test.jpg'],
            category: 'portrait',
          })
          .expect(201)
          .then((response) => {
            expect(response.body).toHaveProperty('success', true);
          });
      });
    });
  });

  // ============================================
  // 三、打卡点模块
  // ============================================
  describe('Feature: 打卡点管理', () => {
    describe('Scenario: 获取打卡点列表', () => {
      it('Given 系统中有打卡点, When 请求列表, Then 应返回数据', () => {
        return request(app.getHttpServer())
          .get('/api/v1/spots')
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('success', true);
          });
      });
    });
  });

  // ============================================
  // 四、约拍模块
  // ============================================
  describe('Feature: 约拍管理', () => {
    describe('Scenario: 获取约拍列表', () => {
      it('Given 系统中有约拍, When 请求列表, Then 应返回数据', () => {
        return request(app.getHttpServer())
          .get('/api/v1/bookings')
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('success', true);
          });
      });
    });
  });

  // ============================================
  // 五、订单模块
  // ============================================
  describe('Feature: 订单管理', () => {
    describe('Scenario: 获取订单列表', () => {
      it('Given 用户已登录, When 请求订单列表, Then 应返回用户的订单', () => {
        return request(app.getHttpServer())
          .get('/api/v1/orders')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });
    });
  });

  // ============================================
  // 六、文章模块
  // ============================================
  describe('Feature: 文章管理', () => {
    describe('Scenario: 获取文章列表', () => {
      it('Given 系统中有文章, When 请求列表, Then 应返回数据', () => {
        return request(app.getHttpServer())
          .get('/api/v1/articles')
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('success', true);
          });
      });
    });
  });

  // ============================================
  // 七、通知模块
  // ============================================
  describe('Feature: 通知管理', () => {
    describe('Scenario: 获取通知列表', () => {
      it('Given 用户已登录, When 请求通知列表, Then 应返回数据', () => {
        return request(app.getHttpServer())
          .get('/api/v1/notifications')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });
    });
  });

  // ============================================
  // 八、关注模块
  // ============================================
  describe('Feature: 关注系统', () => {
    describe('Scenario: 关注用户', () => {
      it('Given 用户已登录, When 关注其他用户, Then 应成功', () => {
        return request(app.getHttpServer())
          .post('/api/v1/follow/999')
          .set('Authorization', `Bearer ${accessToken}`)
          .then((response) => {
            // 可能成功或已关注
            expect([201, 200, 400]).toContain(response.status);
          });
      });
    });

    describe('Scenario: 获取关注统计', () => {
      it('Given 用户存在, When 查询统计, Then 应返回粉丝和关注数', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/follow/stats/${userId}`)
          .expect(200);
      });
    });
  });

  // ============================================
  // 九、私信模块
  // ============================================
  describe('Feature: 私信系统', () => {
    describe('Scenario: 获取对话列表', () => {
      it('Given 用户已登录, When 请求对话列表, Then 应返回数据', () => {
        return request(app.getHttpServer())
          .get('/api/v1/messages/conversations')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });
    });
  });

  // ============================================
  // 十、安全测试
  // ============================================
  describe('Feature: 安全验证', () => {
    describe('Scenario: 未授权访问', () => {
      it('Given 无 Token, When 访问受保护资源, Then 应返回 401', () => {
        return request(app.getHttpServer())
          .get('/api/v1/notifications')
          .expect(401);
      });
    });

    describe('Scenario: SQL 注入防护', () => {
      it('Given SQL 注入字符串, When 登录, Then 应安全处理', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            username: "admin' OR '1'='1",
            password: '123456',
          })
          .expect(401);
      });
    });
  });
});
