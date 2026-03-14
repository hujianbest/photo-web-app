from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# 导入路由
from src.routes import image_routes, health_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化
    print("🤖 AI服务启动中...")
    yield
    # 关闭时清理
    print("🤖 AI服务关闭中...")


# 创建FastAPI应用
app = FastAPI(
    title="摄影师服务平台AI服务",
    description="提供图片处理、AI修图等功能",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(health_routes.router, prefix="/api/v1", tags=["health"])
app.include_router(image_routes.router, prefix="/api/v1", tags=["images"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "status": "ok",
        "message": "摄影师服务平台AI服务运行正常",
        "service": "AI Service",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )