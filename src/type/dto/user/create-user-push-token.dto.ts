import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateUserPushTokenDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  pushToken: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  deviceNo: string;
}
