import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100, nullable: true })
  email: string;

  @Column({ unique: true, length: 20, nullable: true })
  phone: string;

  @Column()
  password_hash: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 'newbie' })
  level: string;

  @Column({ length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ length: 200, nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true })
  social_media: Record<string, any>;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}