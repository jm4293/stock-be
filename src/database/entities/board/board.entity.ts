import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user';
import { BoardComment } from './board-comment.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  boardSeq: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'boolean' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.board)
  @JoinColumn({ name: 'userSeq' })
  user: User;

  @OneToMany(() => BoardComment, (boardComment) => boardComment.board)
  boardComment: BoardComment;
}
