import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('conversations')
@Index(['user_id', 'last_message_at'])
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'other_user_id' })
  other_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'other_user_id' })
  other_user: User;

  @Column({ name: 'last_message_content', nullable: true })
  last_message_content: string;

  @Column({ name: 'last_message_at', nullable: true })
  last_message_at: Date;

  @Column({ name: 'unread_count', default: 0 })
  unread_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
