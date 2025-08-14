"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tracks_service_1 = require("./tracks.service");
const tracks_controller_1 = require("./tracks.controller");
const track_entity_1 = require("./entities/track.entity");
let TracksModule = class TracksModule {
};
exports.TracksModule = TracksModule;
exports.TracksModule = TracksModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([track_entity_1.Track])],
        controllers: [tracks_controller_1.TracksController],
        providers: [tracks_service_1.TracksService],
        exports: [tracks_service_1.TracksService],
    })
], TracksModule);
//# sourceMappingURL=tracks.module.js.map