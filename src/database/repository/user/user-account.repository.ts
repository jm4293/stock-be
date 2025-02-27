import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserAccount } from '../../entities';
import { Repository } from 'typeorm';
import { UserAccountTypeEnum } from '../../../constant/enum';
import { CreateUserEmailDto } from '../../../type/dto';

@Injectable()
export class UserAccountRepository {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
  ) {}

  async createUserAccountByEmail(
    dto: Pick<CreateUserEmailDto, 'email' | 'password'> & { user: User; type: UserAccountTypeEnum },
  ) {
    const { user, type, email, password } = dto;

    const userAccount = this.userAccountRepository.create({ user, type, email, password });

    return await this.userAccountRepository.save(userAccount);
  }

  async createUserAccountByOauth(dto: Pick<CreateUserEmailDto, 'email'> & { user: User; type: UserAccountTypeEnum }) {
    const { user, type, email } = dto;

    const userAccount = this.userAccountRepository.create({ user, type, email });

    return await this.userAccountRepository.save(userAccount);
  }

  async findUserAccountByEmail(email: string) {
    return await this.userAccountRepository.findOne({ where: { email }, relations: ['user'] });
  }

  async findUserAccountTypeByEmail(dto: { email: string; type: UserAccountTypeEnum }) {
    const { email, type } = dto;

    return await this.userAccountRepository.findOne({ where: { email, type }, relations: ['user'] });
  }

  async getRefreshTokenByUserAccountSeq(userAccountSeq: number) {
    return await this.userAccountRepository.findOne({ where: { userAccountSeq }, select: ['refreshToken'] });
  }

  async updateUserAccountRefreshToken(params: { userAccount: UserAccount; refreshToken: string }) {
    const { userAccount, refreshToken } = params;

    await this.userAccountRepository.update({ user: userAccount.user }, { refreshToken: null });

    return await this.userAccountRepository.update({ userAccountSeq: userAccount.userAccountSeq }, { refreshToken });
  }

  async clearUserAccountRefreshToken(userAccountSeq: number) {
    return await this.userAccountRepository.update(userAccountSeq, { refreshToken: null });
  }
}
