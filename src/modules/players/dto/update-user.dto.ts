import { Exclude } from 'class-transformer';
import { IsString, IsOptional, Length, IsNumber, Min } from 'class-validator';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  username?: string;

  @Exclude()
  @IsOptional()
  @IsString()
  @Length(4, 4)
  password?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  aiGeneration?: number;
}
