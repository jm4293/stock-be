import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UserPushToken } from '../../entities';

@Injectable()
export class UserPushTokenRepository extends Repository<UserPushToken> {
  constructor(manager: EntityManager) {
    super(UserPushToken, manager);
  }

  async getUserPushTokenByUserSeq(userSeq: number) {
    const userPushToken = await this.findOne({ where: { user: { userSeq } } });

    if (!userPushToken) {
      throw new Error('해당 유저는 푸시 토큰을 가지고 있지 않습니다.');
    }

    return userPushToken;
  }
}
