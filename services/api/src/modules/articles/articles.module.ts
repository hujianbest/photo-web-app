import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { ArticleLike } from './entities/article-like.entity';
import { ArticleComment } from './entities/article-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleLike, ArticleComment])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}