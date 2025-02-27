import { UserAccountTypeEnum } from '../../../../constant/enum';

export class LoginOauthDto {
  userAccountType: UserAccountTypeEnum;
  access_token: string;
}
