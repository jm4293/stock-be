import { BaseUserDto } from './base-user.dto';
import { BaseUserAccountDto } from './base-user-account.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostCreateUserEmailDto implements BaseUserDto, BaseUserAccountDto {
  // BaseUserDto 속성
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  policy: boolean;

  @IsString()
  @IsOptional()
  birthdate: string;

  // BaseUserAccountDto 속성
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
