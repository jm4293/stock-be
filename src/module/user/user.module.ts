import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  UserAccountRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '../../database/repository';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserAccountRepository, UserPushTokenRepository, UserNotificationRepository],
  exports: [],
})
export class UserModule {}
