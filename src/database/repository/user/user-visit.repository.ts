import { Injectable } from '@nestjs/common';
import { UserVisit } from '../../entities/user/user-visit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';

@Injectable()
export class UserVisitRepository {
  constructor(
    @InjectRepository(UserVisit)
    private readonly userVisitRepository: Repository<UserVisit>,
  ) {}

  async createUserVisit(dto: Pick<UserVisit, 'type' | 'ip' | 'userAgent' | 'referer'> & { user: User }) {
    const { type, ip, userAgent, referer, user } = dto;

    const userVisit = this.userVisitRepository.create({ user, type, ip, userAgent, referer });

    return await this.userVisitRepository.save(userVisit);
  }
}
