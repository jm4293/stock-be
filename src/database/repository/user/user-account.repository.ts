import { Injectable } from '@nestjs/common';
import { User, UserAccount } from '../../entities';
import { EntityManager, Repository } from 'typeorm';
import { UserAccountTypeEnum } from '../../../constant/enum';
import { CreateUserEmailDto } from '../../../type/dto';

@Injectable()
export class UserAccountRepository extends Repository<UserAccount> {
  constructor(manager: EntityManager) {
    super(UserAccount, manager);
  }

  async createUserAccountByEmail(
    dto: Pick<CreateUserEmailDto, 'email' | 'password'> & { user: User; accountType: UserAccountTypeEnum },
  ) {
    const { user, accountType, email, password } = dto;

    const userAccount = this.create({ user, accountType, email, password });

    return await this.save(userAccount);
  }

  async createUserAccountByOauth(
    dto: Pick<CreateUserEmailDto, 'email'> & { user: User; accountType: UserAccountTypeEnum },
  ) {
    const { user, accountType, email } = dto;

    const userAccount = this.create({ user, accountType, email });

    return await this.save(userAccount);
  }

  async findUserAccountByEmail(email: string) {
    const userAccount = await this.findOne({ where: { email }, relations: ['user'] });

    if (!userAccount) {
      throw new Error('사용자 계정이 존재하지 않습니다.');
    }

    return userAccount;
  }

  async findUserAccountByUserSeq(params: { userSeq: number; accountType?: UserAccountTypeEnum }) {
    const { userSeq, accountType } = params;

    return await this.findOne({ where: { user: { userSeq }, accountType }, relations: ['user'] });
  }
}
