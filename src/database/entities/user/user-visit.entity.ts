import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserVisitTypeEnum } from '../../../type/enum';
import { User } from './user.entity';

@Entity()
export class UserVisit {
  @PrimaryGeneratedColumn()
  userVisitSeq: number;

  @ManyToOne(() => User, (user) => user.userAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userSeq' })
  user: User;

  @Column({ type: 'enum', enum: UserVisitTypeEnum })
  type: UserVisitTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  ip: string;

  @Column({ type: 'varchar', length: 255 })
  userAgent: string;

  @Column({ type: 'varchar', length: 255 })
  referer: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
