import { Injectable } from '@nestjs/common';
import {
  UserAccountRepository,
  UserPushTokenRepository,
  UserRepository,
  UserVisitRepository,
} from '../../database/repository';
import { BcryptHandler } from '../../handler';
import { User, UserAccount } from 'src/database/entities';
import { userAccountTypeDescription, UserAccountTypeEnum, UserVisitTypeEnum } from '../../constant/enum';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_COOKIE_TIME, REFRESH_TOKEN_TIME } from '../../constant/jwt';
import { ConfigService } from '@nestjs/config';
import { ResConfig } from '../../config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { CheckEmailDto, CreateUserEmailDto, LoginEmailDto, LoginOauthDto } from '../../type/dto';
import { IGetOauthGoogleTokenRes, IPostCheckEmailRes, IPostCreateUserEmailRes } from '../../type/res';
import { IJwtToken } from '../../type/interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,
    private readonly userVisitRepository: UserVisitRepository,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async registerEmail(dto: CreateUserEmailDto): Promise<IPostCreateUserEmailRes> {
    const { nickname, name, policy, birthdate, email, password } = dto;

    let user: User;

    const userAccount = await this.userAccountRepository.findOne({ where: { email }, relations: ['user'] });

    if (userAccount) {
      user = userAccount.user;
    } else {
      user = await this.userRepository.createUser({ nickname, name, policy, birthdate });
    }

    const hashedPassword = await BcryptHandler.hashPassword(password);

    const newUserAccount = await this.userAccountRepository.createUserAccountByEmail({
      userAccountType: UserAccountTypeEnum.EMAIL,
      email,
      password: hashedPassword,
      user,
    });

    return { email: newUserAccount.email };
  }

  async checkEmail(dto: CheckEmailDto): Promise<IPostCheckEmailRes> {
    const { email } = dto;

    const userAccount = await this.userAccountRepository.findOne({
      where: { email },
      relations: ['user'],
    });

    if (userAccount) {
      const { email, userAccountType } = userAccount;

      switch (userAccountType) {
        case UserAccountTypeEnum.EMAIL:
          throw ResConfig.Fail_400({
            message: `이메일: ${email}은 ${userAccountTypeDescription[userAccountType]} 가입 회원입니다.`,
          });
        case UserAccountTypeEnum.GOOGLE:
          throw ResConfig.Fail_400({
            message: `이메일: ${email}은 ${userAccountTypeDescription[userAccountType]} 간편로그인 회원입니다.`,
          });
        default:
          break;
      }
    }

    return { isExist: !!userAccount, email };
  }

  async loginEmail(params: { dto: LoginEmailDto; req: Request; res: Response }) {
    const { dto, req, res } = params;
    const { email, password } = dto;

    const userAccount = await this.userAccountRepository.findUserAccountByEmail(email);

    const isMatch = await BcryptHandler.comparePassword(password, userAccount.password as string);

    if (!isMatch) {
      throw ResConfig.Fail_400({ message: '비밀번호가 일치하지 않습니다.' });
    }

    return await this._login({ req, res, user: userAccount.user, userAccount, type: UserVisitTypeEnum.SIGN_IN_EMAIL });
  }

  async loginOauth(params: { dto: LoginOauthDto; req: Request; res: Response }) {
    const { dto, req, res } = params;
    const { userAccountType, access_token } = dto;

    switch (userAccountType) {
      case UserAccountTypeEnum.GOOGLE: {
        const googleToken = await firstValueFrom(
          this.httpService.get<IGetOauthGoogleTokenRes>(
            `${this.configService.get('GOOGLE_OAUTH_URL')}?access_token=${access_token}`,
          ),
        );

        const { email, name, picture } = googleToken.data;

        const imageResponse = await firstValueFrom(this.httpService.get(picture, { responseType: 'arraybuffer' }));

        const blob = new Blob([imageResponse.data], { type: 'image/jpeg' });

        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

        const formData = new FormData();

        formData.append('image', file);

        const resizingPicture = await firstValueFrom(
          this.httpService.post(
            `${this.configService.get('IMAGE_RESIZING_URL')}:${this.configService.get('IMAGE_RESIZING_PORT')}/${this.configService.get('IMAGE_RESIZING_PREFIX')}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
          ),
        );

        const userAccount = await this.userAccountRepository.findOne({
          where: { email, userAccountType: UserAccountTypeEnum.GOOGLE },
          relations: ['user'],
        });

        if (userAccount) {
          await this.userRepository.update(
            { userSeq: userAccount.user.userSeq },
            { nickname: name, name, thumbnail: resizingPicture.data.resizedImageUrl },
          );

          const userAccountGoogle = await this.userAccountRepository.findOne({
            where: { email, userAccountType: UserAccountTypeEnum.GOOGLE },
            relations: ['user'],
          });

          if (userAccountGoogle) {
            return await this._login({
              req,
              res,
              user: userAccountGoogle.user,
              userAccount: userAccountGoogle,
              type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
            });
          } else {
            const newUserAccount = await this.userAccountRepository.createUserAccountByOauth({
              userAccountType: UserAccountTypeEnum.GOOGLE,
              email,
              user: userAccount.user,
            });

            return await this._login({
              req,
              res,
              user: newUserAccount.user,
              userAccount: newUserAccount,
              type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
            });
          }
        } else {
          const newUser = await this.userRepository.createUser({
            nickname: name,
            name,
            policy: true,
            birthdate: undefined,
            thumbnail: resizingPicture.data.resizedImageUrl,
          });

          const newUserAccount = await this.userAccountRepository.createUserAccountByOauth({
            userAccountType: UserAccountTypeEnum.GOOGLE,
            email,
            user: newUser,
          });

          return await this._login({
            req,
            res,
            user: newUser,
            userAccount: newUserAccount,
            type: UserVisitTypeEnum.SIGN_IN_OAUTH_GOOGLE,
          });
        }
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

  async logout(params: { req: Request; res: Response }) {
    const { req, res } = params;
    const { userSeq } = req.user;

    const user = await this.userRepository.findUserByUserSeq(userSeq);

    await this.userAccountRepository.update({ user }, { refreshToken: null });

    await this.userPushTokenRepository.update({ user }, { pushToken: null });

    await this._generateUserVisit({ req, type: UserVisitTypeEnum.SIGN_OUT_EMAIL, user });

    const cookies = req.cookies;

    for (const cookie in cookies) {
      if (cookies.hasOwnProperty(cookie)) {
        res.clearCookie(cookie);
      }
    }

    return res.status(200).send({ message: '로그아웃 되었습니다.' });
  }

  async refreshToken(params: { req: Request; res: Response }) {
    const { req, res } = params;

    const refreshToken = req.cookies['RT'] as string;

    if (!refreshToken) {
      throw ResConfig.Fail_403({ message: '리프레시 토큰이 존재하지 않습니다.' });
    }

    const { userSeq, userAccountType } = this.jwtService.verify<IJwtToken>(
      refreshToken,
      this.configService.get('JWT_SECRET_KEY'),
    );

    const savedRefreshToken = await this.userAccountRepository.findOne({
      where: { user: { userSeq }, userAccountType },
    });

    if (!savedRefreshToken) {
      throw ResConfig.Fail_403({ message: 'DB 리프레시 토큰이 존재하지 않습니다.' });
    }

    if (refreshToken !== savedRefreshToken.refreshToken) {
      throw ResConfig.Fail_403({ message: '리프레시 토큰이 일치하지 않습니다.' });
    }

    const accessToken = await this._generateJwtToken({ userSeq, userAccountType, expiresIn: ACCESS_TOKEN_TIME });

    return res.status(200).send({ data: { accessToken } });
  }

  private async _generateJwtToken(params: IJwtToken) {
    const { userSeq, userAccountType, expiresIn } = params;

    return await this.jwtService.signAsync(
      { userSeq, userAccountType },
      { expiresIn, secret: this.configService.get('JWT_SECRET_KEY') },
    );
  }

  private async _login(params: {
    req: Request;
    res: Response;
    user: User;
    userAccount: UserAccount;
    type: UserVisitTypeEnum;
  }) {
    const { req, res, user, userAccount, type } = params;

    const accessToken = await this._generateJwtToken({
      userSeq: user.userSeq,
      userAccountType: userAccount.userAccountType,
      expiresIn: ACCESS_TOKEN_TIME,
    });

    const refreshToken = await this._generateJwtToken({
      userSeq: user.userSeq,
      userAccountType: userAccount.userAccountType,
      expiresIn: REFRESH_TOKEN_TIME,
    });

    res.cookie('RT', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_COOKIE_TIME,
    });

    await this.userAccountRepository.manager.transaction(async (manager) => {
      await manager.update(UserAccount, { user: { userSeq: user.userSeq } }, { refreshToken: null });
      await manager.update(UserAccount, { userAccountSeq: userAccount.userAccountSeq }, { refreshToken });
    });

    await this._generateUserVisit({ req, type, user });

    return res.status(200).send({ data: { email: userAccount.email, accessToken } });
  }

  private async _generateUserVisit(params: { req: Request; type: UserVisitTypeEnum; user: User }) {
    const { req, type, user } = params;
    const { headers, ip = null } = req;
    const { 'user-agent': userAgent = null, referer = null } = headers;

    const userVisit = this.userVisitRepository.create({ user, type, ip, userAgent, referer });

    return await this.userVisitRepository.save(userVisit);
  }
}
