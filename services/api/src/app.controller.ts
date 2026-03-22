import { Controller, Get, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactFormDto } from './dto/contact-form.dto';

@ApiTags('app')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  @Get()
  @ApiOperation({ summary: '健康检查' })
  healthCheck() {
    return {
      status: 'ok',
      message: '摄影师服务平台API运行正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('health')
  @ApiOperation({ summary: '详细健康检查' })
  detailedHealthCheck() {
    return {
      status: 'ok',
      service: '摄影师服务平台API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('contact')
  @HttpCode(200)
  @ApiOperation({ summary: '联系我们表单（开发环境记录日志，可接邮件服务）' })
  async submitContact(@Body() body: ContactFormDto) {
    this.logger.log(
      `Contact form: ${body.name} <${body.email}> [${body.subject}] ${body.message.slice(0, 200)}`,
    );
    return {
      success: true,
      message: '我们已收到您的留言，将尽快回复',
      data: null,
    };
  }
}