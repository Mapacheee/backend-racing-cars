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
exports.RacesController = void 0;
const common_1 = require("@nestjs/common");
const races_service_1 = require("./races.service");
const create_race_dto_1 = require("./dto/create-race.dto");
const update_race_dto_1 = require("./dto/update-race.dto");
const add_participant_dto_1 = require("./dto/add-participant.dto");
const update_participant_dto_1 = require("./dto/update-participant.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let RacesController = class RacesController {
    racesService;
    constructor(racesService) {
        this.racesService = racesService;
    }
    create(createRaceDto) {
        return this.racesService.create(createRaceDto);
    }
    findAll() {
        return this.racesService.findAll();
    }
    findOne(id) {
        return this.racesService.findOne(id);
    }
    update(id, updateRaceDto) {
        return this.racesService.update(id, updateRaceDto);
    }
    remove(id) {
        return this.racesService.remove(id);
    }
    addParticipant(id, addParticipantDto) {
        return this.racesService.addParticipant(id, addParticipantDto);
    }
    updateParticipant(id, participantId, updateParticipantDto) {
        return this.racesService.updateParticipant(id, participantId, updateParticipantDto);
    }
    removeParticipant(id, participantId) {
        return this.racesService.removeParticipant(id, participantId);
    }
};
exports.RacesController = RacesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_race_dto_1.CreateRaceDto]),
    __metadata("design:returntype", void 0)
], RacesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RacesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RacesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_race_dto_1.UpdateRaceDto]),
    __metadata("design:returntype", void 0)
], RacesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RacesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/participants'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_participant_dto_1.AddParticipantDto]),
    __metadata("design:returntype", void 0)
], RacesController.prototype, "addParticipant", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/participants/:participantId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('participantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_participant_dto_1.UpdateParticipantDto]),
    __metadata("design:returntype", void 0)
], RacesController.prototype, "updateParticipant", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id/participants/:participantId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('participantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RacesController.prototype, "removeParticipant", null);
exports.RacesController = RacesController = __decorate([
    (0, common_1.Controller)('races'),
    __metadata("design:paramtypes", [races_service_1.RacesService])
], RacesController);
//# sourceMappingURL=races.controller.js.map