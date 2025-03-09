import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board, BoardComment, BoardLike, User, UserNotification, UserPushToken } from '../../database/entities';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import {
  BoardCommentRepository,
  BoardLikeRepository,
  BoardRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '../../database/repository';
import { NotificationHandler } from '../../handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardComment, BoardLike, User, UserPushToken, UserNotification])],
  controllers: [BoardController],
  providers: [
    BoardService,

    BoardRepository,
    BoardCommentRepository,
    BoardLikeRepository,
    UserRepository,
    UserPushTokenRepository,
    UserNotificationRepository,

    NotificationHandler,
  ],
  exports: [],
})
export class BoardModule {}
