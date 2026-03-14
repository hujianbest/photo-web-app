import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkComment } from './entities/work-comments.entity';
import { Work } from './entities/work.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class WorkCommentsService {
  constructor(
    @InjectRepository(WorkComment)
    private commentsRepository: Repository<WorkComment>,
    @InjectRepository(Work)
    private worksRepository: Repository<Work>,
  ) {}

  async create(workId: number, createCommentDto: CreateCommentDto, userId: number) {
    const work = await this.worksRepository.findOne({ where: { id: workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    // 检查父评论是否存在
    if (createCommentDto.parent_id) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parent_id },
      });
      if (!parentComment) {
        throw new NotFoundException('父评论不存在');
      }
    }

    const comment = this.commentsRepository.create({
      work_id: workId,
      user_id: userId,
      content: createCommentDto.content,
      parent_id: createCommentDto.parent_id,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // 增加作品评论数
    await this.worksRepository.increment({ id: workId }, 'comments_count', 1);

    return this.findOne(savedComment.id);
  }

  async findAll(workId: number, params: { page: number; limit: number }) {
    const { page, limit } = params;

    const [comments, total] = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .where('comment.work_id = :workId', { workId })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('comment.created_at', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data: {
        items: comments.map(comment => this.formatComment(comment)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: limit,
        },
      },
    };
  }

  async findOne(id: number) {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    return {
      success: true,
      data: this.formatComment(comment),
    };
  }

  async remove(commentId: number, userId: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('无权删除此评论');
    }

    await this.commentsRepository.delete(commentId);

    return {
      success: true,
      message: '评论删除成功',
    };
  }

  private formatComment(comment: WorkComment) {
    return {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        id: comment.user.id,
        username: comment.user.username,
        avatar_url: comment.user.avatar_url,
      },
      parent: comment.parent
        ? {
            id: comment.parent.id,
            content: comment.parent.content,
            user: {
              id: comment.parent.user.id,
              username: comment.parent.user.username,
              avatar_url: comment.parent.user.avatar_url,
            },
          }
        : null,
    };
  }
}