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
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const statistics_service_1 = require("./statistics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const race_statistics_dto_1 = require("./dto/race-statistics.dto");
let StatisticsController = class StatisticsController {
    statisticsService;
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    getPlayerStatistics({ user: player }) {
        return this.statisticsService.getPlayerStatistics(player.id);
    }
    getAiModelStatistics(id) {
        return this.statisticsService.getAIModelStats(id);
    }
    getTrackLeaderboard(id) {
        return this.statisticsService.getTrackLeaderboard(id);
    }
    createRaceStatistics(createRaceStatisticsDto) {
        return this.statisticsService.create(createRaceStatisticsDto);
    }
    getRaceStatistics(filters) {
        return this.statisticsService.findAll(filters);
    }
    getAIModelPerformance(id) {
        return this.statisticsService.getAIModelStats(id);
    }
};
exports.StatisticsController = StatisticsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('player'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getPlayerStatistics", null);
__decorate([
    (0, common_1.Get)('ai-model/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getAiModelStatistics", null);
__decorate([
    (0, common_1.Get)('track/:id/leaderboard'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getTrackLeaderboard", null);
__decorate([
    (0, common_1.Post)('race'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [race_statistics_dto_1.CreateRaceStatisticsDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "createRaceStatistics", null);
__decorate([
    (0, common_1.Get)('races'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [race_statistics_dto_1.RaceStatisticsFilterDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getRaceStatistics", null);
__decorate([
    (0, common_1.Get)('ai-model/:id/performance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getAIModelPerformance", null);
exports.StatisticsController = StatisticsController = __decorate([
    (0, common_1.Controller)('statistics'),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=statistics.controller.js.map