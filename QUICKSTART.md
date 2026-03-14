# 🚀 快速启动指南

欢迎来到摄影师服务平台！本指南将帮助您快速启动项目并进行开发。

## 📋 前置要求

在开始之前，请确保您的系统已安装以下工具：

- **Node.js** >= 18.x ([下载链接](https://nodejs.org/))
- **Python** >= 3.9 ([下载链接](https://www.python.org/downloads/))
- **Docker** & **Docker Compose** ([下载链接](https://www.docker.com/get-started))
- **Git** ([下载链接](https://git-scm.com/downloads))

## 🎯 5分钟快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/photo-web-app.git
cd photo-web-app
```

### 2. 运行初始化脚本

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

这个脚本会自动：
- ✅ 检查系统依赖
- ✅ 创建项目目录结构
- ✅ 复制环境变量文件
- ✅ 启动基础设施服务 (数据库、Redis等)
- ✅ 初始化数据库
- ✅ 初始化Git仓库

### 3. 配置环境变量

编辑 `.env` 文件，修改必要的配置：

```bash
vim .env
```

至少需要修改的配置：
```env
# 数据库密码
DB_PASSWORD=your_secure_password

# JWT密钥 (生产环境务必修改)
JWT_SECRET=your-super-secret-jwt-key-change-this

# 地图API密钥
AMAP_KEY=your_amap_api_key
```

### 4. 启动应用服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5. 访问应用

打开浏览器访问以下地址：

- 🌐 **Web前端**: http://localhost:3000
- ⚙️ **API服务**: http://localhost:8000
- 📚 **API文档**: http://localhost:8000/docs
- 🤖 **AI服务**: http://localhost:8001
- 📦 **MinIO控制台**: http://localhost:9001 (minioadmin/minioadmin)
- 🐰 **RabbitMQ管理**: http://localhost:15672 (guest/guest)

## 🛠️ 开发模式启动

如果您需要单独启动各个服务进行开发：

### 启动基础设施服务

```bash
docker-compose up -d postgres redis rabbitmq minio
```

### 启动API服务

```bash
cd services/api
npm install
npm run start:dev
```

### 启动Web前端

```bash
cd apps/web
npm install
npm run dev
```

### 启动AI服务

```bash
cd services/ai
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## 📝 常用命令

### Docker相关
```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service_name]

# 查看服务状态
docker-compose ps
```

### 数据库相关
```bash
# 运行数据库迁移
npm run db:migrate

# 回滚迁移
npm run db:rollback

# 填充测试数据
npm run db:seed

# 连接到数据库
docker exec -it photo_platform_db psql -U postgres -d photo_platform
```

### 测试相关
```bash
# 运行所有测试
npm run test

# 运行前端测试
cd apps/web && npm run test

# 运行后端测试
cd services/api && npm run test
```

### 代码质量
```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run typecheck
```

## 🚨 常见问题

### 问题1: Docker启动失败

**解决方案**:
```bash
# 检查Docker服务状态
sudo systemctl status docker

# 重启Docker服务
sudo systemctl restart docker

# 清理Docker缓存
docker system prune -a
```

### 问题2: 端口被占用

**解决方案**:
```bash
# 查看端口占用
netstat -tuln | grep :3000

# 修改.env文件中的端口号
# 然后重启服务
docker-compose restart
```

### 问题3: 数据库连接失败

**解决方案**:
```bash
# 检查数据库容器状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 等待数据库完全启动
sleep 10
```

### 问题4: 依赖安装失败

**解决方案**:
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用npm ci进行干净安装
npm ci
```

## 📚 下一步学习

### 1. 了解项目结构
查看 `README.md` 了解详细的项目结构说明

### 2. 阅读技术文档
- 📖 [架构设计文档](ARCHITECTURE.md)
- 🗄️ [数据库设计文档](DATABASE.md)
- 🔌 [API接口文档](API.md)
- 👨‍💻 [开发指南](docs/development.md)

### 3. 开始开发
参考以下模块进行开发：
- 🌐 [Web前端开发](apps/web/README.md)
- ⚙️ [API服务开发](services/api/README.md)
- 🤖 [AI服务开发](services/ai/README.md)

### 4. 测试和部署
- 🧪 [测试指南](docs/testing.md)
- 🚀 [部署指南](docs/deployment.md)

## 🆘 获取帮助

如果遇到问题：

1. **查看日志**: `docker-compose logs -f`
2. **搜索问题**: GitHub Issues
3. **提交问题**: 创建新的Issue
4. **联系支持**: support@photoplatform.com

## 🎉 恭喜！

您已经成功启动了摄影师服务平台！现在可以开始开发了。

### 有用的链接
- 📚 [完整文档](docs/)
- 🐛 [问题反馈](https://github.com/yourusername/photo-web-app/issues)
- 💬 [讨论交流](https://github.com/yourusername/photo-web-app/discussions)

---

**提示**: 建议使用VS Code作为开发编辑器，推荐安装以下扩展：
- ESLint
- Prettier
- TypeScript Vue Plugin
- Docker
- GitLens

祝您开发愉快！ 🚀