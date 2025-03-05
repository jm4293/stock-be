import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAccount, UserPushToken, UserVisit } from '../../database/entities';
import {
  UserAccountRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '../../database/repository';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleConfig } from '../../config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAccount, UserPushToken, UserVisit]),
    JwtModule.registerAsync(jwtModuleConfig),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, UserAccountRepository, UserPushTokenRepository, UserVisitRepository],
  exports: [JwtModule],
})
export class AuthModule {}
