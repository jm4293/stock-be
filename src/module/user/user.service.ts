import { Injectable } from '@nestjs/common';
import { UserAccountRepository, UserPushTokenRepository, UserRepository } from '../../database/repository';
import { Request } from 'express';
import { RegisterUserPushTokenDto } from '../../type/dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,
  ) {}

  async getMyInfo(req: Request) {
    const { userSeq, userAccountType } = req.user;

    const userAccount = await this.userAccountRepository.findOne({
      where: { user: { userSeq }, userAccountType },
      relations: ['user'],
    });

    if (!userAccount) {
      throw new Error('사용자 계정이 존재하지 않습니다.');
    }

    const { email, user } = userAccount;
    const { nickname, name, thumbnail } = user;

    return { email, nickname, name, thumbnail, userAccountType };
  }

  async registerPushToken(params: { dto: RegisterUserPushTokenDto; req: Request }) {
    const { dto, req } = params;
    const { pushToken } = dto;

    const { userSeq } = req.user;
    const { 'sec-ch-ua-platform': platform } = req.headers;

    const user = await this.userRepository.findUserByUserSeq(userSeq);

    await this.userPushTokenRepository.upsert(
      { user, pushToken, deviceNo: String(platform) },
      { conflictPaths: ['user'] },
    );
  }
}
