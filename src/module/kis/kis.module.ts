import { Module } from '@nestjs/common';
import { KisController } from './kis.controller';
import { KisService } from './kis.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { KisTokenIssueRepository, KisTokenRepository, UserRepository } from '../../database/repository';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [KisController],
  providers: [KisService, KisTokenRepository, KisTokenIssueRepository, UserRepository],
  exports: [],
})
export class KisModule {}
