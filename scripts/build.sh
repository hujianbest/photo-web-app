#!/bin/bash

# 摄影师服务平台构建脚本

set -e

# 配置变量
PROJECT_NAME="photo-platform"
VERSION=${1:-"1.0.0"}
BUILD_DIR="dist"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"localhost:5000"}

echo "🔨 开始构建摄影师服务平台 v${VERSION}..."

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# 构建Web前端
echo "🌐 构建Web前端..."
cd apps/web
npm install
npm run build
cd ../..
cp -r apps/web/.next $BUILD_DIR/web
cp -r apps/web/public $BUILD_DIR/web/public

# 构建API服务
echo "⚙️  构建API服务..."
cd services/api
npm install
npm run build
cd ../..
cp -r services/api/dist $BUILD_DIR/api

# 构建Docker镜像
echo "🐳 构建Docker镜像..."

# Web前端镜像
docker build -f infrastructure/docker/Dockerfile.web \
  -t $PROJECT_NAME/web:$VERSION \
  -t $PROJECT_NAME/web:latest \
  .

# API服务镜像
docker build -f infrastructure/docker/Dockerfile.api \
  -t $PROJECT_NAME/api:$VERSION \
  -t $PROJECT_NAME/api:latest \
  .

# AI服务镜像
docker build -f infrastructure/docker/Dockerfile.ai \
  -t $PROJECT_NAME/ai:$VERSION \
  -t $PROJECT_NAME/ai:latest \
  .

echo "✅ Docker镜像构建完成"

# 打包应用
echo "📦 打包应用..."
cd $BUILD_DIR
tar -czf ../$PROJECT_NAME-$VERSION.tar.gz .
cd ..

echo "✅ 应用打包完成: $PROJECT_NAME-$VERSION.tar.gz"

# 生成构建报告
echo "📊 生成构建报告..."
cat > build-report.txt << EOF
摄影师服务平台构建报告
=====================

版本: $VERSION
构建时间: $(date)
构建环境: $(uname -a)

构建的组件:
- Web前端: $PROJECT_NAME/web:$VERSION
- API服务: $PROJECT_NAME/api:$VERSION
- AI服务: $PROJECT_NAME/ai:$VERSION

Docker镜像:
$(docker images | grep $PROJECT_NAME)

构建产物:
- 打包文件: $PROJECT_NAME-$VERSION.tar.gz
- Web前端: $BUILD_DIR/web
- API服务: $BUILD_DIR/api
EOF

echo "✅ 构建完成！"
echo ""
echo "📦 构建产物:"
echo "   - 打包文件: $PROJECT_NAME-$VERSION.tar.gz"
echo "   - 构建目录: $BUILD_DIR/"
echo "   - 构建报告: build-report.txt"
echo ""
echo "🚀 下一步操作:"
echo "   1. 运行以下命令查看构建报告:"
echo "      cat build-report.txt"
echo ""
echo "   2. 运行以下命令部署到生产环境:"
echo "      ./scripts/deploy.sh $VERSION"
echo ""
echo "   3. 或使用Docker Compose部署:"
echo "      docker-compose -f docker-compose.prod.yml up -d"