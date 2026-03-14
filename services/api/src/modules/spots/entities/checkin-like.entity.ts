import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Checkin } from './checkin.entity';
import { User } from '../../users/entities/user.entity';

@Entity('checkin_likes')
@Unique(['checkin_id', 'user_id'])
export class CheckinLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  checkin_id: number;

  @Column()
  user_id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Checkin)
  @JoinColumn({ name: 'checkin_id' })
  checkin: Checkin;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}