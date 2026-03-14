#!/bin/bash

# 摄影师服务平台部署脚本

set -e

# 配置变量
VERSION=${1:-"latest"}
PROJECT_NAME="photo-platform"
DEPLOY_ENV=${2:-"production"}
BACKUP_DIR="/opt/backups/$PROJECT_NAME"

echo "🚀 开始部署摄影师服务平台 (环境: $DEPLOY_ENV)..."

# 检查是否提供了版本号
if [ "$VERSION" == "latest" ]; then
    echo "⚠️  使用最新版本进行部署"
fi

# 备份当前部署
echo "💾 备份当前部署..."
mkdir -p $BACKUP_DIR
if docker ps | grep -q $PROJECT_NAME; then
    docker-compose ps > $BACKUP_DIR/docker-compose-$(date +%Y%m%d-%H%M%S).txt
    echo "✅ 当前部署状态已备份"
fi

# 拉取最新镜像 (如果不是本地构建)
if [ "$DEPLOY_ENV" == "production" ]; then
    echo "📥 拉取最新Docker镜像..."
    docker pull $PROJECT_NAME/web:$VERSION
    docker pull $PROJECT_NAME/api:$VERSION
    docker pull $PROJECT_NAME/ai:$VERSION
fi

# 停止旧服务
echo "⏹️  停止旧服务..."
docker-compose down

# 数据库迁移
echo "📊 执行数据库迁移..."
docker-compose up -d postgres
sleep 10

# 运行迁移
if [ -f infrastructure/database/migrations ]; then
    for migration in infrastructure/database/migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo "执行迁移: $migration"
            docker exec -i photo_platform_db psql -U postgres -d photo_platform < "$migration"
        fi
    done
fi

echo "✅ 数据库迁移完成"

# 启动服务
echo "🚀 启动服务..."
if [ "$DEPLOY_ENV" == "production" ]; then
    docker-compose -f docker-compose.prod.yml up -d
else
    docker-compose up -d
fi

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 健康检查
echo "🏥 执行健康检查..."
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=10
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -f $url > /dev/null 2>&1; then
            echo "✅ $service_name 健康检查通过"
            return 0
        fi
        attempt=$((attempt + 1))
        echo "⏳ 等待 $service_name 启动... ($attempt/$max_attempts)"
        sleep 5
    done

    echo "❌ $service_name 健康检查失败"
    return 1
}

# 检查各服务
check_service "API服务" "http://localhost:8000/health"
check_service "AI服务" "http://localhost:8001/health"
check_service "Web前端" "http://localhost:3000"

# 运行测试 (可选)
if [ "$DEPLOY_ENV" != "production" ] && [ -f "package.json" ]; then
    echo "🧪 运行集成测试..."
    npm run test:integration || echo "⚠️  部分测试失败，请检查"
fi

# 生成部署报告
echo "📊 生成部署报告..."
cat > deploy-report-$(date +%Y%m%d-%H%M%S).txt << EOF
摄影师服务平台部署报告
=====================

部署时间: $(date)
部署环境: $DEPLOY_ENV
版本: $VERSION
部署人: $(whoami)

服务状态:
$(docker-compose ps)

Docker镜像:
$(docker images | grep $PROJECT_NAME)

系统资源:
$(free -h)

磁盘使用:
$(df -h | grep -E '(Filesystem|/dev/)')

网络状态:
$(netstat -tuln | grep -E '(tcp|udp)')

EOF

echo "✅ 部署完成！"
echo ""
echo "📊 服务状态:"
docker-compose ps
echo ""
echo "🌐 访问地址:"
echo "   - Web前端: http://localhost:3000"
echo "   - API服务: http://localhost:8000"
echo "   - AI服务: http://localhost:8001"
echo "   - API文档: http://localhost:8000/docs"
echo ""
echo "📝 查看日志:"
echo "   docker-compose logs -f"
echo ""
echo "🔍 查看特定服务日志:"
echo "   docker-compose logs -f api"
echo "   docker-compose logs -f web"
echo "   docker-compose logs -f ai"
echo ""
echo "⚠️  如遇问题，请检查部署报告和服务日志"