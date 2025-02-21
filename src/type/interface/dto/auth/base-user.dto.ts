import { IsBoolean, IsDate, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseUserDto {
  @IsString()
  nickname: string;

  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsBoolean()
  policy: boolean;

  @Type(() => Date)
  @IsDate()
  birthdate: Date;
}
