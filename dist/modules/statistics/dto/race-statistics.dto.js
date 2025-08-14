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
exports.RaceStatisticsFilterDto = exports.CreateRaceStatisticsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ParticipantDto {
    aiModelId;
    position;
    finishTime;
    distanceCompleted;
    lapTimes;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ParticipantDto.prototype, "aiModelId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ParticipantDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ParticipantDto.prototype, "finishTime", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ParticipantDto.prototype, "distanceCompleted", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.Min)(0, { each: true }),
    __metadata("design:type", Array)
], ParticipantDto.prototype, "lapTimes", void 0);
class TrackInfoDto {
    trackId;
    trackName;
    numberOfLaps;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TrackInfoDto.prototype, "trackId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackInfoDto.prototype, "trackName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrackInfoDto.prototype, "numberOfLaps", void 0);
class RaceConditionsDto {
    weather;
    difficulty;
    numberOfParticipants;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RaceConditionsDto.prototype, "weather", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RaceConditionsDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RaceConditionsDto.prototype, "numberOfParticipants", void 0);
class RaceMetricsDto {
    averageSpeed;
    bestLapTime;
    totalRaceTime;
    collisions;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RaceMetricsDto.prototype, "averageSpeed", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RaceMetricsDto.prototype, "bestLapTime", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RaceMetricsDto.prototype, "totalRaceTime", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RaceMetricsDto.prototype, "collisions", void 0);
class CreateRaceStatisticsDto {
    participants;
    trackInfo;
    raceConditions;
    raceMetrics;
}
exports.CreateRaceStatisticsDto = CreateRaceStatisticsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ParticipantDto),
    __metadata("design:type", Array)
], CreateRaceStatisticsDto.prototype, "participants", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TrackInfoDto),
    __metadata("design:type", TrackInfoDto)
], CreateRaceStatisticsDto.prototype, "trackInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RaceConditionsDto),
    __metadata("design:type", RaceConditionsDto)
], CreateRaceStatisticsDto.prototype, "raceConditions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RaceMetricsDto),
    __metadata("design:type", RaceMetricsDto)
], CreateRaceStatisticsDto.prototype, "raceMetrics", void 0);
class RaceStatisticsFilterDto {
    trackId;
    aiModelId;
    dateFrom;
    dateTo;
    difficulty;
}
exports.RaceStatisticsFilterDto = RaceStatisticsFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RaceStatisticsFilterDto.prototype, "trackId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RaceStatisticsFilterDto.prototype, "aiModelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RaceStatisticsFilterDto.prototype, "dateFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RaceStatisticsFilterDto.prototype, "dateTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['easy', 'medium', 'hard']),
    __metadata("design:type", String)
], RaceStatisticsFilterDto.prototype, "difficulty", void 0);
//# sourceMappingURL=race-statistics.dto.js.map