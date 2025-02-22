import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Column } from 'typeorm';
import { UserAccount } from './user-account.entity';
import { UserStatusEnum, UserTypeEnum } from '../../../type/enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userSeq: number;

  @Column({ type: 'enum', enum: UserStatusEnum })
  status: UserStatusEnum;

  @Column({ type: 'enum', enum: UserTypeEnum })
  type: UserTypeEnum;

  @Column({ type: 'varchar', length: 255 })
  nickname: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'boolean' })
  policy: boolean;

  @Column({ type: 'date' })
  birthdate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => UserAccount, (userAccount) => userAccount.user)
  userAccounts: UserAccount[];
}
