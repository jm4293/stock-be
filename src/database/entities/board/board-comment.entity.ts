import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user';
import { Board } from './board.entity';

@Entity()
export class BoardComment {
  @PrimaryGeneratedColumn()
  boardCommentSeq: number;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'boolean' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.boardComment)
  @JoinColumn({ name: 'userSeq' })
  user: User;

  @ManyToOne(() => Board, (board) => board.boardComment)
  @JoinColumn({ name: 'boardSeq' })
  board: Board;
}
