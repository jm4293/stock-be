import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class KOSDAQCode {
  @PrimaryGeneratedColumn()
  stockCodeSeq: number;

  @Column({ type: 'int' })
  code: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  marketType: string;

  @Column({ type: 'varchar', nullable: true })
  stockType: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
