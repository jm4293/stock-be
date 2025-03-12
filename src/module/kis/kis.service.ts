import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KisTokenIssueRepository, KisTokenRepository, UserRepository } from '../../database/repository';
import { IKisCreateToken } from '../../type/interface';
import { Request } from 'express';
import { ResConfig } from '../../config';
import { KisToken } from '../../database/entities';
import { AxiosResponse } from 'axios';

@Injectable()
export class KisService implements OnModuleInit {
  private kisToken: KisToken | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    private readonly kisTokenRepository: KisTokenRepository,
    private readonly kisTokenIssueRepository: KisTokenIssueRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async onModuleInit() {
    // await this._deleteKisToken();
    // await this.handleCron();
  }

  @Cron(CronExpression.EVERY_6_HOURS, { name: 'kis Token', timeZone: 'Asia/Seoul' })
  async handleCron() {
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    console.log(`[${now}] Scheduler 'kis Token' called`);

    const ret = await firstValueFrom<AxiosResponse<IKisCreateToken>>(
      this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/tokenP`, {
        grant_type: 'client_credentials',
        appkey: this.configService.get('KIS_APP_KEY'),
        appsecret: this.configService.get('KIS_APP_SECRET'),
      }),
    );

    const { access_token, access_token_token_expired, token_type, expires_in } = ret.data;

    const isKisToken = await this.kisTokenRepository.findOne({ where: { kisTokenSeq: 1 } });

    if (isKisToken) {
      isKisToken.accessToken = access_token;
      isKisToken.accessTokenExpired = access_token_token_expired;
      isKisToken.tokenType = token_type;
      isKisToken.expiresIn = expires_in;

      await this.kisTokenRepository.save(isKisToken);
    } else {
      const token = this.kisTokenRepository.create({
        accessToken: access_token,
        accessTokenExpired: access_token_token_expired,
        tokenType: token_type,
        expiresIn: expires_in,
      });

      await this.kisTokenRepository.save(token);
    }
  }

  // 토큰
  async getOuathToken(params: { req: Request }) {
    const { req } = params;
    const { headers, ip = null, user } = req;
    const { 'user-agent': userAgent = null, referer = null } = headers;
    const { userSeq } = user;

    await this.userRepository.findUserByUserSeq(userSeq);

    const kisToken = await this._getKisToken();

    await this.kisTokenIssueRepository.save({ userSeq, kisTokenSeq: kisToken.kisTokenSeq, ip, userAgent, referer });

    return { kisToken: kisToken.accessToken };
  }

  async getCodeList() {
    // const kisToken = await this._getKisToken();
    //
    // const ret = await firstValueFrom(
    //   this.httpService.get(`${this.configService.get('KIS_APP_URL')}/uapi/domestic-stock/v1/quotations/inquire-ccnl`, {
    //     headers: {
    //       'Content-Type': 'application/json; charset=utf-8',
    //       Authorization: `Bearer ${kisToken.accessToken}`,
    //       appkey: this.configService.get('KIS_APP_KEY'),
    //       appsecret: this.configService.get('KIS_APP_SECRET'),
    //       tr_id: 'FHKST01010100',
    //       custtype: 'P',
    //     },
    //     params: {
    //       FID_COND_MRKT_DIV_CODE: 'J', // 시장 구분 코드
    //     },
    //   }),
    // );
    //
    // if (ret.status !== 200) {
    //   throw ResConfig.Fail_400({ message: '종목 리스트 조회에 실패하였습니다.' });
    // }
    //
    // return ret.data;

    const ret: any = await firstValueFrom(
      this.httpService.get('http://api.seibro.or.kr/openapi/service/StockSvc/getKDRSecnInfo', {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          serviceKey: `${this.configService.get('DATA_GO_KR_STOCK_CODE_SERVICE_KEY')}`,
          caltotMartTpcd: '12',
        },
      }),
    );

    return ret.data;
  }

  async getCodeDetail(params: { code: string }) {
    const { code } = params;

    const kisToken = await this._getKisToken();

    const ret = await firstValueFrom(
      this.httpService.get(`${this.configService.get('KIS_APP_URL')}/uapi/domestic-stock/v1/quotations/inquire-price`, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${kisToken.accessToken}`,
          appkey: this.configService.get('KIS_APP_KEY'),
          appsecret: this.configService.get('KIS_APP_SECRET'),
          tr_id: 'FHKST01010100',
          custtype: 'P',
        },
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: code,
        },
      }),
    );

    if (ret.status !== 200) {
      throw ResConfig.Fail_400({ message: '종목 조회에 실패하였습니다.' });
    }

    return ret.data;
  }

  private async _getKisToken() {
    if (!this.kisToken) {
      const kisToken = await this.kisTokenRepository.find();

      if (!kisToken || !kisToken[0]) {
        console.error('Kis token이 DB에 존재하지 않습니다.');
      }

      this.kisToken = kisToken[0];
    }

    return this.kisToken;
  }

  private async _deleteKisToken() {
    if (this.kisToken) {
      return await firstValueFrom(
        this.httpService.post(`${this.configService.get('KIS_APP_URL')}/oauth2/revokeP`, {
          token: this.kisToken.accessToken,
          appkey: this.configService.get('KIS_APP_KEY'),
          appsecret: this.configService.get('KIS_APP_SECRET'),
        }),
      );
    }
  }
}
