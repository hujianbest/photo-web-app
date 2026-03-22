# 摄影师服务平台 - Photo Web App

<div align="center">

**面向业余摄影师的一站式综合服务平台**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

</div>

---

## 📋 项目简介

摄影师服务平台是一个面向业余摄影师（个人工作者和摄影爱好者）的综合服务平台，提供打卡点推荐、约拍平台、作品展示、经验分享等核心功能。

### 🎯 核心功能

- 📍 **打卡点推荐** - 发现最佳拍摄地点，分享打卡经验，支持地图视图
- 🤝 **约拍平台** - 摄影师与模特的约拍服务，支持互勉和收费模式
- 📸 **作品展示** - 瀑布流布局展示摄影作品，获得曝光和评价
- 💬 **私信系统** - 摄影师与用户实时沟通
- 👥 **关注系统** - 关注喜欢的摄影师，查看动态
- 🏆 **排行榜** - 摄影师、作品、打卡点排行榜
- 📚 **经验分享** - 分享拍摄参数、摆拍姿势、器材评测
- 🎯 **积分等级** - 完善的用户成长体系
- 💰 **订单管理** - 完整的订单流程和图片交付

---

## 🏗️ 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2 | Web前端框架（App Router） |
| TypeScript | 5.0+ | 类型安全 |
| TailwindCSS | 3.4 | 样式系统 |
| shadcn/ui | - | UI组件库 |
| Zustand | - | 状态管理 |
| React Query | - | 数据请求 |
| Socket.io | 4.x | 实时通信 |
| Playwright | 1.58 | E2E测试 |
| Vitest | 4.1 | 单元测试 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | 10+ | API服务框架 |
| TypeScript | 5.0+ | 类型安全 |
| PostgreSQL | 15+ | 主数据库 |
| PostGIS | - | 地理位置扩展 |
| Redis | 7+ | 缓存与会话 |
| TypeORM | - | ORM框架 |
| JWT | - | 身份认证 |
| Socket.io | 4.x | WebSocket服务 |
| Jest | 29+ | 单元测试 |

### 基础设施

- **Docker & Docker Compose** - 容器化部署
- **Nginx** - 反向代理
- **阿里云OSS/腾讯云COS** - 文件存储

---

## 📁 项目结构

```
photo-web-app/
├── apps/                          # 应用层
│   └── web/                       # Web前端 (Next.js)
│       ├── src/
│       │   ├── app/              # App Router页面
│       │   ├── components/       # 可复用组件
│       │   ├── hooks/            # 自定义Hooks
│       │   ├── lib/              # 工具函数
│       │   ├── store/            # 状态管理
│       │   └── types/            # TypeScript类型
│       └── tests/                # 测试文件
│
├── services/                      # 后端服务
│   └── api/                       # 主API服务 (NestJS)
│       ├── src/
│       │   ├── modules/          # 业务模块
│       │   │   ├── auth/         # 认证模块
│       │   │   ├── users/        # 用户模块
│       │   │   ├── works/        # 作品模块
│       │   │   ├── spots/        # 打卡点模块
│       │   │   ├── bookings/     # 约拍模块
│       │   │   ├── orders/       # 订单模块
│       │   │   ├── articles/     # 文章模块
│       │   │   ├── messages/     # 私信模块
│       │   │   ├── follow/       # 关注模块
│       │   │   ├── tags/         # 标签模块
│       │   │   ├── ranking/      # 排行榜模块
│       │   │   └── notifications/# 通知模块
│       │   └── common/           # 公共模块
│       └── test/                 # 测试文件
│
├── docs/                          # 文档
│   ├── plans/                    # 计划文档
│   ├── deployment.md             # 部署文档
│   └── test-coverage-report.md   # 测试覆盖率报告
│
├── docker-compose.yml            # 开发环境配置
├── docker-compose.prod.yml       # 生产环境配置
└── README.md                     # 项目文档
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- PostgreSQL >= 15
- Redis >= 7
- Docker & Docker Compose (可选)

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/photo-web-app.git
cd photo-web-app
```

2. **安装依赖**

```bash
# 安装前端依赖
cd apps/web && npm install

# 安装后端依赖
cd ../../services/api && npm install
```

3. **配置环境变量**

```bash
# 后端配置
cp services/api/.env.example services/api/.env
# 编辑 services/api/.env 配置数据库连接等

# 前端配置
cp apps/web/.env.example apps/web/.env
```

4. **初始化数据库**

```bash
cd services/api
npm run db:migrate
npm run db:seed
```

5. **启动服务**

```bash
# 启动后端 (终端1)
cd services/api
npm run start:dev

# 启动前端 (终端2)
cd apps/web
npm run dev
```

6. **访问应用**

- Web前端: http://localhost:3000
- API服务: http://localhost:8000
- Swagger文档: http://localhost:8000/docs

### Docker 部署

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 🧪 测试

### 测试覆盖

| 类型 | 测试数 | 通过率 | 覆盖率 |
|------|--------|--------|--------|
| **后端单元测试** | 68 | 100% ✅ | 97%+ (核心模块) |
| **前端组件测试** | 19 | 100% ✅ | - |
| **Playwright E2E** | 32/36 | 89% ✅ | - |

### 运行测试

```bash
# 后端单元测试
cd services/api
npm test                    # 运行所有测试
npm run test:cov            # 生成覆盖率报告
npm run test:e2e            # 运行E2E测试

# 前端组件测试
cd apps/web
npm run test:unit           # 运行Vitest测试
npm run test:e2e            # 运行Playwright测试
```

---

## 📊 项目状态

### ✅ 已完成功能

#### Phase 1: 基础UI优化 (2026-03-21)
- [x] 首页 Hero 区重新设计
- [x] 作品瀑布流布局
- [x] 打卡点地图+列表双视图
- [x] 约拍卡片优化
- [x] 个人主页改版
- [x] 组件集成到页面

#### Phase 2: 社交功能 (2026-03-21)
- [x] 关注系统
- [x] 私信功能
- [x] 话题标签
- [x] 排行榜系统

#### Phase 3: 体验优化 (2026-03-21)
- [x] 富文本编辑器
- [x] 图片压缩优化
- [x] 前端组件优化

#### Phase 4: 生产配置 (2026-03-21)
- [x] Docker Compose
- [x] 部署文档
- [x] 环境变量配置

#### Phase 5: 测试覆盖 (2026-03-22)
- [x] 后端单元测试 (68个)
- [x] 前端组件测试 (19个)
- [x] Playwright E2E测试 (32/36通过)
- [x] 测试覆盖率报告

### 🚧 进行中

- [ ] 配置高德地图 API Key
- [ ] 配置支付（支付宝/微信沙箱）
- [ ] 部署到生产环境

### 📅 计划中

- [ ] AI修图服务
- [ ] 移动端开发 (React Native)
- [ ] 小程序开发 (uni-app)
- [ ] 性能优化

---

## 📈 性能指标

### 测试性能

- **测试通过率**: 89%+ (E2E)
- **核心模块覆盖率**: 97%+ (Users)
- **测试运行时间**: 
  - 后端单元测试: ~22s
  - 前端组件测试: ~2s
  - Playwright E2E: ~1.8分钟

### 构建性能

- **前端构建时间**: ~30s
- **后端构建时间**: ~10s
- **Docker镜像大小**: ~500MB

---

## 🔧 开发规范

### Git 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

### 代码风格

- ESLint + Prettier
- TypeScript 严格模式
- 遵循 Airbnb 风格指南

### 分支管理

- `main` - 主分支（生产环境）
- `develop` - 开发分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

---

## 📚 文档

- [部署文档](docs/deployment.md) - 生产环境部署指南
- [测试报告](docs/test-coverage-report.md) - 测试覆盖率报告
- [优化计划](docs/plans/2026-03-20-ui-optimization.md) - UI优化计划
- [测试计划](docs/plans/2026-03-22-testing-coverage.md) - 测试覆盖计划

---

## 🤝 贡献指南

欢迎贡献代码、报告bug或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- 问题反馈: [GitHub Issues](https://github.com/yourusername/photo-web-app/issues)

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

<div align="center">

**Made with ❤️ by the Photo Web App Team**

</div>
