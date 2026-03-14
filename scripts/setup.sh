#!/bin/bash

# 摄影师服务平台项目初始化脚本

set -e

echo "🚀 开始初始化摄影师服务平台..."

# 检查必要的工具
echo "🔍 检查系统依赖..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js 未安装，请先安装 Node.js"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker 未安装，请先安装 Docker"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose 未安装，请先安装 Docker Compose"; exit 1; }

echo "✅ 系统依赖检查通过"

# 创建必要的目录
echo "📁 创建项目目录..."
mkdir -p apps/{web,mobile,miniapp}/{src,public}
mkdir -p services/{api,ai,worker}/{src,tests}
mkdir -p shared/{types,constants,utils}
mkdir -p infrastructure/{database,docker,nginx}
mkdir -p logs
mkdir -p uploads
mkdir -p docs

echo "✅ 项目目录创建完成"

# 复制环境变量文件
if [ ! -f .env ]; then
    echo "📝 复制环境变量文件..."
    cp .env.example .env
    echo "✅ 环境变量文件已创建，请根据需要修改 .env 文件"
else
    echo "⚠️  .env 文件已存在，跳过创建"
fi

# 启动Docker服务
echo "🐳 启动Docker服务..."
docker-compose up -d postgres redis rabbitmq minio

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 创建数据库schema
echo "📊 初始化数据库..."
if [ -f infrastructure/database/schema.sql ]; then
    docker exec -i photo_platform_db psql -U postgres -d photo_platform < infrastructure/database/schema.sql
    echo "✅ 数据库初始化完成"
else
    echo "⚠️  数据库schema文件不存在，跳过初始化"
fi

# 初始化Git仓库
if [ ! -d .git ]; then
    echo "🔧 初始化Git仓库..."
    git init
    echo "✅ Git仓库初始化完成"
else
    echo "⚠️  Git仓库已存在"
fi

# 创建.gitignore文件
if [ ! -f .gitignore ]; then
    echo "📝 创建.gitignore文件..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log
*.local

# Build outputs
dist/
build/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Uploads
uploads/*
!uploads/.gitkeep

# Logs
logs/*
!logs/.gitkeep

# Temporary files
*.tmp
.cache/

# Database
*.db
*.sqlite

# AI Models
services/ai/models/*
!services/ai/models/.gitkeep
EOF
    echo "✅ .gitignore文件创建完成"
fi

echo ""
echo "🎉 项目初始化完成！"
echo ""
echo "下一步操作："
echo "1. 编辑 .env 文件配置环境变量"
echo "2. 运行以下命令启动开发服务："
echo "   docker-compose up -d"
echo ""
echo "3. 访问以下URL："
echo "   - Web前端: http://localhost:3000"
echo "   - API服务: http://localhost:8000"
echo "   - AI服务: http://localhost:8001"
echo "   - MinIO控制台: http://localhost:9001"
echo "   - RabbitMQ管理界面: http://localhost:15672"
echo ""
echo "📚 查看文档了解详细使用方法"