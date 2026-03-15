import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 捕获数据库/TypeORM 等底层错误，返回友好 503，避免向客户端暴露内部信息。
 * Nest 的 HttpException（如 400、401）仍按原样返回。
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Nest 内置 HTTP 异常（BadRequestException、UnauthorizedException 等）按原样返回
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload = typeof body === 'object' ? body : { message: body };
      response.status(status).json(payload);
      return;
    }

    const err = exception instanceof Error ? exception : new Error(String(exception));
    const isDbError =
      'code' in err ||
      err.name === 'QueryFailedError' ||
      err.message?.includes('ECONNREFUSED') ||
      err.message?.includes('connection') ||
      err.message?.includes('connect ETIMEDOUT');

    if (isDbError) {
      this.logger.warn('Database or connection error:', err);
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: '服务暂时不可用，请稍后重试',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.logger.error('Unhandled exception', err);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '服务器内部错误',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
}
