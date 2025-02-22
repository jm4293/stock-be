import { UserAccountTypeEnum } from '../../../enum';

export class BaseUserAccountDto {
  userAccountType: UserAccountTypeEnum;
  email: string;
  password?: string;
  refreshToken?: string;
}
