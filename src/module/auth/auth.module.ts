import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserAccount, UserVisit } from '../../database/entities';
import { UserAccountRepository, UserRepository, UserVisitRepository } from '../../database/repository';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleConfig } from '../../config';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccount, UserVisit]), JwtModule.registerAsync(jwtModuleConfig)],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, UserAccountRepository, UserVisitRepository],
  exports: [JwtModule],
})
export class AuthModule {}
