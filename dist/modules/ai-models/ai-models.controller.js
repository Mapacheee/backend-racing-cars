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
exports.AiModelsController = void 0;
const common_1 = require("@nestjs/common");
const ai_models_service_1 = require("./ai-models.service");
const create_ai_model_dto_1 = require("./dto/create-ai-model.dto");
const update_ai_model_dto_1 = require("./dto/update-ai-model.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const ai_model_dto_1 = require("./dto/ai-model.dto");
let AiModelsController = class AiModelsController {
    aiModelsService;
    constructor(aiModelsService) {
        this.aiModelsService = aiModelsService;
    }
    create({ player }, createAiModelDto) {
        return this.aiModelsService.create(player.id, createAiModelDto);
    }
    findAll({ player }, filters) {
        filters.userId = player.id;
        return this.aiModelsService.findAll(filters);
    }
    findOne(id, { player }) {
        return this.aiModelsService.findOne(id, player.id);
    }
    getEvolutionHistory(id, { player }) {
        return this.aiModelsService.getEvolutionHistory(id, player.id);
    }
    evolve(id, { player }, body) {
        return this.aiModelsService.evolve([id, ...body.parentIds], player.id);
    }
    update(id, { player }, updateAiModelDto) {
        return this.aiModelsService.update(id, player.id, updateAiModelDto);
    }
    remove(id, { player }) {
        return this.aiModelsService.remove(id, player.id);
    }
};
exports.AiModelsController = AiModelsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_ai_model_dto_1.CreateAiModelDto]),
    __metadata("design:returntype", void 0)
], AiModelsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_model_dto_1.AIModelFilterDto]),
    __metadata("design:returntype", void 0)
], AiModelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiModelsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/evolution-history'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiModelsController.prototype, "getEvolutionHistory", null);
__decorate([
    (0, common_1.Post)(':id/evolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AiModelsController.prototype, "evolve", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_ai_model_dto_1.UpdateAiModelDto]),
    __metadata("design:returntype", void 0)
], AiModelsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AiModelsController.prototype, "remove", null);
exports.AiModelsController = AiModelsController = __decorate([
    (0, common_1.Controller)('ai-models'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_models_service_1.AiModelsService])
], AiModelsController);
//# sourceMappingURL=ai-models.controller.js.map