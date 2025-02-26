import { UserAccountTypeEnum } from '../../../enum';

export class LoginOauthDto {
  userAccountType: UserAccountTypeEnum;
  access_token: string;
}
