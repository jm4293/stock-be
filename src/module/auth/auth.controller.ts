import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PostAuthLoginEmailDto, PostCheckEmailDto, PostCreateUserEmailDto } from '../../type/interface';
import { Response } from 'express';
import { Public } from '../../decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register-email')
  async register(@Body() dto: PostCreateUserEmailDto) {
    return await this.authService.registerEmail(dto);
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
  async loginEmail(@Body() dto: PostAuthLoginEmailDto, @Res() res: Response) {
    return await this.authService.loginEmail(dto, res);
  }

  @Public()
  @Post('login-oauth')
  loginOauth() {
    return this.authService.loginOauth();
  }
}
