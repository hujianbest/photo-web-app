import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';
import { WorkTag } from './entities/work-tag.entity';
import { ArticleTag } from './entities/article-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, WorkTag, ArticleTag]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
