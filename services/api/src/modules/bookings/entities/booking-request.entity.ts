import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('booking_requests')
export class BookingRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  requester_id: number;

  @Column()
  target_user_id: number;

  @Column({ length: 20 })
  type: string;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ length: 50, nullable: true })
  time_range: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ type: 'geometry', nullable: true })
  coordinates: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'simple-array', nullable: true })
  requirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  style_preferences: string[];

  @Column({ type: 'jsonb', nullable: true })
  sample_images: string[];

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  response_deadline: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;
}