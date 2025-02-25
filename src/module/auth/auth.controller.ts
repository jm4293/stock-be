import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PostAuthLoginEmailDto, PostCheckEmailDto, PostCreateUserEmailDto } from '../../type/interface';
import { Request, Response } from 'express';
import { Public } from '../../decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register-email')
  async register(@Body() dto: PostCreateUserEmailDto, @Req() req: Request) {
    return await this.authService.registerEmail({ dto, req });
  }

  @Public()
  @Post('register-oauth')
  registerOauth() {
    return this.authService.registerOauth();
  }

  @Public()
  @Post('check-email')
  async checkEmail(@Body() dto: PostCheckEmailDto) {
    return await this.authService.checkEmail(dto);
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

  @Public()
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return await this.authService.refreshToken({ req, res });
  }
}
