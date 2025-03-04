import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { UserAccountStatusEnum, UserAccountTypeEnum } from '../../../constant/enum';
import { UserPushToken } from './user-push-token.entity';

@Entity()
export class UserAccount {
  @PrimaryGeneratedColumn()
  userAccountSeq: number;

  @Column({ type: 'enum', enum: UserAccountStatusEnum, default: UserAccountStatusEnum.ACTIVE })
  status: UserAccountStatusEnum;

  @Column({ type: 'enum', enum: UserAccountTypeEnum })
  userAccountType: UserAccountTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.userAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userSeq' })
  user: User;

  @OneToOne(() => UserPushToken, (userPushToken) => userPushToken.userAccount)
  userPushToken: UserPushToken;
}
