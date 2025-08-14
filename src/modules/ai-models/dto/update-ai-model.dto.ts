import { IsString, IsObject, IsOptional } from 'class-validator';

export class UpdateAiModelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsObject()
  modelData?: Record<string, any>;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @IsOptional()
  @IsString()
  trainingStats?: string;
}
