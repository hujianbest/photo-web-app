import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  @ApiOperation({ summary: '发送私信' })
  @ApiResponse({ status: 201, description: '发送成功' })
  async send(@Body() sendMessageDto: SendMessageDto, @Request() req) {
    const message = await this.messagesService.send(req.user.id, sendMessageDto);
    return {
      success: true,
      message: '消息发送成功',
      data: message,
    };
  }

  @Get('conversations')
  @ApiOperation({ summary: '获取对话列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getConversations(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.messagesService.getConversations(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('conversation/:user_id')
  @ApiOperation({ summary: '获取与指定用户的聊天记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMessages(
    @Param('user_id') otherUserId: string,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.messagesService.getMessages(
      req.user.id,
      parseInt(otherUserId),
      parseInt(page),
      parseInt(limit),
    );
  }

  @Post('read')
  @ApiOperation({ summary: '标记消息为已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  async markAsRead(@Body() markReadDto: MarkReadDto, @Request() req) {
    await this.messagesService.markAsRead(req.user.id, markReadDto);
    return {
      success: true,
      message: '标记成功',
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读消息数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.id);
  }

  @Delete('conversations/:user_id')
  @ApiOperation({ summary: '删除对话' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteConversation(@Param('user_id') otherUserId: string, @Request() req) {
    await this.messagesService.deleteConversation(req.user.id, parseInt(otherUserId));
    return {
      success: true,
      message: '对话删除成功',
    };
  }
}
