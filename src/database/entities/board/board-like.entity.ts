import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Board } from './board.entity';
import { User } from '../user';

@Entity()
export class BoardLike {
  @PrimaryColumn()
  boardSeq: number;

  @PrimaryColumn()
  userSeq: number;

  @ManyToOne(() => Board, (board) => board.boardLike)
  @JoinColumn({ name: 'boardSeq' })
  board: Board;

  @ManyToOne(() => User, (user) => user.boardLike)
  @JoinColumn({ name: 'userSeq' })
  user: User;
}
