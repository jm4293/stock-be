import { Injectable } from '@nestjs/common';
import { UserAccountRepository, UserRepository } from '../../database/repository';
import { PostAuthLoginEmailDto, PostCreateUserEmailDto } from '../../type/interface';
import { DataSource } from 'typeorm';
import { BcryptHandler } from '../../handler';
import { User } from 'src/database/entities';
import { UserAccountTypeEnum } from '../../type/enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly dataSource: DataSource,
  ) {}

  async registerEmail(dto: PostCreateUserEmailDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { nickname, name, age, policy, birthdate, email, password } = dto;

      let user: User;

      const isUserAccountExist = await this.userAccountRepository.findUserAccountByEmail(email);

      if (isUserAccountExist) {
        user = isUserAccountExist.user;
      } else {
        user = await this.userRepository.createUser({
          nickname,
          name,
          age,
          policy,
          birthdate,
        });
      }

      const hashedPassword = await BcryptHandler.hashPassword(password);

      const userAccount = await this.userAccountRepository.createUserAccount({
        type: UserAccountTypeEnum.EMAIL,
        email,
        password: hashedPassword,
        user,
      });

      await queryRunner.manager.save(user);
      await queryRunner.manager.save(userAccount);

      await queryRunner.commitTransaction();

      return user;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return err;
    } finally {
      await queryRunner.release();
    }
  }

  async registerOauth() {}

  async loginEmail(dto: PostAuthLoginEmailDto) {}

  async loginOauth() {}
}
