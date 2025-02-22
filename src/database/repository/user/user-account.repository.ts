import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserAccount } from '../../entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../../type/interface';

@Injectable()
export class UserAccountRepository {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
  ) {}

  async createUserAccount(
    dto: Pick<CreateUserDto, 'userAccountType' | 'email' | 'password' | 'refreshToken'> & { user: User },
  ) {
    const { user, userAccountType: type, email, password, refreshToken } = dto;

    const userAccount = this.userAccountRepository.create({ user, type, email, password, refreshToken });

    return await this.userAccountRepository.save(userAccount);
  }

  async findUserAccountByEmail(email: string) {
    return await this.userAccountRepository.findOne({ where: { email }, relations: ['user'] });
  }
}
