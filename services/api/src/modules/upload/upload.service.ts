import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// sharp 为可选依赖，未安装时缩略图与尺寸回退到占位
let sharp: typeof import('sharp') | null = null;
try {
  sharp = require('sharp');
} catch {
  // 忽略
}

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File) {
    try {
      // 验证文件
      this.validateImageFile(file);

      // 生成访问URL
      const filename = path.basename(file.path);
      const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:8000';
      const imageUrl = `${baseUrl}/uploads/${filename}`;

      // 生成缩略图
      const thumbnailFilename = await this.generateThumbnail(file.path);

      const thumbnailUrl = thumbnailFilename
        ? `${baseUrl}/uploads/${thumbnailFilename}`
        : null;

      // 获取图片信息
      const imageInfo = await this.getImageInfo(file.path);

      return {
        success: true,
        message: '图片上传成功',
        data: {
          url: imageUrl,
          thumbnail_url: thumbnailUrl,
          filename: filename,
          original_name: file.originalname,
          size: file.size,
          width: imageInfo.width,
          height: imageInfo.height,
          mimetype: file.mimetype,
          upload_time: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new BadRequestException(`图片上传失败: ${error.message}`);
    }
  }

  async uploadImages(files: Express.Multer.File[]) {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(file);
        results.push(result);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: `成功上传${results.length}张图片`,
      data: {
        successful: results,
        failed: errors,
      },
    };
  }

  async getPresignedUrl(filename: string) {
    // 生成唯一的文件名
    const uniqueFilename = `${uuidv4()}_${filename}`;
    const uploadPath = this.configService.get('UPLOAD_PATH') || './uploads';
    const fullpath = path.join(uploadPath, uniqueFilename);

    // 在实际生产环境中，这里会生成云存储的预签名URL
    // 目前返回本地上传URL
    const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:8000';
    const uploadUrl = `${baseUrl}/api/v1/upload/image`;

    return {
      success: true,
      data: {
        upload_url: uploadUrl,
        filename: uniqueFilename,
        upload_path: fullpath,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1小时后过期
      },
    };
  }

  async validateFile(filename: string, mimetype: string) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    const maxSize = parseInt(
      this.configService.get('UPLOAD_MAX_SIZE') || '10485760',
    );

    const extension = path.extname(filename).toLowerCase();
    const isValidExtension = allowedExtensions.includes(extension);
    const isValidMimeType = allowedMimeTypes.includes(mimetype);

    return {
      success: true,
      data: {
        filename: filename,
        extension: extension,
        mimetype: mimetype,
        is_valid_extension: isValidExtension,
        is_valid_mimetype: isValidMimeType,
        max_size: maxSize,
        is_valid: isValidExtension && isValidMimeType,
      },
    };
  }

  private validateImageFile(file: Express.Multer.File): void {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    const maxSize = parseInt(
      this.configService.get('UPLOAD_MAX_SIZE') || '10485760',
    );

    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      throw new BadRequestException(`不支持的文件格式: ${extension}`);
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`不支持的文件类型: ${file.mimetype}`);
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      throw new BadRequestException(
        `文件大小超过限制，最大${maxSizeMB}MB`,
      );
    }
  }

  private async generateThumbnail(
    filePath: string,
  ): Promise<string | null> {
    const basename = path.basename(filePath, path.extname(filePath));
    const thumbnailFilename = `${basename}_thumb.jpg`;
    const thumbnailPath = path.join(path.dirname(filePath), thumbnailFilename);

    if (fs.existsSync(thumbnailPath)) {
      return thumbnailFilename;
    }

    if (!sharp) {
      return null;
    }

    try {
      const maxWidth = 400;
      await sharp(filePath)
        .resize(maxWidth, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      return thumbnailFilename;
    } catch (error) {
      console.error('生成缩略图失败:', error);
      return null;
    }
  }

  private async getImageInfo(filePath: string): Promise<{
    width: number;
    height: number;
  }> {
    if (!sharp) {
      return { width: 0, height: 0 };
    }
    try {
      const meta = await sharp(filePath).metadata();
      return {
        width: meta.width ?? 0,
        height: meta.height ?? 0,
      };
    } catch (error) {
      console.error('获取图片信息失败:', error);
      return { width: 0, height: 0 };
    }
  }
}