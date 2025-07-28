import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString, IsNumber, IsOptional, IsUUID, ValidateNested } from 'class-validator';

class ParticipantDto {
  @IsUUID()
  aiModelId: string;

  @IsNumber()
  position: number;

  @IsOptional()
  @IsNumber()
  finishTime?: number;

  @IsNumber()
  distanceCompleted: number;

  @IsArray()
  @IsNumber({}, { each: true })
  lapTimes: number[];
}

class TrackInfoDto {
  @IsUUID()
  trackId: string;

  @IsString()
  trackName: string;

  @IsNumber()
  numberOfLaps: number;
}

class RaceConditionsDto {
  @IsOptional()
  @IsString()
  weather?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsNumber()
  numberOfParticipants: number;
}

class RaceMetricsDto {
  @IsNumber()
  averageSpeed: number;

  @IsNumber()
  bestLapTime: number;

  @IsNumber()
  totalRaceTime: number;

  @IsNumber()
  collisions: number;
}

export class CreateRaceStatisticsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => TrackInfoDto)
  trackInfo: TrackInfoDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RaceConditionsDto)
  raceConditions?: RaceConditionsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RaceMetricsDto)
  raceMetrics?: RaceMetricsDto;
}

export class RaceStatisticsFilterDto {
  @IsOptional()
  @IsString()
  trackId?: string;

  @IsOptional()
  @IsString()
  aiModelId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;
}
