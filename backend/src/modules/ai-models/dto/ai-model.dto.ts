import {
  IsString,
  IsOptional,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateAIModelDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  version: string;

  @IsObject()
  modelData: Record<string, any>;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  generationNumber?: number;

  @IsOptional()
  @IsObject()
  trainingMetrics?: {
    distanceCompleted: number;
    timeElapsed: number;
    avgSpeed: number;
    collisions: number;
    lapTimes?: number[];
  };

  @IsOptional()
  @IsObject()
  genetics?: {
    parentIds?: string[];
    fitnessScore: number;
    mutationRate?: number;
  };
}

export class UpdateAIModelDto {
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
  @IsNumber()
  generationNumber?: number;

  @IsOptional()
  @IsObject()
  trainingMetrics?: {
    distanceCompleted: number;
    timeElapsed: number;
    avgSpeed: number;
    collisions: number;
    lapTimes?: number[];
  };

  @IsOptional()
  @IsObject()
  genetics?: {
    parentIds?: string[];
    fitnessScore: number;
    mutationRate?: number;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AIModelFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  minGeneration?: number;

  @IsOptional()
  @IsNumber()
  maxGeneration?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  minFitnessScore?: number;
}
