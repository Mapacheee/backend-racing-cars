"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveParticipantDto = exports.AdminStatsResponseDto = exports.CloseRoomDto = exports.AIModelDataResponseDto = exports.AIArchitectureResponseDto = exports.TrackPointResponseDto = exports.RacePackageResponseDto = exports.TrackDataResponseDto = exports.TrackMetadataResponseDto = exports.ErrorResponseDto = exports.ValidationResponseDto = exports.RaceStartedResponseDto = exports.RaceConfiguredResponseDto = exports.RoomLeftResponseDto = exports.RoomClosedResponseDto = exports.PlayerLeftResponseDto = exports.PlayerJoinedResponseDto = exports.RoomJoinedResponseDto = exports.RoomCreatedResponseDto = exports.RoomResponseDto = exports.ParticipantResponseDto = exports.RaceEventDto = exports.RaceEventDataDto = exports.CarPositionDto = exports.VelocityDto = exports.PositionDto = exports.PositionUpdateDto = exports.GetRoomStatusDto = exports.StartRaceDto = exports.ConfigureRaceDto = exports.RaceConfigurationDto = exports.RaceSettingsDto = exports.LeaveRoomDto = exports.JoinRoomDto = exports.CreateRoomDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateRoomDto {
    adminUsername;
    maxParticipants = 30;
}
exports.CreateRoomDto = CreateRoomDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoomDto.prototype, "adminUsername", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRoomDto.prototype, "maxParticipants", void 0);
class JoinRoomDto {
    roomId;
    userId;
    aiGeneration;
    username;
}
exports.JoinRoomDto = JoinRoomDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JoinRoomDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JoinRoomDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JoinRoomDto.prototype, "aiGeneration", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JoinRoomDto.prototype, "username", void 0);
class LeaveRoomDto {
    roomId;
    userId;
}
exports.LeaveRoomDto = LeaveRoomDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeaveRoomDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeaveRoomDto.prototype, "userId", void 0);
class RaceSettingsDto {
    timeLimit;
}
exports.RaceSettingsDto = RaceSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RaceSettingsDto.prototype, "timeLimit", void 0);
class RaceConfigurationDto {
    trackId;
    aiModelIds;
    raceSettings;
}
exports.RaceConfigurationDto = RaceConfigurationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RaceConfigurationDto.prototype, "trackId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RaceConfigurationDto.prototype, "aiModelIds", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RaceSettingsDto),
    __metadata("design:type", RaceSettingsDto)
], RaceConfigurationDto.prototype, "raceSettings", void 0);
class ConfigureRaceDto {
    roomId;
    adminUsername;
    raceConfig;
}
exports.ConfigureRaceDto = ConfigureRaceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureRaceDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureRaceDto.prototype, "adminUsername", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RaceConfigurationDto),
    __metadata("design:type", RaceConfigurationDto)
], ConfigureRaceDto.prototype, "raceConfig", void 0);
class StartRaceDto {
    roomId;
    adminUsername;
}
exports.StartRaceDto = StartRaceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartRaceDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartRaceDto.prototype, "adminUsername", void 0);
class GetRoomStatusDto {
    roomId;
}
exports.GetRoomStatusDto = GetRoomStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetRoomStatusDto.prototype, "roomId", void 0);
class PositionUpdateDto {
    roomId;
    positions;
    timestamp;
}
exports.PositionUpdateDto = PositionUpdateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PositionUpdateDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CarPositionDto),
    __metadata("design:type", Array)
], PositionUpdateDto.prototype, "positions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PositionUpdateDto.prototype, "timestamp", void 0);
class PositionDto {
    x;
    y;
    z;
    rotation;
}
exports.PositionDto = PositionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PositionDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PositionDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PositionDto.prototype, "z", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PositionDto.prototype, "rotation", void 0);
class VelocityDto {
    x;
    y;
    speed;
}
exports.VelocityDto = VelocityDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VelocityDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VelocityDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VelocityDto.prototype, "speed", void 0);
class CarPositionDto {
    carId;
    position;
    velocity;
    lapProgress;
    currentLap;
    racePosition;
}
exports.CarPositionDto = CarPositionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CarPositionDto.prototype, "carId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PositionDto),
    __metadata("design:type", PositionDto)
], CarPositionDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VelocityDto),
    __metadata("design:type", VelocityDto)
], CarPositionDto.prototype, "velocity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CarPositionDto.prototype, "lapProgress", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CarPositionDto.prototype, "currentLap", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CarPositionDto.prototype, "racePosition", void 0);
class RaceEventDataDto {
    type;
    timestamp;
    carId;
    data;
}
exports.RaceEventDataDto = RaceEventDataDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RaceEventDataDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RaceEventDataDto.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RaceEventDataDto.prototype, "carId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RaceEventDataDto.prototype, "data", void 0);
class RaceEventDto {
    roomId;
    event;
}
exports.RaceEventDto = RaceEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RaceEventDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RaceEventDataDto),
    __metadata("design:type", RaceEventDataDto)
], RaceEventDto.prototype, "event", void 0);
class ParticipantResponseDto {
    userId;
    username;
    connectedAt;
    socketId;
}
exports.ParticipantResponseDto = ParticipantResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParticipantResponseDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParticipantResponseDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], ParticipantResponseDto.prototype, "connectedAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParticipantResponseDto.prototype, "socketId", void 0);
class RoomResponseDto {
    id;
    adminId;
    participants;
    status;
    raceConfig;
    createdAt;
    maxParticipants;
}
exports.RoomResponseDto = RoomResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "adminId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ParticipantResponseDto),
    __metadata("design:type", Array)
], RoomResponseDto.prototype, "participants", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['waiting', 'preparing', 'racing', 'paused', 'finished', 'closed']),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RaceConfigurationDto),
    __metadata("design:type", RaceConfigurationDto)
], RoomResponseDto.prototype, "raceConfig", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], RoomResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RoomResponseDto.prototype, "maxParticipants", void 0);
class RoomCreatedResponseDto {
    room;
    message;
}
exports.RoomCreatedResponseDto = RoomCreatedResponseDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RoomResponseDto),
    __metadata("design:type", RoomResponseDto)
], RoomCreatedResponseDto.prototype, "room", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoomCreatedResponseDto.prototype, "message", void 0);
class RoomJoinedResponseDto {
    room;
}
exports.RoomJoinedResponseDto = RoomJoinedResponseDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RoomResponseDto),
    __metadata("design:type", RoomResponseDto)
], RoomJoinedResponseDto.prototype, "room", void 0);
class PlayerJoinedResponseDto {
    participant;
    room;
}
exports.PlayerJoinedResponseDto = PlayerJoinedResponseDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ParticipantResponseDto),
    __metadata("design:type", ParticipantResponseDto)
], PlayerJoinedResponseDto.prototype, "participant", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RoomResponseDto),
    __metadata("design:type", RoomResponseDto)
], PlayerJoinedResponseDto.prototype, "room", void 0);
class PlayerLeftResponseDto {
    userId;
    room;
}
exports.PlayerLeftResponseDto = PlayerLeftResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlayerLeftResponseDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RoomResponseDto),
    __metadata("design:type", RoomResponseDto)
], PlayerLeftResponseDto.prototype, "room", void 0);
class RoomClosedResponseDto {
    message;
}
exports.RoomClosedResponseDto = RoomClosedResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoomClosedResponseDto.prototype, "message", void 0);
class RoomLeftResponseDto {
    message;
}
exports.RoomLeftResponseDto = RoomLeftResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RoomLeftResponseDto.prototype, "message", void 0);
class RaceConfiguredResponseDto {
    room;
    config;
}
exports.RaceConfiguredResponseDto = RaceConfiguredResponseDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RoomResponseDto),
    __metadata("design:type", RoomResponseDto)
], RaceConfiguredResponseDto.prototype, "room", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RaceConfigurationDto),
    __metadata("design:type", RaceConfigurationDto)
], RaceConfiguredResponseDto.prototype, "config", void 0);
class RaceStartedResponseDto {
    room;
    timestamp;
}
exports.RaceStartedResponseDto = RaceStartedResponseDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RoomResponseDto),
    __metadata("design:type", RoomResponseDto)
], RaceStartedResponseDto.prototype, "room", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RaceStartedResponseDto.prototype, "timestamp", void 0);
class ValidationResponseDto {
    valid;
}
exports.ValidationResponseDto = ValidationResponseDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ValidationResponseDto.prototype, "valid", void 0);
class ErrorResponseDto {
    message;
    error;
}
exports.ErrorResponseDto = ErrorResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "error", void 0);
class TrackMetadataResponseDto {
    length;
    width;
    checkpoints;
    description;
}
exports.TrackMetadataResponseDto = TrackMetadataResponseDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrackMetadataResponseDto.prototype, "length", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrackMetadataResponseDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrackMetadataResponseDto.prototype, "checkpoints", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackMetadataResponseDto.prototype, "description", void 0);
class TrackDataResponseDto {
    id;
    name;
    layout;
    metadata;
}
exports.TrackDataResponseDto = TrackDataResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackDataResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackDataResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TrackPointResponseDto),
    __metadata("design:type", Array)
], TrackDataResponseDto.prototype, "layout", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TrackMetadataResponseDto),
    __metadata("design:type", TrackMetadataResponseDto)
], TrackDataResponseDto.prototype, "metadata", void 0);
class RacePackageResponseDto {
    trackData;
    aiModels;
    raceConfig;
}
exports.RacePackageResponseDto = RacePackageResponseDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TrackDataResponseDto),
    __metadata("design:type", TrackDataResponseDto)
], RacePackageResponseDto.prototype, "trackData", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AIModelDataResponseDto),
    __metadata("design:type", Array)
], RacePackageResponseDto.prototype, "aiModels", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RaceConfigurationDto),
    __metadata("design:type", RaceConfigurationDto)
], RacePackageResponseDto.prototype, "raceConfig", void 0);
class TrackPointResponseDto {
    x;
    y;
    z;
    type;
}
exports.TrackPointResponseDto = TrackPointResponseDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrackPointResponseDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrackPointResponseDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrackPointResponseDto.prototype, "z", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['track', 'checkpoint', 'start', 'finish']),
    __metadata("design:type", String)
], TrackPointResponseDto.prototype, "type", void 0);
class AIArchitectureResponseDto {
    inputs;
    hiddenLayers;
    outputs;
}
exports.AIArchitectureResponseDto = AIArchitectureResponseDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AIArchitectureResponseDto.prototype, "inputs", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], AIArchitectureResponseDto.prototype, "hiddenLayers", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AIArchitectureResponseDto.prototype, "outputs", void 0);
class AIModelDataResponseDto {
    id;
    name;
    generation;
    weights;
    architecture;
}
exports.AIModelDataResponseDto = AIModelDataResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIModelDataResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIModelDataResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AIModelDataResponseDto.prototype, "generation", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AIModelDataResponseDto.prototype, "weights", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AIArchitectureResponseDto),
    __metadata("design:type", AIArchitectureResponseDto)
], AIModelDataResponseDto.prototype, "architecture", void 0);
class CloseRoomDto {
    roomId;
    adminUsername;
}
exports.CloseRoomDto = CloseRoomDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CloseRoomDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CloseRoomDto.prototype, "adminUsername", void 0);
class AdminStatsResponseDto {
    totalRooms;
    roomsByStatus;
    totalParticipants;
}
exports.AdminStatsResponseDto = AdminStatsResponseDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminStatsResponseDto.prototype, "totalRooms", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Object)
], AdminStatsResponseDto.prototype, "roomsByStatus", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminStatsResponseDto.prototype, "totalParticipants", void 0);
class RemoveParticipantDto {
    roomId;
    userId;
    adminUsername;
}
exports.RemoveParticipantDto = RemoveParticipantDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RemoveParticipantDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RemoveParticipantDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RemoveParticipantDto.prototype, "adminUsername", void 0);
//# sourceMappingURL=racing-stream.dto.js.map