import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局异常过滤：数据库/连接错误返回 503 友好提示
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 增大请求体限制，避免大文件上传超时（与 UPLOAD_MAX_SIZE 配合使用）
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // 启用CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 静态文件服务
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  // API前缀
  app.setGlobalPrefix('api/v1');

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('摄影师服务平台API')
    .setDescription('面向业余摄影师的综合服务平台API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users', '用户管理')
    .addTag('works', '作品管理')
    .addTag('spots', '打卡点管理')
    .addTag('bookings', '约拍管理')
    .addTag('orders', '订单管理')
    .addTag('articles', '文章管理')
    .addTag('notifications', '通知管理')
    .addTag('upload', '文件上传')
    .addTag('auth', '认证授权')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8000;
  const server = await app.listen(port);
  // 大文件上传时延长超时（默认约 2 分钟）
  server.timeout = 120000;

  console.log(`🚀 应用正在运行: http://localhost:${port}`);
  console.log(`📚 API文档: http://localhost:${port}/api/docs`);
  console.log(`📁 静态文件服务: http://localhost:${port}/uploads/`);
}

bootstrap();