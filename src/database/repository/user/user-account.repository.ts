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
    dto: Pick<CreateUserEmailDto, 'email' | 'password'> & { user: User; type: UserAccountTypeEnum },
  ) {
    const { user, type, email, password } = dto;

    const userAccount = this.create({ user, type, email, password });

    return await this.save(userAccount);
  }

  async createUserAccountByOauth(dto: Pick<CreateUserEmailDto, 'email'> & { user: User; type: UserAccountTypeEnum }) {
    const { user, type, email } = dto;

    const userAccount = this.create({ user, type, email });

    return await this.save(userAccount);
  }

  async findUserAccountByEmail(email: string) {
    return await this.findOne({ where: { email }, relations: ['user'] });
  }
}
