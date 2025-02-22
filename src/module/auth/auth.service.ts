import { Injectable } from '@nestjs/common';
import { UserAccountRepository, UserRepository } from '../../database/repository';
import { CreateUserDto } from '../../type/interface';
import { DataSource } from 'typeorm';
import { BcryptHandler } from '../../handler';
import { User } from 'src/database/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { nickname, name, age, policy, birthdate, userAccountType, email, password, refreshToken } = dto;

    try {
      let user: User;
      let hashedPassword: string | undefined = undefined;

      const isUserExist = await this.userAccountRepository.findUserAccountByEmail(email);

      if (isUserExist) {
        user = isUserExist.user;
      } else {
        user = await this.userRepository.createUser({
          nickname,
          name,
          age,
          policy,
          birthdate,
        });
      }

      if (password) {
        hashedPassword = await BcryptHandler.hashPassword(password);
      }

      const userAccount = await this.userAccountRepository.createUserAccount({
        userAccountType,
        email,
        password: hashedPassword,
        refreshToken,
        user,
      });

      await queryRunner.manager.save(user);
      await queryRunner.manager.save(userAccount);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return err;
    } finally {
      await queryRunner.release();
    }
  }
}
