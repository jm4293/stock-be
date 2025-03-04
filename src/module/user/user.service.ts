import { Injectable } from '@nestjs/common';
import { UserAccountRepository, UserPushTokenRepository, UserRepository } from '../../database/repository';
import { Request } from 'express';
import { CreateUserPushTokenDto } from '../../type/dto';

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

  async registerPushToken(params: { dto: CreateUserPushTokenDto; req: Request }) {
    const { dto, req } = params;
    const { pushToken, deviceNo } = dto;
    const { userSeq, userAccountType } = req.user;

    const userAccount = await this.userAccountRepository.findOne({
      where: { user: { userSeq }, userAccountType },
    });

    if (!userAccount) {
      throw new Error('사용자 계정이 존재하지 않습니다.');
    }

    const userPushToken = await this.userPushTokenRepository.findOne({
      where: { userAccount },
    });

    if (userPushToken) {
      await this.userPushTokenRepository.update({ userAccount }, { pushToken, deviceNo });
    } else {
      this.userPushTokenRepository.create({ userAccount, pushToken, deviceNo });
    }

    return;
  }
}
