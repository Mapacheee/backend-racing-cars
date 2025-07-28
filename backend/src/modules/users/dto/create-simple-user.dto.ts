import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateSimpleUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
