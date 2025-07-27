import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class CreateAiModelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  version: string;

  @IsNotEmpty()
  @IsObject()
  modelData: Record<string, any>;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @IsOptional()
  @IsString()
  trainingStats?: string;
}
