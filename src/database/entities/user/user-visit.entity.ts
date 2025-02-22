import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserVisitTypeEnum } from '../../../type/enum';

@Entity()
export class UserVisit {
  @PrimaryGeneratedColumn()
  userVisitSeq: number;

  @Column({ type: 'int' })
  userSeq: number;

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
