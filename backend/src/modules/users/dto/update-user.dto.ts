import { Exclude } from 'class-transformer';
import { IsString, IsOptional, Length } from 'class-validator';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  username?: string;

  @Exclude()
  @IsOptional()
  @IsString()
  @Length(4, 4)
  password?: string;
}
