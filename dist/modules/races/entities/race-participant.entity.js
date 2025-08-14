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
exports.RaceParticipant = void 0;
const typeorm_1 = require("typeorm");
const race_entity_1 = require("./race.entity");
const ai_model_entity_1 = require("../../ai-models/entities/ai-model.entity");
let RaceParticipant = class RaceParticipant {
    id;
    race;
    raceId;
    aiModel;
    aiModelId;
    position;
    finishingTime;
    performanceMetrics;
    createdAt;
};
exports.RaceParticipant = RaceParticipant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RaceParticipant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => race_entity_1.Race, (race) => race.participants),
    (0, typeorm_1.JoinColumn)({ name: 'raceId' }),
    __metadata("design:type", race_entity_1.Race)
], RaceParticipant.prototype, "race", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RaceParticipant.prototype, "raceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ai_model_entity_1.AIModel),
    (0, typeorm_1.JoinColumn)({ name: 'aiModelId' }),
    __metadata("design:type", ai_model_entity_1.AIModel)
], RaceParticipant.prototype, "aiModel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RaceParticipant.prototype, "aiModelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RaceParticipant.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], RaceParticipant.prototype, "finishingTime", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], RaceParticipant.prototype, "performanceMetrics", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RaceParticipant.prototype, "createdAt", void 0);
exports.RaceParticipant = RaceParticipant = __decorate([
    (0, typeorm_1.Entity)('race_participants')
], RaceParticipant);
//# sourceMappingURL=race-participant.entity.js.map