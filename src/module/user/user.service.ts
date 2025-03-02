import { Injectable } from '@nestjs/common';
import { UserAccountRepository, UserRepository } from '../../database/repository';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
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
}
