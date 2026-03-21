import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { Tag } from './tag.entity';

@Entity('article_tags')
@Index(['article_id', 'tag_id'], { unique: true })
export class ArticleTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'article_id' })
  article_id: number;

  @Column({ name: 'tag_id' })
  tag_id: number;

  @ManyToOne(() => Article)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
