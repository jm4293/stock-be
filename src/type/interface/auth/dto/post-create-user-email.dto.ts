import { BaseUserDto } from './base-user.dto';
import { BaseUserAccountDto } from './base-user-account.dto';
import { UserAccountTypeEnum } from '../../../enum';
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PostCreateUserEmailDto implements BaseUserDto, BaseUserAccountDto {
  // BaseUserDto 속성
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  age: number;

  @IsBoolean()
  @IsNotEmpty()
  policy: boolean;

  @Type(() => Date)
  @IsDate()
  birthdate: Date;

  // BaseUserAccountDto 속성
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
