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
    const { userSeq, accountType } = req.user;

    return this.userAccountRepository.findUserAccountByUserSeq({ userSeq, accountType });
  }
}
