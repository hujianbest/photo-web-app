import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('tags')
@Index('tags_name_idx', ['name'], { unique: true })
@Index('tags_usage_count_idx', ['usage_count'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ default: 0 })
  works_count: number;

  @Column({ default: 0 })
  articles_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
