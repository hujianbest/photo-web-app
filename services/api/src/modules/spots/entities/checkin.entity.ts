import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CheckinSpot } from './checkin-spot.entity';

@Entity('checkins')
export class Checkin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  spot_id: number;

  @Column({ type: 'jsonb' })
  photos: string[];

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ type: 'geometry', nullable: true })
  coordinates: string;

  @Column({ length: 50, nullable: true })
  weather: string;

  @Column({ type: 'jsonb', nullable: true })
  camera_info: Record<string, any>;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  comments_count: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CheckinSpot)
  @JoinColumn({ name: 'spot_id' })
  spot: CheckinSpot;
}