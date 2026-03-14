# 开发指南

## 🚀 快速开始

### 1. 环境准备

#### 必需工具
- Node.js >= 18.x
- Python >= 3.9
- Docker & Docker Compose
- Git

#### 可选工具
- VS Code (推荐编辑器)
- Postman (API测试)
- pgAdmin (数据库管理)
- RedisInsight (Redis管理)

### 2. 项目初始化

```bash
# 克隆仓库
git clone https://github.com/yourusername/photo-web-app.git
cd photo-web-app

# 运行初始化脚本
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 根据实际情况修改环境变量
vim .env
```

### 4. 启动开发环境

```bash
# 启动基础设施服务 (数据库、Redis等)
docker-compose up -d postgres redis rabbitmq minio

# 等待服务启动
sleep 10

# 初始化数据库
npm run db:migrate

# 启动API服务
cd services/api
npm install
npm run start:dev

# 启动Web前端 (新终端)
cd apps/web
npm install
npm run dev

# 启动AI服务 (新终端)
cd services/ai
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### 5. 访问应用

- **Web前端**: http://localhost:3000
- **API服务**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **AI服务**: http://localhost:8001
- **MinIO控制台**: http://localhost:9001 (用户名/密码: minioadmin)
- **RabbitMQ管理界面**: http://localhost:15672 (用户名/密码: guest)

## 📁 项目结构说明

### apps/ - 应用层
- `web/` - Next.js Web前端应用
- `mobile/` - React Native 移动端应用
- `miniapp/` - uni-app 小程序应用

### services/ - 服务层
- `api/` - NestJS API服务
- `ai/` - FastAPI AI服务
- `worker/` - 异步任务处理服务

### shared/ - 共享代码
- `types/` - TypeScript类型定义
- `constants/` - 常量定义
- `utils/` - 工具函数

### infrastructure/ - 基础设施
- `database/` - 数据库脚本和迁移
- `docker/` - Docker配置文件
- `nginx/` - Nginx配置

## 🛠️ 开发工作流

### 1. 功能开发流程

#### 前端开发
```bash
cd apps/web

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行类型检查
npm run typecheck

# 代码格式化
npm run format

# 运行测试
npm run test
```

#### 后端开发
```bash
cd services/api

# 安装依赖
npm install

# 启动开发服务器
npm run start:dev

# 生成新的模块
nest g module modules/user
nest g service modules/user
nest g controller modules/user

# 数据库迁移
npm run db:migrate

# 运行测试
npm run test
```

#### AI服务开发
```bash
cd services/ai

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn src.main:app --reload

# 运行测试
pytest
```

### 2. 数据库操作

#### 创建迁移
```bash
cd services/api
npm run db:migrate:generate -- src/database/migrations/MyMigration
```

#### 执行迁移
```bash
npm run db:migrate
```

#### 回滚迁移
```bash
npm run db:rollback
```

#### 填充测试数据
```bash
npm run db:seed
```

### 3. API开发规范

#### 控制器示例
```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
```

#### DTO验证示例
```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### 4. 前端开发规范

#### 页面示例
```typescript
// app/users/page.tsx
export default function UsersPage() {
  const { data, isLoading, error } = useSWR('/api/users', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div>
      {data?.map((user) => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  );
}
```

#### 组件示例
```typescript
// components/UserCard.tsx
interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.username} />
      <h3>{user.username}</h3>
      <p>{user.bio}</p>
    </div>
  );
}
```

## 🧪 测试

### 前端测试
```bash
cd apps/web

# 单元测试
npm run test:unit

# 组件测试
npm run test:component

# E2E测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

### 后端测试
```bash
cd services/api

# 单元测试
npm run test

# E2E测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

### API测试

使用Postman或curl测试API：

```bash
# 获取用户列表
curl http://localhost:8000/api/v1/users

# 创建用户
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

## 🐛 调试

### 前端调试
- 使用Chrome DevTools
- React DevTools扩展
- Next.js内置错误边界

### 后端调试
- VS Code调试配置
- 使用console.log调试
- 使用NestJS日志系统

### 数据库调试
```bash
# 连接到数据库
docker exec -it photo_platform_db psql -U postgres -d photo_platform

# 查看表结构
\d users

# 执行查询
SELECT * FROM users LIMIT 10;
```

### Redis调试
```bash
# 连接到Redis
docker exec -it photo_platform_redis redis-cli

# 查看所有键
KEYS *

# 查看键值
GET key_name
```

## 📊 监控和日志

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f ai

# 查看最近100行日志
docker-compose logs --tail=100 api
```

### 监控指标
- **应用性能监控**: 可集成Sentry或New Relic
- **数据库监控**: pgAdmin或Prometheus
- **Redis监控**: RedisInsight
- **容器监控**: Docker stats命令

## 🚀 部署

### 构建生产版本
```bash
# 运行构建脚本
chmod +x scripts/build.sh
./scripts/build.sh 1.0.0
```

### 部署到生产环境
```bash
# 运行部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh 1.0.0 production
```

### Docker Compose生产部署
```bash
# 使用生产配置启动
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

## 🔐 安全最佳实践

### 密码安全
- 使用bcrypt加密密码
- 密码强度验证
- 定期强制密码更换

### API安全
- JWT认证
- HTTPS传输
- 请求限流
- 输入验证和清理

### 数据安全
- SQL注入防护
- XSS防护
- CSRF防护
- 敏感数据加密

## 📚 参考资料

### 官方文档
- [Next.js文档](https://nextjs.org/docs)
- [NestJS文档](https://docs.nestjs.com)
- [FastAPI文档](https://fastapi.tiangolo.com)
- [React Native文档](https://reactnative.dev)

### 相关技术
- [TypeScript文档](https://www.typescriptlang.org/docs)
- [PostgreSQL文档](https://www.postgresql.org/docs)
- [Redis文档](https://redis.io/documentation)
- [Docker文档](https://docs.docker.com)

### 设计规范
- [Material Design](https://material.io/design)
- [Ant Design](https://ant.design/)
- [shadcn/ui](https://ui.shadcn.com/)

## ❓ 常见问题

### Q: 如何重置数据库？
```bash
# 停止服务
docker-compose down

# 删除数据库卷
docker volume rm photo_web-app_postgres_data

# 重新启动
docker-compose up -d

# 运行迁移
npm run db:migrate
npm run db:seed
```

### Q: 如何清理Docker资源？
```bash
# 停止所有容器
docker-compose down

# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷
docker volume prune

# 清理未使用的网络
docker network prune
```

### Q: 如何查看端口占用？
```bash
# 查看端口占用情况
netstat -tuln | grep :3000
lsof -i :3000
```

### Q: 如何处理依赖冲突？
```bash
# 清理node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install

# 或使用npm ci进行干净安装
npm ci
```

## 🤝 贡献指南

1. Fork项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📞 获取帮助

- 查看项目文档: `/docs/`
- 提交问题: GitHub Issues
- 讨论交流: GitHub Discussions
- 邮件联系: support@photoplatform.com