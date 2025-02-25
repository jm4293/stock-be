import { HttpException, Injectable } from '@nestjs/common';
import { UserAccountRepository, UserRepository, UserVisitRepository } from '../../database/repository';
import {
  IJwtToken,
  IPostCheckEmailRes,
  IPostCreateUserEmailRes,
  PostAuthLoginEmailDto,
  PostCheckEmailDto,
  PostCreateUserEmailDto,
} from '../../type/interface';
import { DataSource } from 'typeorm';
import { BcryptHandler } from '../../handler';
import { User } from 'src/database/entities';
import { UserAccountTypeEnum, UserVisitTypeEnum } from '../../type/enum';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_COOKIE_TIME, REFRESH_TOKEN_TIME } from '../../constant/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userVisitRepository: UserVisitRepository,

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

  async loginEmail(params: { dto: PostAuthLoginEmailDto; req: Request; res: Response }) {
    const { dto, req, res } = params;
    const { email, password } = dto;

    const userAccount = await this.userAccountRepository.findUserAccountByEmail(email);

    if (!userAccount) {
      throw new HttpException('일치하는 사용자가 없습니다.', 400);
    }

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);

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

    await this.userAccountRepository.updateUserAccountRefreshToken({
      userAccountSeq: userAccount.userAccountSeq,
      refreshToken,
    });

    await this._generateUserVisit({ req, type: UserVisitTypeEnum.SIGN_IN_EMAIL, user: userAccount.user });

    return res.status(200).send({ data: { email: userAccount.email, accessToken } });
  }

  async loginOauth() {}

  async logoutEmail(params: { req: Request; res: Response }) {
    const { req, res } = params;

    res.clearCookie('refreshToken');

    await this.userAccountRepository.clearUserAccountRefreshToken(req.user.userSeq);

    await this._generateUserVisit({ req, type: UserVisitTypeEnum.SIGN_OUT_EMAIL });

    return res.status(200).send({ data: {} });
  }

  async refreshToken(params: { req: Request; res: Response }) {
    const { req, res } = params;

    const refreshToken = req.cookies['refreshToken'] as string;

    if (!refreshToken) {
      throw new HttpException('리프레시 토큰이 존재하지 않습니다.', 403);
    }

    const { userSeq, email } = this.jwtService.verify<IJwtToken>(
      refreshToken,
      this.configService.get('JWT_SECRET_KEY'),
    );

    const savedRefreshToken = await this.userAccountRepository.getRefreshTokenByUserAccountSeq(userSeq);

    if (!savedRefreshToken) {
      throw new HttpException('DB 리프레시 토큰이 존재하지 않습니다.', 403);
    }

    if (savedRefreshToken.refreshToken !== refreshToken) {
      throw new HttpException('리프레시 토큰이 일치하지 않습니다.', 403);
    }

    const accessToken = await this._generateJwtToken({
      userSeq,
      email,
      expiresIn: ACCESS_TOKEN_TIME,
    });

    return res.status(200).send({ data: { email, accessToken } });
  }

  private async _generateJwtToken(params: IJwtToken) {
    const { userSeq, email, expiresIn } = params;

    return await this.jwtService.signAsync(
      { userSeq, email },
      { expiresIn, secret: this.configService.get('JWT_SECRET_KEY') },
    );
  }

  private async _generateUserVisit(params: { req: Request; type: UserVisitTypeEnum; user?: User }) {
    const { req, type, user } = params;

    const { ip = null, headers } = req;

    const { 'user-agent': userAgent = null, referer = null } = headers;

    if (user) {
      await this.userVisitRepository.createUserVisit({ type, ip, userAgent, referer, user });
    } else {
      const userSeq = req.user.userSeq;

      const user = await this.userRepository.findUserByUserSeq(userSeq);

      if (!user) {
        throw new HttpException('일치하는 사용자가 없습니다.', 400);
      }

      await this.userVisitRepository.createUserVisit({ type, ip, userAgent, referer, user });
    }
  }
}
