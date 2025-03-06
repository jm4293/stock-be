import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAccount, UserNotification, UserPushToken } from '../../database/entities';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  UserAccountRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '../../database/repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccount, UserPushToken, UserNotification])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserAccountRepository, UserPushTokenRepository, UserNotificationRepository],
  exports: [],
})
export class UserModule {}
