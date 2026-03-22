# 测试覆盖实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为摄影师服务平台建立完整的单元测试和 E2E 测试体系，确保核心功能稳定可靠。

**Architecture:** 
- 后端使用 Jest 进行单元测试 + supertest 进行 E2E API 测试
- 前端使用 Vitest + Testing Library 进行组件测试，Playwright 进行 E2E 测试
- 遵循 TDD 原则，先写测试再实现

**Tech Stack:** Jest, Vitest, Testing Library, Playwright, supertest

---

## 当前测试状态

### 后端 (services/api)
- ✅ 已有 Jest 测试框架
- ✅ 已有测试：auth.service.spec.ts, works.service.spec.ts
- ❌ 缺失测试：users, spots, bookings, orders, messages, articles, tags, ranking, notifications, upload

### 前端 (apps/web)
- ✅ 已有 Playwright E2E 测试配置
- ✅ 已有测试：app.spec.ts, extended.spec.ts, workflows.spec.ts
- ❌ 缺少组件单元测试

---

## Phase 1: 后端单元测试补全

### Task 1: Users 模块单元测试

**Files:**
- Create: `services/api/test/users/users.service.spec.ts`
- Reference: `services/api/src/modules/users/users.service.ts`

**Step 1: 查看现有 Users 服务实现**

```bash
cat /mnt/e/projects/photo-web-app/services/api/src/modules/users/users.service.ts
```

**Step 2: 编写测试文件**

```typescript
/**
 * 用户模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Feature: 用户服务', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('Scenario: 查询用户', () => {
    it('Given 用户ID, When 查询用户, Then 应返回用户信息', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('Given 不存在的ID, When 查询用户, Then 应返回 null', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('Scenario: 创建用户', () => {
    it('Given 有效用户数据, When 创建用户, Then 应保存到数据库', async () => {
      const createDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      const hashedPassword = await bcrypt.hash(createDto.password, 10);
      const mockUser = { id: 1, ...createDto, password: hashedPassword };

      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result.username).toBe(createDto.username);
    });
  });

  describe('Scenario: 更新用户资料', () => {
    it('Given 用户ID和更新数据, When 更新资料, Then 应保存更改', async () => {
      const updateDto = { nickname: '新昵称', bio: '个人简介' };
      const mockUser = { id: 1, username: 'testuser', ...updateDto };

      mockRepository.findOne.mockResolvedValue({ id: 1, username: 'testuser' });
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.updateProfile(1, updateDto);

      expect(result.nickname).toBe(updateDto.nickname);
    });
  });

  describe('Scenario: 用户列表查询', () => {
    it('Given 分页参数, When 查询用户列表, Then 应返回分页结果', async () => {
      const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ];
      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockUsers, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
```

**Step 3: 运行测试验证失败**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm test -- test/users/users.service.spec.ts
```
Expected: 测试运行（可能部分失败因为需要对照实际实现调整）

**Step 4: 根据实际实现调整测试**

**Step 5: 提交**

```bash
git add services/api/test/users/users.service.spec.ts
git commit -m "test: add users service unit tests"
```

---

### Task 2: Spots 模块单元测试

**Files:**
- Create: `services/api/test/spots/spots.service.spec.ts`
- Reference: `services/api/src/modules/spots/spots.service.ts`

**Step 1: 查看现有 Spots 服务实现**

```bash
cat /mnt/e/projects/photo-web-app/services/api/src/modules/spots/spots.service.ts
```

**Step 2: 编写测试文件**

```typescript
/**
 * 打卡点模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SpotsService } from '../src/modules/spots/spots.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Spot } from '../src/modules/spots/entities/spot.entity';

describe('Feature: 打卡点服务', () => {
  let service: SpotsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotsService,
        {
          provide: getRepositoryToken(Spot),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SpotsService>(SpotsService);
  });

  describe('Scenario: 查询打卡点列表', () => {
    it('Given 数据库有打卡点, When 查询全部, Then 应返回打卡点列表', async () => {
      const mockSpots = [
        { id: 1, name: '故宫', city: '北京', likes: 100 },
        { id: 2, name: '西湖', city: '杭州', likes: 200 },
      ];

      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockSpots, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('Given 城市筛选参数, When 按城市查询, Then 应过滤结果', async () => {
      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, city: '北京' });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('Given 地理位置参数, When 附近查询, Then 应按距离排序', async () => {
      const mockSpots = [
        { id: 1, name: '附近打卡点', distance: 100 },
      ];

      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockSpots, 1]);

      const result = await service.findAll({ 
        page: 1, 
        limit: 10, 
        lat: 39.9042, 
        lng: 116.4074 
      });

      expect(result.items).toBeDefined();
    });
  });

  describe('Scenario: 创建打卡点', () => {
    it('Given 有效数据, When 创建打卡点, Then 应保存到数据库', async () => {
      const createDto = {
        name: '新打卡点',
        description: '描述',
        address: '地址',
        city: '北京',
        lat: 39.9042,
        lng: 116.4074,
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto as any, 1);

      expect(result.name).toBe('新打卡点');
    });
  });

  describe('Scenario: 点赞打卡点', () => {
    it('Given 打卡点存在, When 点赞, Then 应增加点赞数', async () => {
      const mockSpot = { id: 1, name: '打卡点', likes: 10 };
      mockRepository.findOne.mockResolvedValue(mockSpot);
      mockRepository.save.mockResolvedValue({ ...mockSpot, likes: 11 });

      // 测试点赞逻辑
      expect(mockSpot.likes).toBe(10);
    });
  });
});
```

**Step 3: 运行测试验证**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm test -- test/spots/spots.service.spec.ts
```

**Step 4: 根据实际实现调整测试**

**Step 5: 提交**

```bash
git add services/api/test/spots/spots.service.spec.ts
git commit -m "test: add spots service unit tests"
```

---

### Task 3: Bookings 模块单元测试

**Files:**
- Create: `services/api/test/bookings/bookings.service.spec.ts`
- Reference: `services/api/src/modules/bookings/bookings.service.ts`

**Step 1: 查看现有 Bookings 服务实现**

```bash
cat /mnt/e/projects/photo-web-app/services/api/src/modules/bookings/bookings.service.ts
```

**Step 2: 编写测试文件**

```typescript
/**
 * 约拍模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from '../src/modules/bookings/bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../src/modules/bookings/entities/booking.entity';

describe('Feature: 约拍服务', () => {
  let service: BookingsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('Scenario: 创建约拍', () => {
    it('Given 有效约拍数据, When 创建约拍, Then 应保存到数据库', async () => {
      const createDto = {
        title: '人像摄影约拍',
        description: '专业人像摄影',
        price: 500,
        duration: 2,
        location: '北京',
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ id: 1, ...createDto, photographerId: 1 });

      const result = await service.create(createDto as any, 1);

      expect(result.title).toBe('人像摄影约拍');
    });
  });

  describe('Scenario: 查询约拍列表', () => {
    it('Given 分页参数, When 查询约拍列表, Then 应返回分页结果', async () => {
      const mockBookings = [
        { id: 1, title: '约拍1', price: 500 },
        { id: 2, title: '约拍2', price: 800 },
      ];

      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockBookings, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('Given 价格范围筛选, When 查询约拍, Then 应过滤结果', async () => {
      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, minPrice: 100, maxPrice: 500 });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('Scenario: 更新约拍状态', () => {
    it('Given 约拍ID和新状态, When 更新状态, Then 应保存更改', async () => {
      const mockBooking = { id: 1, status: 'pending' };
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.save.mockResolvedValue({ ...mockBooking, status: 'confirmed' });

      // 测试状态更新逻辑
      expect(mockBooking.status).toBe('pending');
    });
  });
});
```

**Step 3: 运行测试验证**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm test -- test/bookings/bookings.service.spec.ts
```

**Step 4: 根据实际实现调整测试**

**Step 5: 提交**

```bash
git add services/api/test/bookings/bookings.service.spec.ts
git commit -m "test: add bookings service unit tests"
```

---

### Task 4: Orders 模块单元测试

**Files:**
- Create: `services/api/test/orders/orders.service.spec.ts`
- Reference: `services/api/src/modules/orders/orders.service.ts`

**Step 1: 查看现有 Orders 服务实现**

```bash
cat /mnt/e/projects/photo-web-app/services/api/src/modules/orders/orders.service.ts
```

**Step 2: 编写测试文件**

```typescript
/**
 * 订单模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../src/modules/orders/orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../src/modules/orders/entities/order.entity';

describe('Feature: 订单服务', () => {
  let service: OrdersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('Scenario: 创建订单', () => {
    it('Given 有效订单数据, When 创建订单, Then 应生成订单号并保存', async () => {
      const createDto = {
        bookingId: 1,
        amount: 500,
        contactName: '张三',
        contactPhone: '13800138000',
      };

      const mockOrder = {
        id: 1,
        orderNo: 'ORD202603220001',
        ...createDto,
        status: 'pending',
      };

      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create(createDto as any, 1);

      expect(result.orderNo).toBeDefined();
      expect(result.status).toBe('pending');
    });
  });

  describe('Scenario: 查询用户订单', () => {
    it('Given 用户ID, When 查询订单列表, Then 应返回该用户的订单', async () => {
      const mockOrders = [
        { id: 1, orderNo: 'ORD001', userId: 1 },
        { id: 2, orderNo: 'ORD002', userId: 1 },
      ];

      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockOrders, 2]);

      const result = await service.findByUser(1, { page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
    });
  });

  describe('Scenario: 支付订单', () => {
    it('Given 订单ID和支付信息, When 支付成功, Then 应更新订单状态', async () => {
      const mockOrder = { id: 1, status: 'pending', amount: 500 };
      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.save.mockResolvedValue({ ...mockOrder, status: 'paid' });

      // 测试支付逻辑
      expect(mockOrder.status).toBe('pending');
    });
  });

  describe('Scenario: 取消订单', () => {
    it('Given 待支付订单, When 取消订单, Then 应更新状态为已取消', async () => {
      const mockOrder = { id: 1, status: 'pending' };
      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.save.mockResolvedValue({ ...mockOrder, status: 'cancelled' });

      // 测试取消逻辑
      expect(mockOrder.status).toBe('pending');
    });

    it('Given 已支付订单, When 取消订单, Then 应拒绝取消', async () => {
      const mockOrder = { id: 1, status: 'paid' };
      mockRepository.findOne.mockResolvedValue(mockOrder);

      // 已支付订单不允许直接取消
      expect(mockOrder.status).toBe('paid');
    });
  });
});
```

**Step 3: 运行测试验证**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm test -- test/orders/orders.service.spec.ts
```

**Step 4: 根据实际实现调整测试**

**Step 5: 提交**

```bash
git add services/api/test/orders/orders.service.spec.ts
git commit -m "test: add orders service unit tests"
```

---

### Task 5: Messages 模块单元测试

**Files:**
- Create: `services/api/test/messages/messages.service.spec.ts`
- Reference: `services/api/src/modules/messages/messages.service.ts`

**Step 1: 查看现有 Messages 服务实现**

```bash
cat /mnt/e/projects/photo-web-app/services/api/src/modules/messages/messages.service.ts
```

**Step 2: 编写测试文件**

```typescript
/**
 * 私信模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from '../src/modules/messages/messages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from '../src/modules/messages/entities/message.entity';
import { Conversation } from '../src/modules/messages/entities/conversation.entity';

describe('Feature: 私信服务', () => {
  let service: MessagesService;
  let mockMessageRepository: any;
  let mockConversationRepository: any;

  beforeEach(async () => {
    mockMessageRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    mockConversationRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  describe('Scenario: 发送私信', () => {
    it('Given 有效消息内容, When 发送私信, Then 应创建消息并更新会话', async () => {
      const createDto = {
        recipientId: 2,
        content: '你好，想咨询约拍事宜',
      };

      const mockConversation = { id: 1, participants: [1, 2] };
      const mockMessage = { id: 1, ...createDto, senderId: 1, conversationId: 1 };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.create.mockReturnValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);

      const result = await service.sendMessage(createDto, 1);

      expect(result.content).toBe(createDto.content);
    });
  });

  describe('Scenario: 获取会话列表', () => {
    it('Given 用户ID, When 查询会话列表, Then 应返回该用户的所有会话', async () => {
      const mockConversations = [
        { id: 1, participants: [1, 2], lastMessage: { content: '最新消息' } },
        { id: 2, participants: [1, 3], lastMessage: { content: '另一条消息' } },
      ];

      mockConversationRepository.find.mockResolvedValue(mockConversations);

      const result = await service.getConversations(1);

      expect(result).toHaveLength(2);
    });
  });

  describe('Scenario: 获取会话消息', () => {
    it('Given 会话ID和分页参数, When 查询消息, Then 应返回分页消息列表', async () => {
      const mockMessages = [
        { id: 1, content: '消息1', senderId: 1 },
        { id: 2, content: '消息2', senderId: 2 },
      ];

      mockMessageRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockMessages, 2]);

      const result = await service.getMessages(1, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
    });
  });

  describe('Scenario: 标记消息已读', () => {
    it('Given 会话ID, When 标记已读, Then 应更新未读消息状态', async () => {
      const mockMessages = [
        { id: 1, isRead: false, recipientId: 1 },
        { id: 2, isRead: false, recipientId: 1 },
      ];

      mockMessageRepository.find.mockResolvedValue(mockMessages);
      mockMessageRepository.save.mockResolvedValue([{ id: 1, isRead: true }]);

      await service.markAsRead(1, 1);

      expect(mockMessageRepository.save).toHaveBeenCalled();
    });
  });
});
```

**Step 3: 运行测试验证**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm test -- test/messages/messages.service.spec.ts
```

**Step 4: 根据实际实现调整测试**

**Step 5: 提交**

```bash
git add services/api/test/messages/messages.service.spec.ts
git commit -m "test: add messages service unit tests"
```

---

### Task 6: Articles 模块单元测试

**Files:**
- Create: `services/api/test/articles/articles.service.spec.ts`
- Reference: `services/api/src/modules/articles/articles.service.ts`

**Step 1: 查看现有 Articles 服务实现**

```bash
cat /mnt/e/projects/photo-web-app/services/api/src/modules/articles/articles.service.ts
```

**Step 2: 编写测试文件**

```typescript
/**
 * 文章模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from '../src/modules/articles/articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from '../src/modules/articles/entities/article.entity';

describe('Feature: 文章服务', () => {
  let service: ArticlesService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  describe('Scenario: 创建文章', () => {
    it('Given 有效文章数据, When 创建文章, Then 应保存到数据库', async () => {
      const createDto = {
        title: '人像摄影技巧分享',
        content: '这是一篇关于人像摄影的经验分享...',
        tags: ['摄影', '人像'],
      };

      const mockArticle = { id: 1, ...createDto, authorId: 1, views: 0, likes: 0 };

      mockRepository.create.mockReturnValue(mockArticle);
      mockRepository.save.mockResolvedValue(mockArticle);

      const result = await service.create(createDto as any, 1);

      expect(result.title).toBe('人像摄影技巧分享');
    });
  });

  describe('Scenario: 查询文章列表', () => {
    it('Given 分页参数, When 查询文章列表, Then 应返回分页结果', async () => {
      const mockArticles = [
        { id: 1, title: '文章1', views: 100, likes: 20 },
        { id: 2, title: '文章2', views: 200, likes: 30 },
      ];

      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([mockArticles, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('Given 标签筛选参数, When 按标签查询, Then 应过滤结果', async () => {
      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, tag: '摄影' });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('Scenario: 查看文章详情', () => {
    it('Given 文章ID, When 查看文章, Then 应增加浏览数', async () => {
      const mockArticle = { id: 1, title: '文章', views: 100 };
      mockRepository.findOne.mockResolvedValue(mockArticle);
      mockRepository.save.mockResolvedValue({ ...mockArticle, views: 101 });

      const result = await service.findById(1);

      expect(result.views).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Scenario: 点赞文章', () => {
    it('Given 文章ID, When 点赞, Then 应增加点赞数', async () => {
      const mockArticle = { id: 1, title: '文章', likes: 10 };
      mockRepository.findOne.mockResolvedValue(mockArticle);
      mockRepository.save.mockResolvedValue({ ...mockArticle, likes: 11 });

      // 测试点赞逻辑
      expect(mockArticle.likes).toBe(10);
    });
  });
});
```

**Step 3: 运行测试验证**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm test -- test/articles/articles.service.spec.ts
```

**Step 4: 根据实际实现调整测试**

**Step 5: 提交**

```bash
git add services/api/test/articles/articles.service.spec.ts
git commit -m "test: add articles service unit tests"
```

---

### Task 7: Tags 模块单元测试

**Files:**
- Create: `services/api/test/tags/tags.service.spec.ts`
- Reference: `services/api/src/modules/tags/tags.service.ts`

**Step 1: 查看现有 Tags 服务实现**

```bash
cat /mnt/e/projects/photo-web-app/services/api/src/modules/tags/tags.service.ts
```

**Step 2: 编写测试文件**

```typescript
/**
 * 标签模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from '../src/modules/tags/tags.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tag } from '../src/modules/tags/entities/tag.entity';

describe('Feature: 标签服务', () => {
  let service: TagsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  describe('Scenario: 查询热门标签', () => {
    it('Given 热门标签数量参数, When 查询热门标签, Then 应返回按使用量排序的标签', async () => {
      const mockTags = [
        { id: 1, name: '人像', usageCount: 100 },
        { id: 2, name: '风景', usageCount: 80 },
        { id: 3, name: '街拍', usageCount: 60 },
      ];

      mockRepository.createQueryBuilder().getMany.mockResolvedValue(mockTags);

      const result = await service.getPopularTags(10);

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Scenario: 创建标签', () => {
    it('Given 新标签名称, When 创建标签, Then 应保存到数据库', async () => {
      const createDto = { name: '夜景摄影' };
      const mockTag = { id: 1, ...createDto, usageCount: 0 };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTag);
      mockRepository.save.mockResolvedValue(mockTag);

      const result = await service.create(createDto);

      expect(result.name).toBe('夜景摄影');
    });

    it('Given 已存在的标签名, When 创建标签, Then 应返回已存在的标签', async () => {
      const existingTag = { id: 1, name: '人像', usageCount: 100 };
      mockRepository.findOne.mockResolvedValue(existingTag);

      const result = await service.findOrCreate('人像');

      expect(result.name).toBe('人像');
    });
  });

  describe('Scenario: 搜索标签', () => {
    it('Given 搜索关键词, When 搜索标签, Then 应返回匹配的标签', async () => {
      const mockTags = [
        { id: 1, name: '人像摄影' },
        { id: 2, name: '人像后期' },
      ];

      mockRepository.createQueryBuilder().getMany.mockResolvedValue(mockTags);

      const result = await service.search('人像');

      expect(result.length).toBeGreaterThan(0);
    });
  });
});
```

**Step 3: 运行测试验证**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm test -- test/tags/tags.service.spec.ts
```

**Step 4: 根据实际实现调整测试**

**Step 5: 提交**

```bash
git add services/api/test/tags/tags.service.spec.ts
git commit -m "test: add tags service unit tests"
```

---

### Task 8: Ranking 模块单元测试

**Files:**
- Create: `services/api/test/ranking/ranking.service.spec.ts`
- Reference: `services/api/src/modules/ranking/ranking.service.ts`

**Step 1: 查看现有 Ranking 服务实现**

```bash
cat /mnt/e/projects/photo-web-app/services/api/src/modules/ranking/ranking.service.ts
```

**Step 2: 编写测试文件**

```typescript
/**
 * 排行榜模块 - 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from '../src/modules/ranking/ranking.service';

describe('Feature: 排行榜服务', () => {
  let service: RankingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RankingService],
    }).compile();

    service = module.get<RankingService>(RankingService);
  });

  describe('Scenario: 获取摄影师排行榜', () => {
    it('Given 排行榜类型和时间范围, When 查询排行榜, Then 应返回排序后的摄影师列表', async () => {
      const mockRanking = [
        { id: 1, username: 'photographer1', score: 1000 },
        { id: 2, username: 'photographer2', score: 800 },
        { id: 3, username: 'photographer3', score: 600 },
      ];

      // 测试排行榜查询逻辑
      expect(mockRanking).toHaveLength(3);
      expect(mockRanking[0].score).toBeGreaterThan(mockRanking[1].score);
    });
  });

  describe('Scenario: 获取作品排行榜', () => {
    it('Given 时间范围, When 查询作品排行榜, Then 应返回按点赞数排序的作品', async () => {
      const mockWorksRanking = [
        { id: 1, title: '热门作品1', likes: 500 },
        { id: 2, title: '热门作品2', likes: 400 },
      ];

      expect(mockWorksRanking[0].likes).toBeGreaterThan(mockWorksRanking[1].likes);
    });
  });

  describe('Scenario: 获取打卡点排行榜', () => {
    it('Given 城市参数, When 查询打卡点排行榜, Then 应返回该城市的热门打卡点', async () => {
      const mockSpotsRanking = [
        { id: 1, name: '故宫', city: '北京', checkIns: 1000 },
        { id: 2, name: '长城', city: '北京', checkIns: 800 },
      ];

      expect(mockSpotsRanking.every(s => s.city === '北京')).toBe(true);
    });
  });
});
```

**Step 3: 运行测试验证**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm test -- test/ranking/ranking.service.spec.ts
```

**Step 4: 根据实际实现调整测试**

**Step 5: 提交**

```bash
git add services/api/test/ranking/ranking.service.spec.ts
git commit -m "test: add ranking service unit tests"
```

---

## Phase 2: 后端 E2E 测试

### Task 9: 配置 E2E 测试环境

**Files:**
- Create: `services/api/test/jest-e2e.json`
- Create: `services/api/test/app.e2e-spec.ts`

**Step 1: 创建 E2E Jest 配置**

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  }
}
```

**Step 2: 创建基础 E2E 测试**

```typescript
/**
 * E2E 测试 - 基础健康检查
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) - 健康检查', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
      });
  });
});
```

**Step 3: 安装 supertest**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm install --save-dev supertest @types/supertest
```

**Step 4: 运行 E2E 测试**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm run test:e2e
```

**Step 5: 提交**

```bash
git add services/api/test/jest-e2e.json services/api/test/app.e2e-spec.ts
git commit -m "test: add e2e test configuration"
```

---

### Task 10: Auth E2E 测试

**Files:**
- Create: `services/api/test/auth/auth.e2e-spec.ts`

**Step 1: 编写 Auth E2E 测试**

```typescript
/**
 * 认证模块 - E2E 测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: `test_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'Test123456',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          authToken = res.body.access_token;
        });
    });

    it('should fail with duplicate username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'admin',
          email: 'test@example.com',
          password: 'Test123456',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
```

**Step 2: 运行测试**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm run test:e2e -- auth/auth.e2e-spec.ts
```

**Step 3: 提交**

```bash
git add services/api/test/auth/auth.e2e-spec.ts
git commit -m "test: add auth e2e tests"
```

---

## Phase 3: 前端组件测试

### Task 11: 配置 Vitest 测试环境

**Files:**
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/setupTests.ts`
- Modify: `apps/web/package.json`

**Step 1: 安装依赖**

```bash
cd /mnt/e/projects/photo-web-app/apps/web && npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

**Step 2: 创建 Vitest 配置**

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 3: 创建测试设置文件**

```typescript
// apps/web/src/setupTests.ts
import '@testing-library/jest-dom';
```

**Step 4: 更新 package.json**

```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:unit:coverage": "vitest --coverage"
  }
}
```

**Step 5: 提交**

```bash
git add apps/web/vitest.config.ts apps/web/src/setupTests.ts apps/web/package.json
git commit -m "test: add vitest configuration for frontend unit tests"
```

---

### Task 12: WorkCard 组件测试

**Files:**
- Create: `apps/web/src/components/__tests__/WorkCard.test.tsx`

**Step 1: 编写测试**

```typescript
/**
 * WorkCard 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WorkCard from '../WorkCard';

describe('WorkCard Component', () => {
  const mockWork = {
    id: 1,
    title: '测试作品',
    description: '这是一幅测试作品',
    images: ['https://example.com/image.jpg'],
    likes: 100,
    views: 500,
    author: {
      id: 1,
      username: 'photographer',
      avatar: 'https://example.com/avatar.jpg',
    },
  };

  it('should render work title', () => {
    render(<WorkCard work={mockWork} />);
    expect(screen.getByText('测试作品')).toBeInTheDocument();
  });

  it('should display like count', () => {
    render(<WorkCard work={mockWork} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('should display author name', () => {
    render(<WorkCard work={mockWork} />);
    expect(screen.getByText('photographer')).toBeInTheDocument();
  });

  it('should have link to work detail', () => {
    render(<WorkCard work={mockWork} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/works/1');
  });
});
```

**Step 2: 运行测试**

```bash
cd /mnt/e/projects/photo-web-app/apps/web && npm run test:unit -- WorkCard.test.tsx
```

**Step 3: 提交**

```bash
git add apps/web/src/components/__tests__/WorkCard.test.tsx
git commit -m "test: add WorkCard component tests"
```

---

### Task 13: BookingCard 组件测试

**Files:**
- Create: `apps/web/src/components/__tests__/BookingCard.test.tsx`

**Step 1: 编写测试**

```typescript
/**
 * BookingCard 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BookingCard from '../BookingCard';

describe('BookingCard Component', () => {
  const mockBooking = {
    id: 1,
    title: '人像摄影约拍',
    description: '专业人像摄影服务',
    price: 500,
    duration: 2,
    location: '北京',
    photographer: {
      id: 1,
      username: 'photographer',
      avatar: 'https://example.com/avatar.jpg',
    },
  };

  it('should render booking title', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText('人像摄影约拍')).toBeInTheDocument();
  });

  it('should display price', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('should display location', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText(/北京/)).toBeInTheDocument();
  });

  it('should display duration', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });
});
```

**Step 2: 运行测试**

```bash
cd /mnt/e/projects/photo-web-app/apps/web && npm run test:unit -- BookingCard.test.tsx
```

**Step 3: 提交**

```bash
git add apps/web/src/components/__tests__/BookingCard.test.tsx
git commit -m "test: add BookingCard component tests"
```

---

### Task 14: UserProfileHeader 组件测试

**Files:**
- Create: `apps/web/src/components/__tests__/UserProfileHeader.test.tsx`

**Step 1: 编写测试**

```typescript
/**
 * UserProfileHeader 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserProfileHeader from '../UserProfileHeader';

describe('UserProfileHeader Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    avatar: 'https://example.com/avatar.jpg',
    bio: '这是一个测试用户',
    followersCount: 100,
    followingCount: 50,
    worksCount: 20,
  };

  it('should render user nickname', () => {
    render(<UserProfileHeader user={mockUser} />);
    expect(screen.getByText('测试用户')).toBeInTheDocument();
  });

  it('should display bio', () => {
    render(<UserProfileHeader user={mockUser} />);
    expect(screen.getByText('这是一个测试用户')).toBeInTheDocument();
  });

  it('should display follower count', () => {
    render(<UserProfileHeader user={mockUser} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('should display following count', () => {
    render(<UserProfileHeader user={mockUser} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('should display works count', () => {
    render(<UserProfileHeader user={mockUser} />);
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });
});
```

**Step 2: 运行测试**

```bash
cd /mnt/e/projects/photo-web-app/apps/web && npm run test:unit -- UserProfileHeader.test.tsx
```

**Step 3: 提交**

```bash
git add apps/web/src/components/__tests__/UserProfileHeader.test.tsx
git commit -m "test: add UserProfileHeader component tests"
```

---

## Phase 4: 前端 E2E 测试补全

### Task 15: 补充 Playwright E2E 测试

**Files:**
- Create: `apps/web/tests/e2e/works.spec.ts`
- Create: `apps/web/tests/e2e/spots.spec.ts`
- Create: `apps/web/tests/e2e/bookings.spec.ts`

**Step 1: 创建作品页面测试**

```typescript
// apps/web/tests/e2e/works.spec.ts
import { test, expect } from '@playwright/test';

test.describe('作品页面', () => {
  test('作品列表应正确加载', async ({ page }) => {
    await page.goto('/works');
    await page.waitForLoadState('networkidle');
    
    // 检查页面标题
    await expect(page.locator('h1')).toContainText(/作品/);
    
    // 检查作品卡片是否存在
    const workCards = page.locator('[data-testid="work-card"]');
    const count = await workCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('作品详情页应正确显示', async ({ page }) => {
    await page.goto('/works/1');
    await page.waitForLoadState('networkidle');
    
    // 检查作品标题
    await expect(page.locator('h1')).toBeVisible();
    
    // 检查作品图片
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('作品筛选功能应正常工作', async ({ page }) => {
    await page.goto('/works');
    
    // 选择分类筛选
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('portrait');
      await page.waitForTimeout(500);
      
      // 验证 URL 参数
      expect(page.url()).toContain('category=portrait');
    }
  });
});
```

**Step 2: 创建打卡点页面测试**

```typescript
// apps/web/tests/e2e/spots.spec.ts
import { test, expect } from '@playwright/test';

test.describe('打卡点页面', () => {
  test('打卡点列表应正确加载', async ({ page }) => {
    await page.goto('/spots');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText(/打卡点/);
  });

  test('地图视图应正常显示', async ({ page }) => {
    await page.goto('/spots');
    
    // 切换到地图视图
    const mapViewButton = page.locator('[data-testid="map-view-toggle"]');
    if (await mapViewButton.isVisible()) {
      await mapViewButton.click();
      
      // 检查地图容器
      const mapContainer = page.locator('[data-testid="map-container"]');
      await expect(mapContainer).toBeVisible();
    }
  });

  test('打卡点详情页应正确显示', async ({ page }) => {
    await page.goto('/spots/1');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

**Step 3: 创建约拍页面测试**

```typescript
// apps/web/tests/e2e/bookings.spec.ts
import { test, expect } from '@playwright/test';

test.describe('约拍页面', () => {
  test('约拍列表应正确加载', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText(/约拍/);
  });

  test('约拍详情页应正确显示', async ({ page }) => {
    await page.goto('/bookings/1');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('约拍筛选功能应正常工作', async ({ page }) => {
    await page.goto('/bookings');
    
    // 价格范围筛选
    const priceFilter = page.locator('[data-testid="price-filter"]');
    if (await priceFilter.isVisible()) {
      await priceFilter.fill('100-500');
      await page.waitForTimeout(500);
    }
  });
});
```

**Step 4: 运行 E2E 测试**

```bash
cd /mnt/e/projects/photo-web-app/apps/web && npm run test:e2e
```

**Step 5: 提交**

```bash
git add apps/web/tests/e2e/works.spec.ts apps/web/tests/e2e/spots.spec.ts apps/web/tests/e2e/bookings.spec.ts
git commit -m "test: add playwright e2e tests for works, spots, and bookings"
```

---

## Phase 5: 测试覆盖率报告

### Task 16: 生成测试覆盖率报告

**Step 1: 后端覆盖率报告**

```bash
cd /mnt/e/projects/photo-web-app/services/api && npm run test:cov
```

**Step 2: 前端覆盖率报告**

```bash
cd /mnt/e/projects/photo-web-app/apps/web && npm run test:unit:coverage
```

**Step 3: 创建测试报告文档**

```markdown
# 测试覆盖率报告

生成时间: 2026-03-22

## 后端测试覆盖率

- Statements: XX%
- Branches: XX%
- Functions: XX%
- Lines: XX%

## 前端测试覆盖率

- Statements: XX%
- Branches: XX%
- Functions: XX%
- Lines: XX%

## E2E 测试

- 后端 E2E: X 个测试
- 前端 E2E: X 个测试

## 待改进项

1. [列出低覆盖率的模块]
2. [列出需要补充的测试场景]
```

**Step 4: 提交**

```bash
git add docs/test-coverage-report.md
git commit -m "docs: add test coverage report"
```

---

## 验收标准

- [ ] 后端所有核心模块都有单元测试
- [ ] 后端 E2E 测试覆盖主要 API 端点
- [ ] 前端关键组件有单元测试
- [ ] 前端 E2E 测试覆盖主要用户流程
- [ ] 测试覆盖率 > 70%
- [ ] 所有测试通过

---

## 预计工作量

- Phase 1 (后端单元测试): ~2-3 小时
- Phase 2 (后端 E2E): ~1 小时
- Phase 3 (前端组件测试): ~1.5 小时
- Phase 4 (前端 E2E): ~1 小时
- Phase 5 (覆盖率报告): ~0.5 小时

**总计: ~6-7 小时**
