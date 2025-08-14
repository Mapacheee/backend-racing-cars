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
exports.Player = void 0;
const typeorm_1 = require("typeorm");
const ai_model_entity_1 = require("../../ai-models/entities/ai-model.entity");
const class_transformer_1 = require("class-transformer");
let Player = class Player {
    id;
    username;
    password_hash;
    aiGeneration;
    createdAt;
    updatedAt;
    aiModels;
};
exports.Player = Player;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Player.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Player.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], Player.prototype, "password_hash", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 1 }),
    __metadata("design:type", Number)
], Player.prototype, "aiGeneration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Player.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Player.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ai_model_entity_1.AIModel, (aiModel) => aiModel.player),
    __metadata("design:type", Array)
], Player.prototype, "aiModels", void 0);
exports.Player = Player = __decorate([
    (0, typeorm_1.Entity)('players')
], Player);
//# sourceMappingURL=player.entity.js.map