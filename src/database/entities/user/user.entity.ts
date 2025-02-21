import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Column } from 'typeorm';
import { UserAccount } from './user-account.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userSeq: number;

  @OneToMany(() => UserAccount, (userAccount) => userAccount.user)
  userAccounts: UserAccount[];

  @Column({ type: 'varchar', length: 255 })
  nickname: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'boolean' })
  policy: boolean;

  @Column({ type: 'date' })
  birthdate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
