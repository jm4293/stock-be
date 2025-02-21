import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserAccount {
  @PrimaryGeneratedColumn()
  userAccountSeq: number;

  @ManyToOne(() => User, (user) => user.userAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userSeq' })
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
