import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board, BoardComment, User } from '../../database/entities';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardCommentRepository, BoardRepository, UserRepository } from '../../database/repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Board, BoardComment])],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository, BoardCommentRepository, UserRepository],
  exports: [],
})
export class BoardModule {}
