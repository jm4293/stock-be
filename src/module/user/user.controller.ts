import { Controller, Get, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { ResConfig } from '../../config';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getMyInfo(@Req() req: Request, @Res() res: Response) {
    const ret = await this.userService.getMyInfo(req);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }
}
