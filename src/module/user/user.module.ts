import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAccount, UserPushToken } from '../../database/entities';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserAccountRepository, UserPushTokenRepository, UserRepository } from '../../database/repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccount, UserPushToken])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserAccountRepository, UserPushTokenRepository],
  exports: [],
})
export class UserModule {}
