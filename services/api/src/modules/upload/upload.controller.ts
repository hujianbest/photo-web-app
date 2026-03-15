import { Controller, Post, UseInterceptors, UploadedFile, Get, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import * as path from 'path';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '图片上传成功' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    return this.uploadService.uploadImage(file);
  }

  @Post('images/batch')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '批量上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '图片批量上传成功' })
  async uploadImages(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    return this.uploadService.uploadImages([file]);
  }

  @Get('presigned-url')
  @ApiOperation({ summary: '获取预签名上传URL' })
  @ApiResponse({ status: 200, description: '获取预签名URL成功' })
  async getPresignedUrl(@Query('filename') filename: string) {
    return this.uploadService.getPresignedUrl(filename);
  }

  @Get('validate')
  @ApiOperation({ summary: '验证文件' })
  @ApiResponse({ status: 200, description: '文件验证成功' })
  async validateFile(
    @Query('filename') filename: string,
    @Query('mimetype') mimetype: string,
  ) {
    return this.uploadService.validateFile(filename, mimetype);
  }
}