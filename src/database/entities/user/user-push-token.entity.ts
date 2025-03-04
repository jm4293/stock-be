import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccount } from './user-account.entity';

@Entity()
export class UserPushToken {
  @PrimaryGeneratedColumn()
  userPushTokenSeq: number;

  @Column({ type: 'varchar', length: 500 })
  pushToken: string;

  @Column({ type: 'varchar', length: 255 })
  deviceNo: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => UserAccount, (userAccount) => userAccount.userPushToken)
  @JoinColumn({ name: 'userAccountSeq' })
  userAccount: UserAccount;
}
