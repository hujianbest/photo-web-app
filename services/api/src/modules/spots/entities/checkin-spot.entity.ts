import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('checkin_spots')
export class CheckinSpot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 200 })
  location: string;

  @Column({ type: 'geometry', nullable: true })
  coordinates: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  province: string;

  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  best_time: string[];

  @Column({ type: 'simple-array', nullable: true })
  tips: string[];

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ length: 20, nullable: true })
  difficulty: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  checkins: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  creator_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;
}