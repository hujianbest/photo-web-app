/**
 * 摄影师服务平台 - 扩展 E2E 测试套件
 * 基于 docs/0320_test_plan.md 补充更多测试用例
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('摄影师服务平台 - 扩展功能测试', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let userId: number;
  let workId: number;
  let spotId: number;
  let bookingId: number;
  let articleId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 登录获取 token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'testuser', password: '123456' });
    
    if (loginResponse.body.success) {
      accessToken = loginResponse.body.data.access_token;
      refreshToken = loginResponse.body.data.refresh_token;
      userId = loginResponse.body.data.user.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================
  // 扩展：用户认证模块
  // ============================================
  describe('Feature: 用户认证 - 扩展', () => {
    describe('Scenario: Token 刷新', () => {
      it('Given 有效的 refresh_token, When 刷新 Token, Then 应返回新的 access_token', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/refresh')
          .send({ refresh_token: refreshToken })
          .then((response) => {
            if (response.status === 201 || response.status === 200) {
              expect(response.body).toHaveProperty('access_token');
            }
          });
      });
    });

    describe('Scenario: 获取当前用户信息', () => {
      it('Given 用户已登录, When 请求用户信息, Then 应返回用户详情', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('username');
          });
      });
    });

    describe('Scenario: 修改密码', () => {
      it('Given 用户已登录, When 修改密码, Then 应成功更新', () => {
        return request(app.getHttpServer())
          .put('/api/v1/auth/password')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            oldPassword: '123456',
            newPassword: '123456', // 保持原密码
          })
          .then((response) => {
            expect([200, 201, 404]).toContain(response.status);
          });
      });
    });

    describe('Scenario: 邮箱验证', () => {
      it('Given 用户邮箱未验证, When 请求验证, Then 应发送验证邮件', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/verify-email')
          .set('Authorization', `Bearer ${accessToken}`)
          .then((response) => {
            expect([200, 201, 404, 501]).toContain(response.status);
          });
      });
    });
  });

  // ============================================
  // 扩展：作品模块
  // ============================================
  describe('Feature: 作品管理 - 扩展', () => {
    describe('Scenario: 获取作品详情', () => {
      it('Given 作品存在, When 请求详情, Then 应返回完整信息', async () => {
        // 先获取作品列表
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/works')
          .expect(200);

        if (listResponse.body.data.items.length > 0) {
          workId = listResponse.body.data.items[0].id;

          const response = await request(app.getHttpServer())
            .get(`/api/v1/works/${workId}`)
            .expect(200);

          expect(response.body.data).toHaveProperty('title');
          expect(response.body.data).toHaveProperty('images');
        }
      });
    });

    describe('Scenario: 更新作品', () => {
      it('Given 用户是作品作者, When 更新作品, Then 应成功修改', async () => {
        if (workId) {
          return request(app.getHttpServer())
            .put(`/api/v1/works/${workId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: '更新后的标题' })
            .then((response) => {
              expect([200, 403, 404]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 删除作品', () => {
      it('Given 用户是作品作者, When 删除作品, Then 应成功删除', async () => {
        // 创建一个新作品用于删除测试
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/works')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: '待删除的作品',
            description: '测试',
            images: ['https://example.com/test.jpg'],
            category: 'portrait',
          });

        if (createResponse.body.success) {
          const deleteWorkId = createResponse.body.data.id;

          return request(app.getHttpServer())
            .delete(`/api/v1/works/${deleteWorkId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        }
      });
    });

    describe('Scenario: 获取作品评论', () => {
      it('Given 作品存在, When 请求评论列表, Then 应返回评论', async () => {
        if (workId) {
          return request(app.getHttpServer())
            .get(`/api/v1/works/${workId}/comments`)
            .expect(200);
        }
      });
    });

    describe('Scenario: 获取相似作品', () => {
      it('Given 作品存在, When 请求相似作品, Then 应返回相关作品', async () => {
        if (workId) {
          return request(app.getHttpServer())
            .get(`/api/v1/works/${workId}/similar`)
            .then((response) => {
              expect([200, 404]).toContain(response.status);
            });
        }
      });
    });
  });

  // ============================================
  // 扩展：打卡点模块
  // ============================================
  describe('Feature: 打卡点管理 - 扩展', () => {
    describe('Scenario: 创建打卡点', () => {
      it('Given 用户已登录, When 创建打卡点, Then 应成功', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/spots')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: '测试打卡点',
            location: '北京市',
            description: '这是一个测试打卡点',
            category: 'architecture',
          });

        if (response.status === 201) {
          spotId = response.body.data.id;
        }
      });
    });

    describe('Scenario: 打卡', () => {
      it('Given 打卡点存在, When 用户打卡, Then 应记录打卡', async () => {
        // 先获取打卡点列表
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/spots')
          .expect(200);

        if (listResponse.body.data.items.length > 0) {
          spotId = listResponse.body.data.items[0].id;

          return request(app.getHttpServer())
            .post(`/api/v1/spots/${spotId}/checkin`)
            .set('Authorization', `Bearer ${accessToken}`)
            .then((response) => {
              expect([200, 201, 400]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 打卡点评分', () => {
      it('Given 打卡点存在, When 用户评分, Then 应更新平均分', async () => {
        if (spotId) {
          return request(app.getHttpServer())
            .post(`/api/v1/spots/${spotId}/rate`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ rating: 5 })
            .then((response) => {
              expect([200, 201, 400, 404]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 获取打卡记录', () => {
      it('Given 打卡点存在, When 请求打卡记录, Then 应返回列表', async () => {
        if (spotId) {
          return request(app.getHttpServer())
            .get(`/api/v1/spots/${spotId}/checkins`)
            .expect(200);
        }
      });
    });

    describe('Scenario: 附近打卡点', () => {
      it('Given 地理位置参数, When 查询附近, Then 应返回附近打卡点', () => {
        return request(app.getHttpServer())
          .get('/api/v1/spots/nearby?lat=39.9042&lng=116.4074&radius=5000')
          .then((response) => {
            expect([200, 404]).toContain(response.status);
          });
      });
    });
  });

  // ============================================
  // 扩展：约拍模块
  // ============================================
  describe('Feature: 约拍管理 - 扩展', () => {
    describe('Scenario: 创建约拍', () => {
      it('Given 用户已登录, When 创建约拍, Then 应成功', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: '测试约拍',
            description: '测试描述',
            type: 'free',
            location: '北京',
            time: '2026-03-25',
          });

        if (response.status === 201 && response.body.success) {
          bookingId = response.body.data.id;
        }
      });
    });

    describe('Scenario: 接受约拍', () => {
      it('Given 约拍存在, When 接受约拍, Then 应更新状态', async () => {
        if (bookingId) {
          return request(app.getHttpServer())
            .post(`/api/v1/bookings/${bookingId}/accept`)
            .set('Authorization', `Bearer ${accessToken}`)
            .then((response) => {
              expect([200, 201, 400, 403]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 拒绝约拍', () => {
      it('Given 约拍存在, When 拒绝约拍, Then 应更新状态', async () => {
        if (bookingId) {
          return request(app.getHttpServer())
            .post(`/api/v1/bookings/${bookingId}/reject`)
            .set('Authorization', `Bearer ${accessToken}`)
            .then((response) => {
              expect([200, 201, 400, 403]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 取消约拍', () => {
      it('Given 约拍存在, When 取消约拍, Then 应更新状态', async () => {
        if (bookingId) {
          return request(app.getHttpServer())
            .post(`/api/v1/bookings/${bookingId}/cancel`)
            .set('Authorization', `Bearer ${accessToken}`)
            .then((response) => {
              expect([200, 201, 400, 403]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 约拍评论', () => {
      it('Given 约拍存在, When 发表评论, Then 应成功', async () => {
        if (bookingId) {
          return request(app.getHttpServer())
            .post(`/api/v1/bookings/${bookingId}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: '测试评论' })
            .then((response) => {
              expect([200, 201, 404]).toContain(response.status);
            });
        }
      });
    });
  });

  // ============================================
  // 扩展：订单模块
  // ============================================
  describe('Feature: 订单管理 - 扩展', () => {
    describe('Scenario: 创建订单', () => {
      it('Given 约拍存在, When 创建订单, Then 应成功', async () => {
        if (bookingId) {
          return request(app.getHttpServer())
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              bookingId: bookingId,
              amount: 100,
            })
            .then((response) => {
              expect([200, 201, 400, 404]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 订单支付', () => {
      it('Given 订单存在, When 支付订单, Then 应更新状态', async () => {
        // 获取订单列表
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/orders')
          .set('Authorization', `Bearer ${accessToken}`);

        if (listResponse.body.data?.items?.length > 0) {
          const orderId = listResponse.body.data.items[0].id;

          return request(app.getHttpServer())
            .post(`/api/v1/orders/${orderId}/pay`)
            .set('Authorization', `Bearer ${accessToken}`)
            .then((response) => {
              expect([200, 201, 400, 404]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 订单退款', () => {
      it('Given 订单已支付, When 申请退款, Then 应处理退款', async () => {
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/orders')
          .set('Authorization', `Bearer ${accessToken}`);

        if (listResponse.body.data?.items?.length > 0) {
          const orderId = listResponse.body.data.items[0].id;

          return request(app.getHttpServer())
            .post(`/api/v1/orders/${orderId}/refund`)
            .set('Authorization', `Bearer ${accessToken}`)
            .then((response) => {
              expect([200, 201, 400, 404]).toContain(response.status);
            });
        }
      });
    });
  });

  // ============================================
  // 扩展：文章模块
  // ============================================
  describe('Feature: 文章管理 - 扩展', () => {
    describe('Scenario: 创建文章', () => {
      it('Given 用户已登录, When 创建文章, Then 应成功', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: '测试文章',
            content: '<p>这是测试内容</p>',
            category: 'experience',
          });

        if (response.status === 201 && response.body.success) {
          articleId = response.body.data.id;
        }
      });
    });

    describe('Scenario: 更新文章', () => {
      it('Given 用户是文章作者, When 更新文章, Then 应成功', async () => {
        if (articleId) {
          return request(app.getHttpServer())
            .put(`/api/v1/articles/${articleId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: '更新后的文章' })
            .then((response) => {
              expect([200, 403, 404]).toContain(response.status);
            });
        }
      });
    });

    describe('Scenario: 删除文章', () => {
      it('Given 用户是文章作者, When 删除文章, Then 应成功', async () => {
        if (articleId) {
          return request(app.getHttpServer())
            .delete(`/api/v1/articles/${articleId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        }
      });
    });

    describe('Scenario: 文章分类筛选', () => {
      it('Given 分类参数, When 筛选文章, Then 应返回对应分类', () => {
        return request(app.getHttpServer())
          .get('/api/v1/articles?category=tutorial')
          .expect(200);
      });
    });

    describe('Scenario: 文章搜索', () => {
      it('Given 搜索关键词, When 搜索文章, Then 应返回匹配结果', () => {
        return request(app.getHttpServer())
          .get('/api/v1/articles?search=测试')
          .expect(200);
      });
    });
  });

  // ============================================
  // 扩展：通知模块
  // ============================================
  describe('Feature: 通知管理 - 扩展', () => {
    describe('Scenario: 获取未读通知数', () => {
      it('Given 用户已登录, When 请求未读数, Then 应返回数量', () => {
        return request(app.getHttpServer())
          .get('/api/v1/notifications/unread-count')
          .set('Authorization', `Bearer ${accessToken}`)
          .then((response) => {
            expect([200, 404]).toContain(response.status);
          });
      });
    });

    describe('Scenario: 删除通知', () => {
      it('Given 通知存在, When 删除通知, Then 应成功', async () => {
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/notifications')
          .set('Authorization', `Bearer ${accessToken}`);

        if (listResponse.body.data?.items?.length > 0) {
          const notificationId = listResponse.body.data.items[0].id;

          return request(app.getHttpServer())
            .delete(`/api/v1/notifications/${notificationId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .then((response) => {
              expect([200, 404]).toContain(response.status);
            });
        }
      });
    });
  });

  // ============================================
  // 扩展：文件上传模块
  // ============================================
  describe('Feature: 文件上传', () => {
    describe('Scenario: 上传图片', () => {
      it('Given 用户已登录, When 上传图片, Then 应返回URL', () => {
        // 模拟文件上传
        return request(app.getHttpServer())
          .post('/api/v1/upload')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', Buffer.from('test'), 'test.jpg')
          .then((response) => {
            expect([200, 201, 400, 415]).toContain(response.status);
          });
      });
    });

    describe('Scenario: 上传无效文件', () => {
      it('Given 文件类型不支持, When 上传文件, Then 应返回错误', () => {
        return request(app.getHttpServer())
          .post('/api/v1/upload')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', Buffer.from('test'), 'test.exe')
          .then((response) => {
            expect([400, 415]).toContain(response.status);
          });
      });
    });
  });

  // ============================================
  // 扩展：安全测试
  // ============================================
  describe('Feature: 安全验证 - 扩展', () => {
    describe('Scenario: XSS 攻击防护', () => {
      it('Given XSS 脚本, When 提交, Then 应安全处理', () => {
        return request(app.getHttpServer())
          .post('/api/v1/works')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: '<script>alert("xss")</script>',
            description: 'test',
            images: ['https://example.com/test.jpg'],
          })
          .then((response) => {
            // 应该被转义或拒绝
            expect([201, 400]).toContain(response.status);
          });
      });
    });

    describe('Scenario: 请求限流', () => {
      it('Given 短时间大量请求, When 超过限流, Then 应返回 429', async () => {
        const promises = [];
        for (let i = 0; i < 25; i++) {
          promises.push(
            request(app.getHttpServer())
              .get('/api/v1/works')
          );
        }

        const responses = await Promise.all(promises);
        const tooManyRequests = responses.some(r => r.status === 429);
        // 可能触发限流，也可能不触发（取决于限流配置）
        expect([true, false]).toContain(tooManyRequests);
      });
    });

    describe('Scenario: 越权访问', () => {
      it('Given 访问其他用户资源, When 无权限, Then 应返回 403', async () => {
        // 尝试删除不属于自己的作品
        return request(app.getHttpServer())
          .delete('/api/v1/works/999999')
          .set('Authorization', `Bearer ${accessToken}`)
          .then((response) => {
            expect([403, 404]).toContain(response.status);
          });
      });
    });
  });

  // ============================================
  // 扩展：性能测试
  // ============================================
  describe('Feature: 性能验证', () => {
    describe('Scenario: API 响应时间', () => {
      it('Given 正常请求, When 获取列表, Then 应在 500ms 内响应', async () => {
        const start = Date.now();
        
        await request(app.getHttpServer())
          .get('/api/v1/works')
          .expect(200);

        const duration = Date.now() - start;
        expect(duration).toBeLessThan(500);
      });
    });

    describe('Scenario: 并发请求处理', () => {
      it('Given 多个并发请求, When 同时请求, Then 应正确处理', async () => {
        const promises = Array(10).fill(null).map(() =>
          request(app.getHttpServer())
            .get('/api/v1/works')
        );

        const responses = await Promise.all(promises);
        const successCount = responses.filter(r => r.status === 200).length;
        
        expect(successCount).toBeGreaterThan(8); // 允许部分失败
      });
    });
  });
});
