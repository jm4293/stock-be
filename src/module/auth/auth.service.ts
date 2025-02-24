import { HttpException, Injectable } from '@nestjs/common';
import { UserAccountRepository, UserRepository } from '../../database/repository';
import { PostAuthLoginEmailDto, PostCheckEmailDto, PostCreateUserEmailDto } from '../../type/interface';
import { DataSource } from 'typeorm';
import { BcryptHandler } from '../../handler';
import { User } from 'src/database/entities';
import { UserAccountTypeEnum } from '../../type/enum';
import { IPostCheckEmailRes, IPostCreateUserEmailRes } from '../../type/interface/auth';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_COOKIE_TIME, REFRESH_TOKEN_TIME } from '../../constant/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    private readonly dataSource: DataSource,
  ) {}

  async registerEmail(dto: PostCreateUserEmailDto): Promise<IPostCreateUserEmailRes> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { nickname, name, policy, birthdate, email, password } = dto;

      let user: User;

      const isUserAccountExist = await this.userAccountRepository.findUserAccountByEmail(email);

      if (isUserAccountExist) {
        user = isUserAccountExist.user;
      } else {
        user = await this.userRepository.createUser({ nickname, name, policy, birthdate });
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

      return { email: userAccount.email };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return err;
    } finally {
      await queryRunner.release();
    }
  }

  async registerOauth() {}

  async checkEmail(dto: PostCheckEmailDto): Promise<IPostCheckEmailRes> {
    const { email } = dto;

    const isUserAccountExist = await this.userAccountRepository.findUserAccountByEmail(email);

    return { isExist: !!isUserAccountExist, email };
  }

  async loginEmail(dto: PostAuthLoginEmailDto, res: Response) {
    const { email, password } = dto;

    const userAccount = await this.userAccountRepository.findUserAccountByEmail(email);

    if (!userAccount) {
      throw new HttpException('일치하는 사용자가 없습니다.', 400);
    }

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password);

    if (!isMatch) {
      throw new HttpException('비밀번호가 일치하지 않습니다.', 400);
    }

    const accessToken = await this._generateJwtToken({
      userSeq: userAccount.user.userSeq,
      email: userAccount.email,
      expiresIn: ACCESS_TOKEN_TIME,
    });

    const refreshToken = await this._generateJwtToken({
      userSeq: userAccount.user.userSeq,
      email: userAccount.email,
      expiresIn: REFRESH_TOKEN_TIME,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_COOKIE_TIME,
    });

    return res.status(200).send({ data: { email: userAccount.email, accessToken } });
  }

  async loginOauth() {}

  private async _generateJwtToken(params: { userSeq: number; email: string; expiresIn: number }) {
    const { userSeq, email, expiresIn } = params;

    return await this.jwtService.signAsync(
      { userSeq, email },
      { expiresIn, secret: this.configService.get('JWT_SECRET_KEY') },
    );
  }
}
