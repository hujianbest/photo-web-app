from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from typing import Optional
import cv2
import numpy as np
from PIL import Image
import io
import base64

router = APIRouter()


class EnhanceResponse(BaseModel):
    success: bool
    message: str
    enhanced_image: Optional[str] = None
    original_size: dict
    enhanced_size: dict


@router.post("/images/enhance", response_model=EnhanceResponse)
async def enhance_image(
    file: UploadFile = File(...),
    mode: str = Form("auto"),
    quality: float = Form(0.8),
    enable_denoise: bool = Form(True),
    enable_sharpen: bool = Form(True)
):
    """
    AI图片增强

    参数:
        file: 上传的图片文件
        mode: 处理模式 (auto, portrait, landscape, document)
        quality: 输出质量 (0.0-1.0)
        enable_denoise: 是否启用降噪
        enable_sharpen: 是否启用锐化
    """
    try:
        # 读取上传的图片
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="无法解析图片")

        # 记录原始尺寸
        original_size = {
            "width": img.shape[1],
            "height": img.shape[0]
        }

        # 降噪处理
        if enable_denoise:
            img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

        # 锐化处理
        if enable_sharpen:
            kernel = np.array([[-1, -1, -1],
                             [-1,  9, -1],
                             [-1, -1, -1]])
            img = cv2.filter2D(img, -1, kernel)

        # 根据模式进行特殊处理
        if mode == "portrait":
            # 人像增强
            img = cv2.bilateralFilter(img, 9, 75, 75)
        elif mode == "landscape":
            # 风景增强
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            img = cv2.merge([l, a, b])
            img = cv2.cvtColor(img, cv2.COLOR_LAB2BGR)

        # 转换为PIL Image
        img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

        # 调整质量
        buffer = io.BytesIO()
        img_pil.save(buffer, format="JPEG", quality=int(quality * 100))
        img_bytes = buffer.getvalue()

        # 转换为base64
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')

        # 记录处理后尺寸
        enhanced_size = {
            "width": img_pil.width,
            "height": img_pil.height
        }

        return EnhanceResponse(
            success=True,
            message="图片增强成功",
            enhanced_image=img_base64,
            original_size=original_size,
            enhanced_size=enhanced_size
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片处理失败: {str(e)}")


@router.post("/images/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(1920),
    height: int = Form(1080),
    maintain_aspect_ratio: bool = Form(True)
):
    """
    调整图片尺寸

    参数:
        file: 上传的图片文件
        width: 目标宽度
        height: 目标高度
        maintain_aspect_ratio: 是否保持宽高比
    """
    try:
        # 读取上传的图片
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="无法解析图片")

        # 调整尺寸
        if maintain_aspect_ratio:
            # 保持宽高比
            h, w = img.shape[:2]
            scale = min(width / w, height / h)
            new_size = (int(w * scale), int(h * scale))
        else:
            new_size = (width, height)

        resized = cv2.resize(img, new_size, interpolation=cv2.INTER_AREA)

        # 转换为PIL Image
        img_pil = Image.fromarray(cv2.cvtColor(resized, cv2.COLOR_BGR2RGB))

        # 转换为base64
        buffer = io.BytesIO()
        img_pil.save(buffer, format="JPEG", quality=90)
        img_bytes = buffer.getvalue()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')

        return {
            "success": True,
            "message": "图片尺寸调整成功",
            "image": img_base64,
            "original_size": {"width": img.shape[1], "height": img.shape[0]},
            "new_size": {"width": new_size[0], "height": new_size[1]}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片处理失败: {str(e)}")


@router.post("/images/watermark")
async def add_watermark(
    file: UploadFile = File(...),
    text: str = Form("© 摄影师服务平台"),
    position: str = Form("bottom-right"),
    opacity: float = Form(0.7),
    font_size: int = Form(36)
):
    """
    添加水印

    参数:
        file: 上传的图片文件
        text: 水印文字
        position: 水印位置 (top-left, top-right, bottom-left, bottom-right, center)
        opacity: 不透明度 (0.0-1.0)
        font_size: 字体大小
    """
    try:
        # 读取上传的图片
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="无法解析图片")

        # 计算水印位置
        h, w = img.shape[:2]
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(text, font, font_size/100, 2)[0]

        # 计算位置
        if position == "top-left":
            position = (10, text_size[1] + 10)
        elif position == "top-right":
            position = (w - text_size[0] - 10, text_size[1] + 10)
        elif position == "bottom-left":
            position = (10, h - 10)
        elif position == "bottom-right":
            position = (w - text_size[0] - 10, h - 10)
        elif position == "center":
            position = ((w - text_size[0]) // 2, (h + text_size[1]) // 2)
        else:
            position = (10, h - 10)

        # 添加水印
        overlay = img.copy()
        cv2.putText(overlay, text, position, font, font_size/100, (255, 255, 255), 2)
        cv2.addWeighted(overlay, opacity, img, 1 - opacity, 0, img)

        # 转换为PIL Image
        img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

        # 转换为base64
        buffer = io.BytesIO()
        img_pil.save(buffer, format="JPEG", quality=95)
        img_bytes = buffer.getvalue()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')

        return {
            "success": True,
            "message": "水印添加成功",
            "image": img_base64,
            "watermark": {
                "text": text,
                "position": position,
                "opacity": opacity
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"水印添加失败: {str(e)}")