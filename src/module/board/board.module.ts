import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board, BoardComment, User, UserNotification, UserPushToken } from '../../database/entities';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import {
  BoardCommentRepository,
  BoardRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '../../database/repository';
import { NotificationHandler } from '../../handler';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardComment, User, UserPushToken, UserNotification])],
  controllers: [BoardController],
  providers: [
    BoardService,

    BoardRepository,
    BoardCommentRepository,
    UserRepository,
    UserPushTokenRepository,
    UserNotificationRepository,

    NotificationHandler,
  ],
  exports: [],
})
export class BoardModule {}
