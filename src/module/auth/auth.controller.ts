import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PostAuthLoginEmailDto, PostCheckEmailDto, PostCreateUserEmailDto } from '../../type/interface';
import { Request, Response } from 'express';
import { Public } from '../../decorator';
import { ResConfig } from '../../config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register-email')
  async register(@Body() dto: PostCreateUserEmailDto, @Res() res: Response) {
    const ret = await this.authService.registerEmail(dto);

    return ResConfig.Success({ res, statusCode: 'CREATED', data: ret });
  }

  @Public()
  @Post('register-oauth')
  registerOauth() {
    return this.authService.registerOauth();
  }

  @Public()
  @Post('check-email')
  async checkEmail(@Body() dto: PostCheckEmailDto, @Res() res: Response) {
    const ret = await this.authService.checkEmail(dto);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Post('login-email')
  async loginEmail(@Body() dto: PostAuthLoginEmailDto, @Req() req: Request, @Res() res: Response) {
    return await this.authService.loginEmail({ dto, req, res });
  }

  @Public()
  @Post('login-oauth')
  loginOauth() {
    return this.authService.loginOauth();
  }

  @Post('logout-email')
  async logoutEmail(@Req() req: Request, @Res() res: Response) {
    return await this.authService.logoutEmail({ req, res });
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return await this.authService.refreshToken({ req, res });
  }
}
