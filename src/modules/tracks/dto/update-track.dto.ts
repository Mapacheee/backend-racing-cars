import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateTrackDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsObject()
  layoutData?: Record<string, any>;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
