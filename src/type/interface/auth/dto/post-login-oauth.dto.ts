import { UserAccountTypeEnum } from '../../../enum';

export class PostLoginOauthDto {
  userAccountType: UserAccountTypeEnum;
  access_token: string;
}
