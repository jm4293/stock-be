import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAccount } from '../../database/entities';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserAccountRepository, UserRepository } from '../../database/repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccount])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserAccountRepository],
  exports: [],
})
export class UserModule {}
