import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { ResConfig } from '../../config';
import { RegisterUserPushTokenDto } from '../../type/dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getMyInfo(@Req() req: Request, @Res() res: Response) {
    const ret = await this.userService.getMyInfo(req);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Post('push-token')
  async registerPushToken(@Body() dto: RegisterUserPushTokenDto, @Req() req: Request, @Res() res: Response) {
    await this.userService.registerPushToken({ dto, req });

    return ResConfig.Success({ res, statusCode: 'OK' });
  }
}
