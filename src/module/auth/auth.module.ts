import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAccount } from '../../database/entities';
import { UserAccountRepository, UserRepository } from '../../database/repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccount])],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, UserAccountRepository],
  exports: [],
})
export class AuthModule {}
