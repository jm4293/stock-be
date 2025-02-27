import { Controller, Delete, Get, Res } from '@nestjs/common';
import { KisService } from './kis.service';
import { ResConfig } from '../../config';
import { Response } from 'express';

@Controller('kis')
export class KisController {
  constructor(private readonly kisService: KisService) {}

  @Get('oauth-token')
  async postOuathToken(@Res() res: Response) {
    const ret = await this.kisService.postOuathToken();

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Delete('oauth-revoke')
  async deleteOuathToken(@Res() res: Response) {
    const ret = await this.kisService.deleteOuathToken();

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }
}
