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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RacingController = void 0;
const common_1 = require("@nestjs/common");
const race_package_service_1 = require("./services/race-package.service");
const room_service_1 = require("./services/room.service");
const racing_stream_dto_1 = require("./dto/racing-stream.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let RacingController = class RacingController {
    racePackageService;
    roomService;
    constructor(racePackageService, roomService) {
        this.racePackageService = racePackageService;
        this.roomService = roomService;
    }
    createRoom(createRoomDto) {
        const room = this.roomService.createRoom(createRoomDto.adminUsername, createRoomDto.maxParticipants);
        return this.mapRoomToDto(room);
    }
    closeRoom(roomId, closeRoomDto) {
        const success = this.roomService.closeRoom(roomId, closeRoomDto.adminUsername);
        return { success };
    }
    getAdminStats() {
        return this.roomService.getAdminStats();
    }
    getAvailableRooms() {
        const rooms = this.roomService.getAvailableRooms();
        return rooms.map((room) => this.mapRoomToDto(room));
    }
    async getRacePackage(raceConfig) {
        const racePackage = await this.racePackageService.buildRacePackage(raceConfig);
        return this.mapRacePackageToDto(racePackage);
    }
    async validateRaceConfiguration(raceConfig) {
        const valid = await this.racePackageService.validateRaceConfiguration(raceConfig);
        return { valid };
    }
    getAllRooms() {
        const rooms = this.roomService.getAllRooms();
        return rooms.map((room) => this.mapRoomToDto(room));
    }
    getRoom(id) {
        const room = this.roomService.getRoom(id);
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        return this.mapRoomToDto(room);
    }
    mapRacePackageToDto(racePackage) {
        return {
            trackData: {
                id: racePackage.trackData.id,
                name: racePackage.trackData.name,
                layout: racePackage.trackData.layout.map((point) => ({
                    x: point.x,
                    y: point.y,
                    z: point.z,
                    type: point.type,
                })),
                metadata: {
                    length: racePackage.trackData.metadata.length,
                    width: racePackage.trackData.metadata.width,
                    checkpoints: racePackage.trackData.metadata.checkpoints,
                    description: racePackage.trackData.metadata.description,
                },
            },
            aiModels: racePackage.aiModels.map((model) => ({
                id: model.id,
                name: model.name,
                generation: model.generation,
                weights: model.weights,
                architecture: {
                    inputs: model.architecture.inputs,
                    hiddenLayers: model.architecture.hiddenLayers,
                    outputs: model.architecture.outputs,
                },
            })),
            raceConfig: {
                trackId: racePackage.raceConfig.trackId,
                aiModelIds: racePackage.raceConfig.aiModelIds,
                raceSettings: {
                    timeLimit: racePackage.raceConfig.raceSettings.timeLimit,
                },
            },
        };
    }
    mapRoomToDto(room) {
        return {
            id: room.id,
            adminId: room.adminId,
            participants: room.participants.map((participant) => ({
                userId: participant.userId,
                username: participant.username,
                connectedAt: participant.connectedAt,
                socketId: participant.socketId,
            })),
            status: room.status.toString(),
            raceConfig: room.raceConfig
                ? {
                    trackId: room.raceConfig.trackId,
                    aiModelIds: room.raceConfig.aiModelIds,
                    raceSettings: {
                        timeLimit: room.raceConfig.raceSettings.timeLimit,
                    },
                }
                : undefined,
            createdAt: room.createdAt,
            maxParticipants: room.maxParticipants,
        };
    }
};
exports.RacingController = RacingController;
__decorate([
    (0, common_1.Post)('admin/room'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.CreateRoomDto]),
    __metadata("design:returntype", racing_stream_dto_1.RoomResponseDto)
], RacingController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Post)('admin/room/:id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, racing_stream_dto_1.CloseRoomDto]),
    __metadata("design:returntype", Object)
], RacingController.prototype, "closeRoom", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", racing_stream_dto_1.AdminStatsResponseDto)
], RacingController.prototype, "getAdminStats", null);
__decorate([
    (0, common_1.Get)('rooms/available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], RacingController.prototype, "getAvailableRooms", null);
__decorate([
    (0, common_1.Post)('package'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.RaceConfigurationDto]),
    __metadata("design:returntype", Promise)
], RacingController.prototype, "getRacePackage", null);
__decorate([
    (0, common_1.Post)('package/validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [racing_stream_dto_1.RaceConfigurationDto]),
    __metadata("design:returntype", Promise)
], RacingController.prototype, "validateRaceConfiguration", null);
__decorate([
    (0, common_1.Get)('rooms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], RacingController.prototype, "getAllRooms", null);
__decorate([
    (0, common_1.Get)('rooms/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", racing_stream_dto_1.RoomResponseDto)
], RacingController.prototype, "getRoom", null);
exports.RacingController = RacingController = __decorate([
    (0, common_1.Controller)('racing-stream'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [race_package_service_1.RacePackageService,
        room_service_1.RoomService])
], RacingController);
//# sourceMappingURL=racing-stream.controller.js.map