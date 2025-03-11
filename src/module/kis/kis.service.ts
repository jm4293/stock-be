import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KisTokenRepository } from '../../database/repository';
import { IKisCreateToken } from '../../type/interface';

@Injectable()
export class KisService {
  private oauthToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly kisTokenRepository: KisTokenRepository,
  ) {}

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
          this.oauthToken = response.data.access_token;

          return response.data;
        }),
        catchError((error) => {
          console.error('Error occurred while fetching OAuth token:', error);
          throw new Error('Failed to fetch OAuth token');
        }),
      );

    const ret: IKisCreateToken = await firstValueFrom(httpRet);

    const token = this.kisTokenRepository.create({
      accessToken: ret.access_token,
      accessTokenExpired: ret.access_token_token_expired,
      tokenType: ret.token_type,
      expiresIn: ret.expires_in,
    });

    await this.kisTokenRepository.save(token);
  }

  async postOuathToken() {
    return;
  }

  async deleteOuathToken() {
    const ret = this.httpService
      .post(`${this.configService.get('KIS_APP_URL')}/oauth2/revokeP`, {
        token: this.oauthToken,
        appkey: this.configService.get('KIS_APP_KEY'),
        appsecret: this.configService.get('KIS_APP_SECRET'),
      })
      .pipe(
        map((response) => {
          this.oauthToken = null;

          return response.data;
        }),
        catchError((error) => {
          console.error('Error occurred while deleting OAuth token:', error);
          throw new Error('Failed to delete OAuth token');
        }),
      );

    return await firstValueFrom<boolean>(ret);
  }
}
