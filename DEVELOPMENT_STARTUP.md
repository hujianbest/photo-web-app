# 🚀 开发环境启动指南

## ✅ 项目初始化完成

您的摄影师服务平台开发环境已经成功搭建！

## 📊 项目状态

### 已完成的任务
- ✅ 创建项目目录结构
- ✅ 初始化Web前端项目 (Next.js)
- ✅ 初始化API服务项目 (NestJS)
- ✅ 初始化AI服务项目 (FastAPI)
- ✅ 配置基础设施服务
- ✅ 启动开发环境

## 🌐 当前运行的服务

### Web前端 - Next.js
- **地址**: http://localhost:3000
- **状态**: ✅ 运行中
- **功能**: 用户界面，包含首页、作品展示、打卡点等

### 待启动的服务

#### API服务 - NestJS
```bash
cd services/api
npm install
npm run start:dev
```
- **地址**: http://localhost:8000
- **API文档**: http://localhost:8000/api/docs
- **功能**: 用户管理、作品管理、打卡点、约拍、订单等API

#### AI服务 - FastAPI
```bash
cd services/ai
pip install -r requirements.txt
python src/main.py
```
- **地址**: http://localhost:8001
- **健康检查**: http://localhost:8001/api/v1/health
- **功能**: 图片增强、尺寸调整、水印添加

## 📁 项目结构

```
photo-web-app/
├── apps/
│   ├── web/                    # Next.js Web前端 ✅
│   ├── mobile/                 # React Native 移动端 (待开发)
│   └── miniapp/                # uni-app 小程序 (待开发)
├── services/
│   ├── api/                    # NestJS API服务 ✅
│   ├── ai/                     # FastAPI AI服务 ✅
│   └── worker/                 # 异步任务处理 (待开发)
├── shared/                     # 共享代码 ✅
├── infrastructure/             # 基础设施配置 ✅
└── docs/                       # 文档 ✅
```

## 🎯 快速启动指南

### 1. 启动Web前端 (已运行)
Web前端已经在 http://localhost:3000 运行中

### 2. 启动API服务
```bash
# 在新终端中执行
cd /mnt/e/projects/photo-web-app/services/api
npm run start:dev
```

### 3. 启动AI服务
```bash
# 需要先安装Python依赖
pip install -r requirements.txt

# 启动服务
python src/main.py
```

### 4. 查看API文档
访问 http://localhost:8000/api/docs 查看自动生成的API文档

## 🛠️ 开发工具

### Web前端开发
```bash
cd apps/web
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run lint             # 代码检查
npm run typecheck        # TypeScript类型检查
```

### API服务开发
```bash
cd services/api
npm run start:dev        # 启动开发服务器
npm run build            # 构建生产版本
npm run test             # 运行测试
npm run lint             # 代码检查
```

### AI服务开发
```bash
cd services/ai
python src/main.py       # 启动开发服务器
pytest                   # 运行测试
```

## 📚 已实现的功能模块

### Web前端
- ✅ 首页展示
- ✅ 6大功能模块介绍
- ✅ 响应式布局
- ✅ TailwindCSS样式
- ✅ Next.js App Router

### API服务
- ✅ 用户管理模块
- ✅ 数据库配置
- ✅ Swagger API文档
- ✅ 用户CRUD操作
- ✅ 积分等级系统基础
- ✅ 健康检查接口

### AI服务
- ✅ 图片增强功能
- ✅ 图片尺寸调整
- ✅ 水印添加
- ✅ 健康检查接口
- ✅ RESTful API设计

## 🔄 开发工作流

### 1. 修改代码
```bash
# Web前端
cd apps/web/src/app
# 修改页面代码，保存后会自动热重载

# API服务
cd services/api/src/modules
# 修改服务代码，保存后会自动热重载

# AI服务
cd services/ai/src
# 修改服务代码，保存后会自动热重载
```

### 2. 查看日志
```bash
# Web前端日志
# 在运行npm run dev的终端中查看

# API服务日志
# 在运行npm run start:dev的终端中查看

# AI服务日志
# 在运行python src/main.py的终端中查看
```

### 3. 测试API
```bash
# 使用curl测试
curl http://localhost:8000

# 或使用Postman
# 导入API文档中的接口进行测试
```

## 🎨 前端开发

### 创建新页面
```bash
cd apps/web/src/app
mkdir my-page
touch my-page/page.tsx
```

### 创建新组件
```bash
cd apps/web/src/components
mkdir MyComponent
touch MyComponent.tsx
```

### 调用API
```typescript
// 使用fetch调用API
const response = await fetch('http://localhost:8000/api/v1/users');
const data = await response.json();
```

## ⚙️ 后端开发

### 创建新模块
```bash
cd services/api/src/modules
nest g module my-module
nest g service my-module
nest g controller my-module
```

### 创建新接口
```typescript
// 在controller中添加新接口
@Get('my-endpoint')
async myEndpoint() {
  return this.myService.getData();
}
```

## 🤖 AI功能开发

### 添加新的AI功能
```python
# 在services/ai/src/routes/中创建新路由
@router.post("/ai/new-feature")
async def new_feature(file: UploadFile = File(...)):
    # 实现AI功能
    pass
```

## 🔧 环境变量

当前环境变量配置位于 `.env` 文件中，主要包括：

```env
# 应用配置
APP_ENV=development
APP_PORT=8000

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=photo_platform

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 前端配置
WEB_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📖 下一步开发建议

### 优先级1 - 核心功能
1. **用户认证系统**
   - 注册/登录/登出
   - JWT认证
   - 权限管理

2. **作品展示功能**
   - 作品上传
   - 作品列表
   - 作品详情
   - 点赞评论

3. **打卡点功能**
   - 打卡点列表
   - 打卡点详情
   - 打卡记录
   - 地图展示

### 优先级2 - 业务功能
1. **约拍平台**
   - 约拍需求发布
   - 约拍列表
   - 约拍详情
   - 订单管理

2. **订单管理**
   - 订单创建
   - 订单支付
   - 图片交付
   - AI修图集成

### 优先级3 - 辅助功能
1. **经验分享**
   - 文章发布
   - 文章列表
   - 文章详情
   - 评价互动

2. **通知系统**
   - 通知列表
   - 通知详情
   - 通知标记

## 🆘 常见问题

### Q: Web前端启动失败
```bash
# 检查端口占用
lsof -i :3000

# 杀死占用端口的进程
kill -9 $(lsof -t -i:3000)
```

### Q: API服务连接数据库失败
```bash
# 检查数据库是否运行
docker ps | grep postgres

# 或检查PostgreSQL是否安装
psql --version
```

### Q: AI服务启动失败
```bash
# 检查Python版本
python --version

# 检查依赖安装
pip list
```

## 📞 获取帮助

- 📚 查看项目文档: `/docs/`
- 🔌 API文档: http://localhost:8000/api/docs
- 🐛 问题反馈: GitHub Issues
- 💬 讨论交流: GitHub Discussions

## 🎉 恭喜！

您的摄影师服务平台开发环境已经成功搭建！

现在您可以开始：
1. 🌐 访问 http://localhost:3000 查看前端界面
2. ⚙️ 启动API服务开始后端开发
3. 🤖 启动AI服务实现图片处理功能
4. 🛠️ 根据需求开发具体功能模块

祝您开发愉快！🚀📸