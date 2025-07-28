import { IsNotEmpty, IsString, IsObject, IsOptional, IsArray, IsEnum } from 'class-validator';
import { RaceStatus } from '../entities/race.entity';

export class CreateRaceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  trackId: string;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @IsOptional()
  @IsEnum(RaceStatus)
  status?: RaceStatus;

  @IsOptional()
  @IsArray()
  participantIds?: string[];
}
