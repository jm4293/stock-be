import { IsNotEmpty, IsString } from 'class-validator';

export class PostCheckEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
