import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class NetworkMetadataDto {
  @IsOptional()
  @IsNumber()
  nodes?: number;

  @IsOptional()
  @IsNumber()
  connections?: number;

  @IsOptional()
  @IsNumber()
  species?: number;

  @IsOptional()
  @IsBoolean()
  isElite?: boolean;
}
