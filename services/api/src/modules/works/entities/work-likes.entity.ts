import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Work } from './work.entity';
import { User } from '../../users/entities/user.entity';

@Entity('work_likes')
@Unique(['work_id', 'user_id'])
export class WorkLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  work_id: number;

  @Column()
  user_id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Work)
  @JoinColumn({ name: 'work_id' })
  work: Work;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}