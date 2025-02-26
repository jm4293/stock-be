import { HttpException, Injectable } from '@nestjs/common';
import { UserAccountRepository, UserRepository, UserVisitRepository } from '../../database/repository';
import {
  IJwtToken,
  IPostCheckEmailRes,
  IPostCreateUserEmailRes,
  LoginEmailDto,
  CheckEmailDto,
  CreateUserEmailDto,
  LoginOauthDto,
} from '../../type/interface';
import { BcryptHandler } from '../../handler';
import { User, UserAccount } from 'src/database/entities';
import { UserAccountTypeEnum, UserVisitTypeEnum } from '../../type/enum';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_COOKIE_TIME, REFRESH_TOKEN_TIME } from '../../constant/jwt';
import { ConfigService } from '@nestjs/config';
import { ResConfig } from '../../config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userVisitRepository: UserVisitRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async registerEmail(dto: CreateUserEmailDto): Promise<IPostCreateUserEmailRes> {
    const { nickname, name, policy, birthdate, email, password } = dto;

    let user: User;

    const isUserAccountExist = await this.userAccountRepository.findUserAccountByEmail(email);

    if (isUserAccountExist) {
      user = isUserAccountExist.user;
    } else {
      user = await this.userRepository.createUser({ nickname, name, policy, birthdate });
    }

    const hashedPassword = await BcryptHandler.hashPassword(password);

    const userAccount = await this.userAccountRepository.createUserAccountByEmail({
      type: UserAccountTypeEnum.EMAIL,
      email,
      password: hashedPassword,
      user,
    });

    return { email: userAccount.email };
  }

  async checkEmail(dto: CheckEmailDto): Promise<IPostCheckEmailRes> {
    const { email } = dto;

    const isUserAccountExist = await this.userAccountRepository.findUserAccountByEmail(email);

    return { isExist: !!isUserAccountExist, email };
  }

  async loginEmail(params: { dto: LoginEmailDto; req: Request; res: Response }) {
    const { dto, req, res } = params;
    const { email, password } = dto;

    const userAccount = await this.userAccountRepository.findUserAccountByEmail(email);

    if (!userAccount) {
      throw ResConfig.Fail_400({ message: '일치하는 사용자가 없습니다.' });
    }

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);

    if (!isMatch) {
      throw new HttpException('비밀번호가 일치하지 않습니다.', 400);
    }

    return await this._login({ req, res, userAccount, type: UserVisitTypeEnum.SIGN_IN_EMAIL });
  }

  async loginOauth(params: { dto: LoginOauthDto; req: Request; res: Response }) {
    const { dto, req, res } = params;
    const { userAccountType, access_token } = dto;

    switch (userAccountType) {
      case UserAccountTypeEnum.GOOGLE:
        const token = this.httpService
          .get(`${this.configService.get('GOOGLE_OAUTH_URL')}?access_token=${access_token}`)
          .pipe(
            map((response) => {
              const { email, name, picture } = response.data;

              return { email, name, picture };
            }),
            catchError((error) => {
              console.error('Error occurred while fetching OAuth token:', error);
              throw new Error('Failed to fetch OAuth token');
            }),
          );

        const { email, name, picture } = await firstValueFrom(token);

        // userAccount 테이블에 OAuth 이메일에 동일한 user가 존재하는지 확인
        const user = await this.userAccountRepository.findUserAccountByEmail(email);

        if (user) {
          // user 테이블에 thumbnail 업데이트
          await this.userRepository.updateUserByUserSeq({ ...user.user, thumbnail: picture });

          // userAccount 테이블에 동일한 이메일의 userAccountType이 존재하는지 확인
          const isUserAccountGoogleExist = await this.userAccountRepository.findUserAccountTypeByEmail({
            email,
            type: UserAccountTypeEnum.GOOGLE,
          });

          if (!isUserAccountGoogleExist) {
            const userAccount = await this.userAccountRepository.createUserAccountByOauth({
              type: UserAccountTypeEnum.GOOGLE,
              email,
              user: user.user,
            });

            return await this._login({
              req,
              res,
              userAccount,
              type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
            });
          } else {
            return await this._login({
              req,
              res,
              userAccount: isUserAccountGoogleExist,
              type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
            });
          }
        } else {
          const user = await this.userRepository.createUser({
            nickname: name,
            name,
            policy: true,
            birthdate: undefined,
            thumbnail: picture,
          });

          const userAccount = await this.userAccountRepository.createUserAccountByOauth({
            type: UserAccountTypeEnum.GOOGLE,
            email,
            user,
          });

          return await this._login({ req, res, userAccount, type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE });
        }
      case UserAccountTypeEnum.KAKAO:
        break;
      case UserAccountTypeEnum.NAVER:
        break;
      default:
        break;
    }

    return;
  }

  async logoutEmail(params: { req: Request; res: Response }) {
    const { req, res } = params;

    res.clearCookie('refreshToken');

    await this.userAccountRepository.clearUserAccountRefreshToken(req.user.userSeq);

    await this._generateUserVisit({ req, type: UserVisitTypeEnum.SIGN_OUT_EMAIL });

    return res.status(200);
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

  private async _login(params: { req: Request; res: Response; userAccount: UserAccount; type: UserVisitTypeEnum }) {
    const { req, res, userAccount, type } = params;

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
      userAccount: userAccount,
      refreshToken,
    });

    await this._generateUserVisit({ req, type, user: userAccount.user });

    return res.status(200).send({ data: { email: userAccount.email, accessToken } });
  }
}
