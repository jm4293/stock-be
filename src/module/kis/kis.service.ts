import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IResOauthToken } from '../../type/interface/kis';
import { ResDto } from '../../common/res/res-dto';
import { KisRes } from './res';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class KisService {
  private oauthToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async postOuathToken(): Promise<ResDto<IResOauthToken>> {
    const ret = await this._getOuathToken();

    console.log('postOuathToken', ret);

    return KisRes.Success<IResOauthToken>({
      data: ret,
    });
  }

  async deleteOuathToken() {
    const ret = await this._deleteOuathToken();

    console.log('deleteOuathToken', ret);

    return KisRes.Success({
      data: ret,
    });
  }

  private async _getOuathToken(): Promise<IResOauthToken> {
    const ret = this.httpService
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

    return await firstValueFrom(ret);
  }

  private async _deleteOuathToken() {
    console.log('this.oauthToken ', this.oauthToken);

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

    return await firstValueFrom(ret);
  }
}
