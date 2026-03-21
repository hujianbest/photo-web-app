import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { WorkTag } from './entities/work-tag.entity';
import { ArticleTag } from './entities/article-tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(WorkTag)
    private workTagRepository: Repository<WorkTag>,
    @InjectRepository(ArticleTag)
    private articleTagRepository: Repository<ArticleTag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      throw new ConflictException('标签已存在');
    }

    const tag = this.tagRepository.create(createTagDto);
    return this.tagRepository.save(tag);
  }

  async findAll(page = 1, limit = 20, sort = 'hot'): Promise<{ data: Tag[]; total: number }> {
    const order: any = {};
    if (sort === 'hot') {
      order.usage_count = 'DESC';
    } else if (sort === 'newest') {
      order.created_at = 'DESC';
    } else {
      order.name = 'ASC';
    }

    const [tags, total] = await this.tagRepository.findAndCount({
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: tags, total };
  }

  async search(query: string, limit = 10): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { name: Like(`%${query}%`) },
      order: { usage_count: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`标签ID ${id} 不存在`);
    }
    return tag;
  }

  async findOneByName(name: string): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { name } });
  }

  async getHotTags(limit = 20): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { usage_count: 'DESC' },
      take: limit,
    });
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    await this.findOne(id);
    await this.tagRepository.update(id, updateTagDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.tagRepository.delete(id);
  }

  // Add tags to work
  async addTagsToWork(workId: number, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      let tag = await this.findOneByName(tagName);
      if (!tag) {
        tag = this.tagRepository.create({ name: tagName });
        tag = await this.tagRepository.save(tag);
      }

      const existingWorkTag = await this.workTagRepository.findOne({
        where: { work_id: workId, tag_id: tag.id },
      });

      if (!existingWorkTag) {
        await this.workTagRepository.save({
          work_id: workId,
          tag_id: tag.id,
        });

        // Update tag counts
        await this.tagRepository.increment({ id: tag.id }, 'usage_count', 1);
        await this.tagRepository.increment({ id: tag.id }, 'works_count', 1);
      }
    }
  }

  // Add tags to article
  async addTagsToArticle(articleId: number, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      let tag = await this.findOneByName(tagName);
      if (!tag) {
        tag = this.tagRepository.create({ name: tagName });
        tag = await this.tagRepository.save(tag);
      }

      const existingArticleTag = await this.articleTagRepository.findOne({
        where: { article_id: articleId, tag_id: tag.id },
      });

      if (!existingArticleTag) {
        await this.articleTagRepository.save({
          article_id: articleId,
          tag_id: tag.id,
        });

        // Update tag counts
        await this.tagRepository.increment({ id: tag.id }, 'usage_count', 1);
        await this.tagRepository.increment({ id: tag.id }, 'articles_count', 1);
      }
    }
  }

  // Get works by tag
  async getWorksByTag(tagId: number, page = 1, limit = 20) {
    const [workTags, total] = await this.workTagRepository.findAndCount({
      where: { tag_id: tagId },
      relations: ['work'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: workTags.map((wt) => wt.work).filter(Boolean),
      total,
      page,
      limit,
    };
  }

  // Get articles by tag
  async getArticlesByTag(tagId: number, page = 1, limit = 20) {
    const [articleTags, total] = await this.articleTagRepository.findAndCount({
      where: { tag_id: tagId },
      relations: ['article'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: articleTags.map((at) => at.article).filter(Boolean),
      total,
      page,
      limit,
    };
  }

  // Remove tags from work
  async removeTagsFromWork(workId: number, tagIds: number[]): Promise<void> {
    const workTags = await this.workTagRepository.find({
      where: { work_id: workId, tag_id: In(tagIds) },
    });

    for (const workTag of workTags) {
      await this.tagRepository.decrement({ id: workTag.tag_id }, 'usage_count', 1);
      await this.tagRepository.decrement({ id: workTag.tag_id }, 'works_count', 1);
    }

    await this.workTagRepository.delete({ work_id: workId, tag_id: In(tagIds) });
  }

  // Remove tags from article
  async removeTagsFromArticle(articleId: number, tagIds: number[]): Promise<void> {
    const articleTags = await this.articleTagRepository.find({
      where: { article_id: articleId, tag_id: In(tagIds) },
    });

    for (const articleTag of articleTags) {
      await this.tagRepository.decrement({ id: articleTag.tag_id }, 'usage_count', 1);
      await this.tagRepository.decrement({ id: articleTag.tag_id }, 'articles_count', 1);
    }

    await this.articleTagRepository.delete({ article_id: articleId, tag_id: In(tagIds) });
  }
}
