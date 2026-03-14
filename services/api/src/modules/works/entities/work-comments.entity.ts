import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Work } from './work.entity';
import { User } from '../../users/entities/user.entity';

@Entity('work_comments')
export class WorkComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  work_id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Work)
  @JoinColumn({ name: 'work_id' })
  work: Work;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => WorkComment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: WorkComment;
}