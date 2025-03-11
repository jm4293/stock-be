import { Controller, Delete, Get, Req, Res } from '@nestjs/common';
import { KisService } from './kis.service';
import { ResConfig } from '../../config';
import { Request, Response } from 'express';

@Controller('kis')
export class KisController {
  constructor(private readonly kisService: KisService) {}

  @Get('oauth-token')
  async getOuathToken(@Req() req: Request, @Res() res: Response) {
    const ret = await this.kisService.getOuathToken({ req });

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Delete('oauth-revoke')
  async deleteOuathToken(@Res() res: Response) {
    const ret = await this.kisService.deleteOuathToken();

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }
}
