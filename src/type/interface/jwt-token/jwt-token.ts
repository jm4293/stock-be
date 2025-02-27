import { UserAccountTypeEnum } from '../../../constant/enum';

export interface IJwtToken {
  userSeq: number;
  accountType: UserAccountTypeEnum;
  expiresIn?: number;
}
