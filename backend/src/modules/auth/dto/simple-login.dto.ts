import { IsNotEmpty, IsString } from 'class-validator';

export class SimpleLoginDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}
