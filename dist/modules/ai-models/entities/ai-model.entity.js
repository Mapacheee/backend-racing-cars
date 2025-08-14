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
exports.AIModel = void 0;
const typeorm_1 = require("typeorm");
const player_entity_1 = require("../../players/entities/player.entity");
let AIModel = class AIModel {
    id;
    name;
    description;
    version;
    modelData;
    configuration;
    generationNumber;
    trainingMetrics;
    genetics;
    lastTrainingDate;
    isActive;
    createdAt;
    updatedAt;
    player;
    playerId;
};
exports.AIModel = AIModel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AIModel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AIModel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AIModel.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AIModel.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], AIModel.prototype, "modelData", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], AIModel.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 1 }),
    __metadata("design:type", Number)
], AIModel.prototype, "generationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], AIModel.prototype, "trainingMetrics", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], AIModel.prototype, "genetics", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], AIModel.prototype, "lastTrainingDate", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], AIModel.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AIModel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AIModel.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => player_entity_1.Player, (user) => user.aiModels),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", player_entity_1.Player)
], AIModel.prototype, "player", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AIModel.prototype, "playerId", void 0);
exports.AIModel = AIModel = __decorate([
    (0, typeorm_1.Entity)('ai_models')
], AIModel);
//# sourceMappingURL=ai-model.entity.js.map