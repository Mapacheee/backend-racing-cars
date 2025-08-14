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
exports.Race = exports.RaceStatus = void 0;
const typeorm_1 = require("typeorm");
const track_entity_1 = require("../../tracks/entities/track.entity");
const race_participant_entity_1 = require("./race-participant.entity");
var RaceStatus;
(function (RaceStatus) {
    RaceStatus["PENDING"] = "pending";
    RaceStatus["IN_PROGRESS"] = "in_progress";
    RaceStatus["COMPLETED"] = "completed";
    RaceStatus["CANCELLED"] = "cancelled";
})(RaceStatus || (exports.RaceStatus = RaceStatus = {}));
let Race = class Race {
    id;
    name;
    track;
    trackId;
    configuration;
    status;
    startTime;
    endTime;
    participants;
    createdAt;
};
exports.Race = Race;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Race.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Race.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => track_entity_1.Track),
    (0, typeorm_1.JoinColumn)({ name: 'trackId' }),
    __metadata("design:type", track_entity_1.Track)
], Race.prototype, "track", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Race.prototype, "trackId", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], Race.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        enum: RaceStatus,
        default: RaceStatus.PENDING,
    }),
    __metadata("design:type", String)
], Race.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Race.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Race.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => race_participant_entity_1.RaceParticipant, (participant) => participant.race),
    __metadata("design:type", Array)
], Race.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Race.prototype, "createdAt", void 0);
exports.Race = Race = __decorate([
    (0, typeorm_1.Entity)('races')
], Race);
//# sourceMappingURL=race.entity.js.map