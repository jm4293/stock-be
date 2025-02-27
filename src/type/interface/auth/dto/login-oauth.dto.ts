import { UserAccountTypeEnum } from '../../../../constant/enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class LoginOauthDto {
  @IsEnum(UserAccountTypeEnum)
  @IsNotEmpty()
  userAccountType: UserAccountTypeEnum;

  @IsString()
  @IsNotEmpty()
  access_token: string;
}
