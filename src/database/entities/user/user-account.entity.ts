import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserAccount {
  @PrimaryGeneratedColumn()
  userAccountSeq: number;

  @ManyToOne(() => User, (user) => user.userAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userSeq' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
