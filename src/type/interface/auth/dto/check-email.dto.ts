import { IsNotEmpty, IsString } from 'class-validator';

export class CheckEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
