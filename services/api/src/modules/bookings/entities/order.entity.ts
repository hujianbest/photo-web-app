import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BookingRequest } from './booking-request.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  booking_id: number;

  @Column({ unique: true, length: 50 })
  order_no: string;

  @Column()
  client_id: number;

  @Column()
  photographer_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ length: 20, nullable: true })
  payment_method: string;

  @Column({ length: 100, nullable: true })
  transaction_id: string;

  @Column({ length: 500, nullable: true })
  contract_url: string;

  @Column({ type: 'timestamp', nullable: true })
  contract_signed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  shooting_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  completion_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refund_amount: number;

  @Column({ type: 'text', nullable: true })
  refund_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'photographer_id' })
  photographer: User;

  @ManyToOne(() => BookingRequest)
  @JoinColumn({ name: 'booking_id' })
  booking: BookingRequest;
}