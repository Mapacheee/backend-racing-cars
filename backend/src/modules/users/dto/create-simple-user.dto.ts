import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSimpleUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
export class CreateSimpleUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
