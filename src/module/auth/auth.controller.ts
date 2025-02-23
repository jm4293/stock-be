import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PostAuthLoginEmailDto, PostCheckEmailDto, PostCreateUserEmailDto } from '../../type/interface';
import { AuthRes, IPostCheckEmailRes, IPostCreateUserEmailRes } from '../../type/interface/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-email')
  async register(@Body() dto: PostCreateUserEmailDto) {
    try {
      const ret = await this.authService.registerEmail(dto);

      return AuthRes.Success<IPostCreateUserEmailRes>({ data: ret });
    } catch (e) {
      return AuthRes.Fail({ message: e.message });
    }
  }

  @Post('register-oauth')
  registerOauth() {
    return this.authService.registerOauth();
  }

  @Post('check-email')
  async checkEmail(@Body() dto: PostCheckEmailDto) {
    try {
      const ret = await this.authService.checkEmail(dto);

      return AuthRes.Success<IPostCheckEmailRes>({ data: ret });
    } catch (e) {
      return AuthRes.Fail({ message: e.message });
    }
  }

  @Post('login-email')
  login(@Body() dto: PostAuthLoginEmailDto) {
    return this.authService.loginEmail(dto);
  }

  @Post('login-oauth')
  loginOauth() {
    return this.authService.loginOauth();
  }
}
