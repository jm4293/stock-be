import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginEmailDto, CheckEmailDto, CreateUserEmailDto, LoginOauthDto } from '../../type/interface';
import { Request, Response } from 'express';
import { Public } from '../../decorator';
import { ResConfig } from '../../config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register-email')
  async register(@Body() dto: CreateUserEmailDto, @Res() res: Response) {
    const ret = await this.authService.registerEmail(dto);

    return ResConfig.Success({ res, statusCode: 'CREATED', data: ret });
  }

  @Public()
  @Post('check-email')
  async checkEmail(@Body() dto: CheckEmailDto, @Res() res: Response) {
    const ret = await this.authService.checkEmail(dto);

    return ResConfig.Success({ res, statusCode: 'OK', data: ret });
  }

  @Public()
  @Post('login-email')
  async loginEmail(@Body() dto: LoginEmailDto, @Req() req: Request, @Res() res: Response) {
    return await this.authService.loginEmail({ dto, req, res });
  }

  @Public()
  @Post('login-oauth')
  loginOauth(@Body() dto: LoginOauthDto, @Req() req: Request, @Res() res: Response) {
    return this.authService.loginOauth({ dto, req, res });
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
