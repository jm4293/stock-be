import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { User, UserVisit } from '../../entities';

@Injectable()
export class UserVisitRepository extends Repository<UserVisit> {
  constructor(manager: EntityManager) {
    super(UserVisit, manager);
  }

  async createUserVisit(dto: Pick<UserVisit, 'type' | 'ip' | 'userAgent' | 'referer'> & { user: User }) {
    const { type, ip, userAgent, referer, user } = dto;

    const userVisit = this.create({ user, type, ip, userAgent, referer });

    return await this.save(userVisit);
  }
}
