import { Injectable } from '@nestjs/common';
import { Board } from '../../entities';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(manager: EntityManager) {
    super(Board, manager);
  }
}
