# 摄影师服务平台 - Photo Web App

面向业余摄影师的综合服务平台，提供打卡点推荐、约拍平台、作品展示、经验分享等核心功能。

## 🎯 项目目标

为业余摄影师（包括个人工作者和业务爱好者）提供一站式服务平台：
- 📍 **打卡点推荐**: 发现最佳拍摄地点，分享打卡经验
- 🤝 **约拍平台**: 摄影师与模特的约拍，支持互勉和收费模式
- 📸 **作品展示**: 展示摄影作品，获得曝光和评价
- 📚 **经验分享**: 分享拍摄参数、摆拍姿势、器材评测等经验
- 🎯 **积分等级**: 完善的用户成长体系
- 💰 **订单管理**: 完整的订单流程和图片交付，支持AI修图

## 🏗️ 技术架构

### 前端技术栈
- **Web端**: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
- **移动端**: React Native + Expo
- **小程序**: uni-app (Vue3)
- **状态管理**: Zustand + React Query
- **地图服务**: 高德地图API

### 后端技术栈
- **API服务**: NestJS + TypeScript
- **数据库**: PostgreSQL + PostGIS + Redis
- **AI服务**: FastAPI (Python)
- **文件存储**: 阿里云OSS/腾讯云COS
- **消息队列**: RabbitMQ

### 跨端策略
- 前后端分离，API多端共享
- TypeScript全栈，类型安全
- 微服务架构，独立部署

## 📁 项目结构

```
photo-web-app/
├── apps/                          # 应用层
│   ├── web/                       # Web前端应用
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router页面
│   │   │   ├── components/       # 可复用组件
│   │   │   ├── lib/              # 工具函数
│   │   │   ├── hooks/            # 自定义Hooks
│   │   │   ├── store/            # 状态管理
│   │   │   ├── types/            # TypeScript类型定义
│   │   │   └── styles/           # 全局样式
│   │   ├── public/               # 静态资源
│   │   └── package.json
│   ├── mobile/                   # React Native移动端
│   │   ├── src/
│   │   │   ├── screens/          # 页面
│   │   │   ├── components/       # 组件
│   │   │   ├── navigation/       # 导航配置
│   │   │   └── api/              # API调用
│   │   └── package.json
│   └── miniapp/                   # uni-app小程序
│       ├── src/
│       │   ├── pages/            # 页面
│       │   ├── components/       # 组件
│       │   └── api/              # API调用
│       └── package.json
│
├── services/                      # 后端服务
│   ├── api/                       # 主API服务 (NestJS)
│   │   ├── src/
│   │   │   ├── modules/          # 业务模块
│   │   │   │   ├── auth/         # 认证模块
│   │   │   │   ├── users/        # 用户模块
│   │   │   │   ├── works/        # 作品模块
│   │   │   │   ├── spots/        # 打卡点模块
│   │   │   │   ├── bookings/     # 约拍模块
│   │   │   │   ├── orders/       # 订单模块
│   │   │   │   ├── articles/     # 文章模块
│   │   │   │   ├── notifications/# 通知模块
│   │   │   │   └── upload/       # 上传模块
│   │   │   ├── common/           # 公共模块
│   │   │   │   ├── guards/       # 守卫
│   │   │   │   ├── decorators/   # 装饰器
│   │   │   │   ├── filters/      # 异常过滤
│   │   │   │   ├── pipes/        # 数据管道
│   │   │   │   └── interceptors/ # 拦截器
│   │   │   └── main.ts
│   │   └── package.json
│   ├── ai/                        # AI服务 (FastAPI)
│   │   ├── src/
│   │   │   ├── routes/           # 路由
│   │   │   ├── services/         # AI服务
│   │   │   └── models/           # AI模型
│   │   └── requirements.txt
│   └── worker/                    # 异步任务处理
│       ├── src/
│       │   ├── jobs/             # 任务定义
│       │   └── workers/          # Worker处理
│       └── package.json
│
├── shared/                        # 共享代码
│   ├── types/                     # TypeScript类型定义
│   │   ├── user.types.ts
│   │   ├── work.types.ts
│   │   └── api.types.ts
│   ├── constants/                 # 常量定义
│   │   ├── api.constants.ts
│   │   └── app.constants.ts
│   └── utils/                     # 工具函数
│       ├── validation.util.ts
│       └── format.util.ts
│
├── infrastructure/                 # 基础设施
│   ├── database/                  # 数据库脚本
│   │   ├── migrations/           # 数据库迁移
│   │   ├── seeds/                # 种子数据
│   │   └── schema.sql
│   ├── docker/                    # Docker配置
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.api
│   │   └── Dockerfile.ai
│   └── nginx/                     # Nginx配置
│       └── nginx.conf
│
├── docs/                          # 文档
│   ├── architecture.md           # 架构设计
│   ├── database.md               # 数据库设计
│   ├── api.md                    # API文档
│   ├── deployment.md             # 部署文档
│   └── development.md            # 开发指南
│
├── scripts/                       # 脚本工具
│   ├── setup.sh                  # 项目初始化
│   ├── build.sh                  # 构建脚本
│   └── deploy.sh                 # 部署脚本
│
├── .env.example                  # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- Python >= 3.9
- PostgreSQL >= 15
- Redis >= 7
- Docker & Docker Compose

### 安装依赖

```bash
# 安装项目依赖
npm install

# 或使用bun
bun install
```

### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

### 启动开发环境

```bash
# 启动所有服务
docker-compose up -d

# 等待服务启动
docker-compose ps

# 初始化数据库
npm run db:migrate
npm run db:seed
```

### 启动应用

```bash
# 启动Web前端
cd apps/web && npm run dev

# 启动API服务
cd services/api && npm run start:dev

# 启动AI服务
cd services/ai && uvicorn src.main:app --reload
```

访问应用:
- Web前端: http://localhost:3000
- API服务: http://localhost:8000
- AI服务: http://localhost:8001
- Swagger文档: http://localhost:8000/docs

## 📋 开发规范

### 代码风格
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循TypeScript最佳实践

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

### 分支管理
- `main`: 主分支，生产环境代码
- `develop`: 开发分支
- `feature/*`: 功能分支
- `bugfix/*`: 修复分支
- `hotfix/*`: 紧急修复分支

## 🧪 测试

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成测试覆盖率报告
npm run test:coverage
```

## 🏗️ 构建部署

### 构建生产版本

```bash
# 构建Web前端
cd apps/web && npm run build

# 构建API服务
cd services/api && npm run build

# 构建Docker镜像
docker-compose build
```

### 部署到生产环境

```bash
# 执行部署脚本
./scripts/deploy.sh

# 或手动部署
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 常用命令

```bash
# 数据库迁移
npm run db:migrate

# 数据库回滚
npm run db:rollback

# 重置数据库
npm run db:reset

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run typecheck
```

## 📊 项目状态

- [ ] Phase 1: 基础设施搭建
- [ ] Phase 2: 用户认证系统
- [ ] Phase 3: 作品展示功能
- [ ] Phase 4: 打卡点功能
- [ ] Phase 5: 约拍平台
- [ ] Phase 6: 订单管理
- [ ] Phase 7: AI修图服务
- [ ] Phase 8: 移动端开发
- [ ] Phase 9: 小程序开发
- [ ] Phase 10: 性能优化

## 🤝 贡献指南

欢迎贡献代码、报告bug或提出建议！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 📞 联系方式

- 项目主页: https://github.com/yourusername/photo-web-app
- 问题反馈: https://github.com/yourusername/photo-web-app/issues
- 邮箱: your.email@example.com

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

**注意**: 本项目目前处于开发阶段，部分功能可能尚未完成或存在bug。使用时请注意备份数据。