import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KisTokenIssueRepository, KisTokenRepository, UserRepository } from '../../database/repository';
import { IKisCreateToken } from '../../type/interface';
import { Request } from 'express';

@Injectable()
export class KisService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly kisTokenRepository: KisTokenRepository,
    private readonly kisTokenIssueRepository: KisTokenIssueRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async onModuleInit() {
    // await this.handleCron();
  }

  @Cron(CronExpression.EVERY_6_HOURS, { name: 'kis Token', timeZone: 'Asia/Seoul' })
  async handleCron() {
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    console.log(`[${now}] Scheduler 'kis Token' called`);

    const httpRet = this.httpService
      .post(`${this.configService.get('KIS_APP_URL')}/oauth2/tokenP`, {
        grant_type: 'client_credentials',
        appkey: this.configService.get('KIS_APP_KEY'),
        appsecret: this.configService.get('KIS_APP_SECRET'),
      })
      .pipe(
        map((response) => {
          return response.data;
        }),
        catchError((error) => {
          console.error('Error occurred while fetching OAuth token:', error);
          throw new Error('Failed to fetch OAuth token');
        }),
      );

    const ret: IKisCreateToken = await firstValueFrom(httpRet);

    const existingToken = await this.kisTokenRepository.findOne({ where: { kisTokenSeq: 1 } });

    if (existingToken) {
      existingToken.accessToken = ret.access_token;
      existingToken.accessTokenExpired = ret.access_token_token_expired;
      existingToken.tokenType = ret.token_type;
      existingToken.expiresIn = ret.expires_in;

      await this.kisTokenRepository.save(existingToken);
    } else {
      const token = this.kisTokenRepository.create({
        accessToken: ret.access_token,
        accessTokenExpired: ret.access_token_token_expired,
        tokenType: ret.token_type,
        expiresIn: ret.expires_in,
      });

      await this.kisTokenRepository.save(token);
    }
  }

  async getOuathToken(params: { req: Request }) {
    const { req } = params;
    const { headers, ip = null, user } = req;
    const { 'user-agent': userAgent = null, referer = null } = headers;
    const { userSeq } = user;

    await this.userRepository.findUserByUserSeq(userSeq);

    const kisToken = await this.kisTokenRepository.find();

    await this.kisTokenIssueRepository.save({ userSeq, kisTokenSeq: kisToken[0].kisTokenSeq, ip, userAgent, referer });

    return { kisToken: kisToken[0].accessToken };
  }

  async deleteOuathToken() {
    //   const ret = this.httpService
    //     .post(`${this.configService.get('KIS_APP_URL')}/oauth2/revokeP`, {
    //       token: this.oauthToken,
    //       appkey: this.configService.get('KIS_APP_KEY'),
    //       appsecret: this.configService.get('KIS_APP_SECRET'),
    //     })
    //     .pipe(
    //       map((response) => {
    //         this.oauthToken = null;
    //
    //         return response.data;
    //       }),
    //       catchError((error) => {
    //         console.error('Error occurred while deleting OAuth token:', error);
    //         throw new Error('Failed to delete OAuth token');
    //       }),
    //     );
    //
    //   return await firstValueFrom<boolean>(ret);
  }
}
