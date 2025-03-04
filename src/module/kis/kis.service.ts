import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class KisService {
  private oauthToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async postOuathToken() {
    // const ret = this.httpService
    //   .post(`${this.configService.get('KIS_APP_URL')}/oauth2/tokenP`, {
    //     grant_type: 'client_credentials',
    //     appkey: this.configService.get('KIS_APP_KEY'),
    //     appsecret: this.configService.get('KIS_APP_SECRET'),
    //   })
    //   .pipe(
    //     map((response) => {
    //       this.oauthToken = response.data.access_token;
    //
    //       return response.data;
    //     }),
    //     catchError((error) => {
    //       console.error('Error occurred while fetching OAuth token:', error);
    //       throw new Error('Failed to fetch OAuth token');
    //     }),
    //   );
    //
    // return await firstValueFrom(ret);

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
