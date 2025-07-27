import { IsString, IsObject, IsOptional, IsEnum, IsDate } from 'class-validator';
import { RaceStatus } from '../entities/race.entity';

export class UpdateRaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @IsOptional()
  @IsEnum(RaceStatus)
  status?: RaceStatus;

  @IsOptional()
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @IsDate()
  endTime?: Date;
}
