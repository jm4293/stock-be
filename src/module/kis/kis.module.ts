import { Module } from '@nestjs/common';
import { KisController } from './kis.controller';
import { KisService } from './kis.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { KisToken } from '../../database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KisTokenRepository } from '../../database/repository';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([KisToken]), ScheduleModule.forRoot()],
  controllers: [KisController],
  providers: [KisService, KisTokenRepository],
  exports: [],
})
export class KisModule {}
