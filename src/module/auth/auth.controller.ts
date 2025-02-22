import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PostAuthLoginEmailDto, PostCreateUserEmailDto } from '../../type/interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/email')
  register(@Body() dto: PostCreateUserEmailDto) {
    return this.authService.registerEmail(dto);
  }

  @Post('register/oauth')
  registerOauth() {
    return this.authService.registerOauth();
  }

  @Post('login/email')
  login(@Body() dto: PostAuthLoginEmailDto) {
    return this.authService.loginEmail(dto);
  }

  @Post('login/oauth')
  loginOauth() {
    return this.authService.loginOauth();
  }
}
