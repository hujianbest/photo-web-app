import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`🚀 应用正在运行: http://localhost:${port}`);
  console.log(`📚 API文档: http://localhost:${port}/api/docs`);
}

bootstrap();