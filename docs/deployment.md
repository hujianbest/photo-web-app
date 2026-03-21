# 部署指南

## 目录

- [环境要求](#环境要求)
- [本地开发部署](#本地开发部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [监控与日志](#监控与日志)
- [备份与恢复](#备份与恢复)
- [故障排查](#故障排查)

## 环境要求

### 基础环境

- **Node.js**: >= 18.x
- **Python**: >= 3.10
- **PostgreSQL**: >= 14
- **Redis**: >= 6
- **RabbitMQ**: >= 3.11
- **MinIO** (或兼容的 S3 存储)

### 系统依赖

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  curl \
  git \
  build-essential \
  python3 \
  python3-pip \
  postgresql-client \
  redis-tools

# CentOS/RHEL
sudo yum install -y \
  curl \
  git \
  gcc \
  gcc-c++ \
  make \
  postgresql \
  redis \
  python3 \
  python3-pip
```

## 本地开发部署

### 1. 克隆项目

```bash
git clone https://github.com/your-org/photo-web-app.git
cd photo-web-app
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库密码等
```

### 3. 启动基础设施服务

```bash
# 启动 PostgreSQL, Redis, RabbitMQ, MinIO
docker-compose up -d postgres redis rabbitmq minio

# 检查服务状态
docker-compose ps
```

### 4. 安装依赖

```bash
# API 服务
cd services/api
npm install
cd ../..

# Web 前端
cd apps/web
npm install
cd ../..

# AI 服务 (可选)
cd services/ai
pip install -r requirements.txt
cd ../..
```

### 5. 初始化数据库

```bash
cd services/api

# 运行数据库迁移
npm run migration:run

# 填充种子数据 (可选)
npm run seed

cd ../..
```

### 6. 启动应用服务

```bash
# 终端 1: 启动 API 服务
cd services/api
npm run start:dev

# 终端 2: 启动 Web 前端
cd apps/web
npm run dev

# 终端 3: 启动 AI 服务 (可选)
cd services/ai
uvicorn src.main:app --reload
```

### 7. 访问应用

- **Web 前端**: http://localhost:3000
- **API 文档**: http://localhost:8000/api/docs
- **MinIO 控制台**: http://localhost:9001
- **RabbitMQ 管理界面**: http://localhost:15672

## 生产环境部署

### 1. 服务器准备

#### 安全配置

```bash
# 更新系统
sudo apt-get update && sudo apt-get upgrade -y

# 配置防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 禁用 root 登录
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

#### 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 配置生产环境变量

```bash
# 复制生产环境配置
cp .env.production.example .env.production

# 编辑配置文件
nano .env.production

# 重要：修改以下配置
# - 所有密码和密钥
# - JWT_SECRET (使用强随机密钥)
# - 数据库连接信息
# - 云存储配置
# - 第三方服务 API 密钥
```

### 3. 生成 SSL 证书

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 证书自动续期
sudo certbot renew --dry-run
```

### 4. 构建生产镜像

```bash
# 构建所有服务镜像
docker-compose -f docker-compose.prod.yml build

# 或单独构建
docker-compose -f docker-compose.prod.yml build api
docker-compose -f docker-compose.prod.yml build web
```

### 5. 启动生产环境

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 检查服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 6. 初始化生产数据库

```bash
# 进入 API 容器
docker-compose -f docker-compose.prod.yml exec api bash

# 运行迁移
npm run migration:run

# 退出容器
exit
```

## Docker 部署

### 镜像构建

```bash
# API 服务
docker build -f infrastructure/docker/Dockerfile.api -t photo-platform-api:latest .

# Web 前端
docker build -f infrastructure/docker/Dockerfile.web -t photo-platform-web:latest .
```

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看容器日志
docker logs -f <container_name>

# 重启容器
docker restart <container_name>

# 停止容器
docker stop <container_name>

# 进入容器
docker exec -it <container_name> bash
```

## 监控与日志

### 日志管理

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f api

# 查看最近 100 行日志
docker-compose -f docker-compose.prod.yml logs --tail=100 api
```

### 健康检查

```bash
# API 服务健康检查
curl http://localhost:8000/health

# Web 前端健康检查
curl http://localhost:3000/health

# 数据库连接检查
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

### 性能监控

推荐集成以下监控工具：

- **Sentry**: 错误追踪
- **Prometheus + Grafana**: 指标监控
- **ELK Stack**: 日志聚合
- **Jaeger**: 分布式追踪

## 备份与恢复

### 数据库备份

```bash
# 手动备份
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres photo_platform_prod > backup_$(date +%Y%m%d).sql

# 自动备份 (添加到 crontab)
0 2 * * * docker-compose -f /path/to/docker-compose.prod.yml exec postgres \
  pg_dump -U postgres photo_platform_prod > /backup/backup_$(date +\%Y\%m\%d).sql
```

### 文件备份

```bash
# 备份上传文件
tar -czf uploads_$(date +%Y%m%d).tar.gz /var/uploads

# 备份 MinIO 数据
docker run --rm -v photo-platform-minio-data:/data \
  -v $(pwd):/backup alpine \
  tar -czf /backup/minio_$(date +%Y%m%d).tar.gz /data
```

### 恢复数据

```bash
# 恢复数据库
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres photo_platform_prod

# 恢复文件
tar -xzf uploads.tar.gz -C /
```

## 故障排查

### 常见问题

#### 1. 服务无法启动

```bash
# 检查端口占用
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :3000

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

#### 2. 数据库连接失败

```bash
# 检查 PostgreSQL 状态
docker-compose -f docker-compose.prod.yml logs postgres

# 测试数据库连接
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres
```

#### 3. 文件上传失败

```bash
# 检查上传目录权限
ls -la /var/uploads

# 修复权限
sudo chown -R node:node /var/uploads
sudo chmod -R 755 /var/uploads
```

#### 4. 内存不足

```bash
# 增加交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 日志级别调整

在 `.env.production` 中调整日志级别：

```bash
# 开发环境
LOG_LEVEL=debug

# 生产环境
LOG_LEVEL=info
```

## 更新部署

### 滚动更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose -f docker-compose.prod.yml build

# 重启服务 (无停机)
docker-compose -f docker-compose.prod.yml up -d --no-deps --build api web

# 清理旧镜像
docker image prune -f
```

### 数据库迁移

```bash
# 进入 API 容器
docker-compose -f docker-compose.prod.yml exec api bash

# 运行迁移
npm run migration:run

# 回滚迁移 (如需要)
npm run migration:revert
```

## 安全最佳实践

1. **定期更新**: 保持系统和依赖包最新
2. **强密码**: 使用强随机密码和密钥
3. **HTTPS**: 生产环境必须使用 HTTPS
4. **防火墙**: 只开放必要的端口
5. **备份**: 定期备份数据和配置
6. **监控**: 设置监控和告警
7. **日志**: 保留审计日志
8. **权限**: 使用最小权限原则

## 扩展阅读

- [NestJS 生产部署](https://docs.nestjs.com/faq/serverless-deployment)
- [Next.js 生产部署](https://nextjs.org/docs/deployment)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL 性能调优](https://wiki.postgresql.org/wiki/Performance_Optimization)
