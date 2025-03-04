import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UserPushToken } from '../../entities';

@Injectable()
export class UserPushTokenRepository extends Repository<UserPushToken> {
  constructor(manager: EntityManager) {
    super(UserPushToken, manager);
  }
}
