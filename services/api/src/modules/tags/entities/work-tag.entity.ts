import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Work } from '../../works/entities/work.entity';
import { Tag } from './tag.entity';

@Entity('work_tags')
@Index(['work_id', 'tag_id'], { unique: true })
export class WorkTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'work_id' })
  work_id: number;

  @Column({ name: 'tag_id' })
  tag_id: number;

  @ManyToOne(() => Work)
  @JoinColumn({ name: 'work_id' })
  work: Work;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
