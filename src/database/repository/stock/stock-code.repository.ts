import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { StockCodeEntity } from '../../entities';

@Injectable()
export class StockCodeRepository extends Repository<StockCodeEntity> {
  constructor(manager: EntityManager) {
    super(StockCodeEntity, manager);
  }
}
