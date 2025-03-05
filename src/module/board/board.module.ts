import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board, BoardComment, User, UserPushToken } from '../../database/entities';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import {
  BoardCommentRepository,
  BoardRepository,
  UserPushTokenRepository,
  UserRepository,
} from '../../database/repository';
import { NotificationHandler } from '../../handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardComment, User, UserPushToken])],
  controllers: [BoardController],
  providers: [
    BoardService,
    BoardRepository,
    BoardCommentRepository,
    UserRepository,
    UserPushTokenRepository,
    NotificationHandler,
  ],
  exports: [],
})
export class BoardModule {}
