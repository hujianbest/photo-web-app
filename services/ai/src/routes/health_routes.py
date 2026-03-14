from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    message: str
    service: str
    version: str
    uptime: float


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查"""
    import time
    import psutil
    import os

    # 获取进程运行时间
    process = psutil.Process(os.getpid())
    uptime = time.time() - process.create_time()

    return HealthResponse(
        status="ok",
        message="AI服务运行正常",
        service="AI Service",
        version="1.0.0",
        uptime=uptime
    )


@router.get("/health/detailed")
async def detailed_health_check():
    """详细健康检查"""
    import time
    import psutil
    import os

    process = psutil.Process(os.getpid())

    return {
        "status": "ok",
        "service": "摄影师服务平台AI服务",
        "version": "1.0.0",
        "uptime": time.time() - process.create_time(),
        "memory_info": {
            "rss": process.memory_info().rss / 1024 / 1024,  # MB
            "vms": process.memory_info().vms / 1024 / 1024,  # MB
        },
        "cpu_percent": process.cpu_percent(),
        "timestamp": time.time()
    }