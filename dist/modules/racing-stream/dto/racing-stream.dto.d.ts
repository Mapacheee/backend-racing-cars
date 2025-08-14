export declare class CreateRoomDto {
    adminUsername: string;
    maxParticipants?: number;
}
export declare class JoinRoomDto {
    roomId: string;
    userId: string;
    aiGeneration: number;
    username: string;
}
export declare class LeaveRoomDto {
    roomId: string;
    userId: string;
}
export declare class RaceSettingsDto {
    timeLimit: number;
}
export declare class RaceConfigurationDto {
    trackId: string;
    aiModelIds: string[];
    raceSettings: RaceSettingsDto;
}
export declare class ConfigureRaceDto {
    roomId: string;
    adminUsername: string;
    raceConfig: RaceConfigurationDto;
}
export declare class StartRaceDto {
    roomId: string;
    adminUsername: string;
}
export declare class GetRoomStatusDto {
    roomId: string;
}
export declare class PositionUpdateDto {
    roomId: string;
    positions: CarPositionDto[];
    timestamp: number;
}
export declare class PositionDto {
    x: number;
    y: number;
    z: number;
    rotation: number;
}
export declare class VelocityDto {
    x: number;
    y: number;
    speed: number;
}
export declare class CarPositionDto {
    carId: string;
    position: PositionDto;
    velocity: VelocityDto;
    lapProgress: number;
    currentLap: number;
    racePosition: number;
}
export declare class RaceEventDataDto {
    type: string;
    timestamp: number;
    carId?: string;
    data?: any;
}
export declare class RaceEventDto {
    roomId: string;
    event: RaceEventDataDto;
}
export declare class ParticipantResponseDto {
    userId: string;
    username: string;
    connectedAt: Date;
    socketId: string;
}
export declare class RoomResponseDto {
    id: string;
    adminId: string;
    participants: ParticipantResponseDto[];
    status: string;
    raceConfig?: RaceConfigurationDto;
    createdAt: Date;
    maxParticipants: number;
}
export declare class RoomCreatedResponseDto {
    room: RoomResponseDto;
    message: string;
}
export declare class RoomJoinedResponseDto {
    room: RoomResponseDto;
}
export declare class PlayerJoinedResponseDto {
    participant: ParticipantResponseDto;
    room: RoomResponseDto;
}
export declare class PlayerLeftResponseDto {
    userId: string;
    room: RoomResponseDto;
}
export declare class RoomClosedResponseDto {
    message: string;
}
export declare class RoomLeftResponseDto {
    message: string;
}
export declare class RaceConfiguredResponseDto {
    room: RoomResponseDto;
    config: RaceConfigurationDto;
}
export declare class RaceStartedResponseDto {
    room: RoomResponseDto;
    timestamp: number;
}
export declare class ValidationResponseDto {
    valid: boolean;
}
export declare class ErrorResponseDto {
    message: string;
    error?: string;
}
export declare class TrackMetadataResponseDto {
    length: number;
    width: number;
    checkpoints: number;
    description?: string;
}
export declare class TrackDataResponseDto {
    id: string;
    name: string;
    layout: TrackPointResponseDto[];
    metadata: TrackMetadataResponseDto;
}
export declare class RacePackageResponseDto {
    trackData: TrackDataResponseDto;
    aiModels: AIModelDataResponseDto[];
    raceConfig: RaceConfigurationDto;
}
export declare class TrackPointResponseDto {
    x: number;
    y: number;
    z: number;
    type: string;
}
export declare class AIArchitectureResponseDto {
    inputs: number;
    hiddenLayers: number[];
    outputs: number;
}
export declare class AIModelDataResponseDto {
    id: string;
    name: string;
    generation: number;
    weights: number[][];
    architecture: AIArchitectureResponseDto;
}
export declare class CloseRoomDto {
    roomId: string;
    adminUsername: string;
}
export declare class AdminStatsResponseDto {
    totalRooms: number;
    roomsByStatus: Record<string, number>;
    totalParticipants: number;
}
export declare class RemoveParticipantDto {
    roomId: string;
    userId: string;
    adminUsername: string;
}
