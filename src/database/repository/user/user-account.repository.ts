import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserAccount } from '../../entities';
import { Repository } from 'typeorm';
import { PostCreateUserEmailDto } from '../../../type/interface';
import { UserAccountTypeEnum } from '../../../type/enum';

@Injectable()
export class UserAccountRepository {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
  ) {}

  async createUserAccount(
    dto: Pick<PostCreateUserEmailDto, 'email' | 'password'> & { user: User; type: UserAccountTypeEnum },
  ) {
    const { user, type, email, password } = dto;

    const userAccount = this.userAccountRepository.create({ user, type, email, password });

    return await this.userAccountRepository.save(userAccount);
  }

  async findUserAccountByEmail(email: string) {
    return await this.userAccountRepository.findOne({ where: { email }, relations: ['user'] });
  }

  async getRefreshTokenByUserAccountSeq(userAccountSeq: number) {
    return await this.userAccountRepository.findOne({ where: { userAccountSeq }, select: ['refreshToken'] });
  }

  async updateUserAccountRefreshToken(params: { userAccountSeq: number; refreshToken: string }) {
    const { userAccountSeq, refreshToken } = params;

    return await this.userAccountRepository.update(userAccountSeq, { refreshToken });
  }

  async clearUserAccountRefreshToken(userAccountSeq: number) {
    return await this.userAccountRepository.update(userAccountSeq, { refreshToken: null });
  }
}
