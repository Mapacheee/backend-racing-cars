import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

// Request DTOs
export class CreateRoomDto {
  @IsString()
  adminUsername: string;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number = 30;
}

export class JoinRoomDto {
  @IsString()
  roomId: string;

  @IsString()
  userId: string;

  @IsString()
  username: string;
}

export class LeaveRoomDto {
  @IsString()
  roomId: string;

  @IsString()
  userId: string;
}

export class ConfigureRaceDto {
  @IsString()
  roomId: string;

  @IsString()
  adminUsername: string;

  @ValidateNested()
  @Type(() => RaceConfigurationDto)
  raceConfig: RaceConfigurationDto;
}

export class RaceConfigurationDto {
  @IsString()
  trackId: string;

  @IsArray()
  @IsString({ each: true })
  aiModelIds: string[];

  @ValidateNested()
  @Type(() => RaceSettingsDto)
  raceSettings: RaceSettingsDto;
}

export class RaceSettingsDto {
  @IsOptional()
  @IsNumber()
  timeLimit: number;
}

export class StartRaceDto {
  @IsString()
  roomId: string;

  @IsString()
  adminUsername: string;
}

export class GetRoomStatusDto {
  @IsString()
  roomId: string;
}

export class PositionUpdateDto {
  @IsString()
  roomId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarPositionDto)
  positions: CarPositionDto[];

  @IsNumber()
  timestamp: number;
}

export class CarPositionDto {
  @IsString()
  carId: string;

  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @ValidateNested()
  @Type(() => VelocityDto)
  velocity: VelocityDto;

  @IsNumber()
  lapProgress: number;

  @IsNumber()
  currentLap: number;

  @IsNumber()
  racePosition: number;
}

export class PositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;

  @IsNumber()
  rotation: number;
}

export class VelocityDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  speed: number;
}

export class RaceEventDto {
  @IsString()
  roomId: string;

  @ValidateNested()
  @Type(() => RaceEventDataDto)
  event: RaceEventDataDto;
}

export class RaceEventDataDto {
  @IsString()
  type: string;

  @IsNumber()
  timestamp: number;

  @IsOptional()
  @IsString()
  carId?: string;

  @IsOptional()
  data?: any;
}

// Response DTOs
export class RoomCreatedResponseDto {
  @ValidateNested()
  @Type(() => RoomResponseDto)
  room: RoomResponseDto;

  @IsString()
  message: string;
}

export class RoomJoinedResponseDto {
  @ValidateNested()
  @Type(() => RoomResponseDto)
  room: RoomResponseDto;
}

export class PlayerJoinedResponseDto {
  @ValidateNested()
  @Type(() => ParticipantResponseDto)
  participant: ParticipantResponseDto;

  @ValidateNested()
  @Type(() => RoomResponseDto)
  room: RoomResponseDto;
}

export class PlayerLeftResponseDto {
  @IsString()
  userId: string;

  @ValidateNested()
  @Type(() => RoomResponseDto)
  room: RoomResponseDto;
}

export class RoomClosedResponseDto {
  @IsString()
  message: string;
}

export class RoomLeftResponseDto {
  @IsString()
  message: string;
}

export class RaceConfiguredResponseDto {
  @ValidateNested()
  @Type(() => RoomResponseDto)
  room: RoomResponseDto;

  @ValidateNested()
  @Type(() => RaceConfigurationDto)
  config: RaceConfigurationDto;
}

export class RaceStartedResponseDto {
  @ValidateNested()
  @Type(() => RoomResponseDto)
  room: RoomResponseDto;

  @IsNumber()
  timestamp: number;
}

export class ValidationResponseDto {
  @IsBoolean()
  valid: boolean;
}

export class ErrorResponseDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  error?: string;
}

// Complex response DTOs for room and participant data
export class RoomResponseDto {
  @IsString()
  id: string;

  @IsString()
  adminId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantResponseDto)
  participants: ParticipantResponseDto[];

  @IsEnum(['waiting', 'preparing', 'racing', 'paused', 'finished', 'closed'])
  status: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RaceConfigurationDto)
  raceConfig?: RaceConfigurationDto;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsNumber()
  maxParticipants: number;
}

export class ParticipantResponseDto {
  @IsString()
  userId: string;

  @IsString()
  username: string;

  @IsDate()
  @Type(() => Date)
  connectedAt: Date;

  @IsString()
  socketId: string;
}

// Race package response DTOs
export class RacePackageResponseDto {
  @ValidateNested()
  @Type(() => TrackDataResponseDto)
  trackData: TrackDataResponseDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AIModelDataResponseDto)
  aiModels: AIModelDataResponseDto[];

  @ValidateNested()
  @Type(() => RaceConfigurationDto)
  raceConfig: RaceConfigurationDto;
}

export class TrackDataResponseDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackPointResponseDto)
  layout: TrackPointResponseDto[];

  @ValidateNested()
  @Type(() => TrackMetadataResponseDto)
  metadata: TrackMetadataResponseDto;
}

export class TrackPointResponseDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;

  @IsEnum(['track', 'checkpoint', 'start', 'finish'])
  type: string;
}

export class TrackMetadataResponseDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  checkpoints: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AIModelDataResponseDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  generation: number;

  @IsArray()
  weights: number[][];

  @ValidateNested()
  @Type(() => AIArchitectureResponseDto)
  architecture: AIArchitectureResponseDto;
}

export class AIArchitectureResponseDto {
  @IsNumber()
  inputs: number;

  @IsArray()
  @IsNumber({}, { each: true })
  hiddenLayers: number[];

  @IsNumber()
  outputs: number;
}

// Admin-specific DTOs
export class CloseRoomDto {
  @IsString()
  roomId: string;

  @IsString()
  adminUsername: string;
}

export class AdminStatsResponseDto {
  @IsNumber()
  totalRooms: number;

  @ValidateNested()
  @Type(() => Object)
  roomsByStatus: Record<string, number>;

  @IsNumber()
  totalParticipants: number;
}

export class RemoveParticipantDto {
  @IsString()
  roomId: string;

  @IsString()
  userId: string;

  @IsString()
  adminUsername: string;
}
