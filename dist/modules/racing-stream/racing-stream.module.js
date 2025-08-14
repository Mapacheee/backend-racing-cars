"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RacingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const racing_stream_controller_1 = require("./racing-stream.controller");
const racing_stream_gateway_1 = require("./racing-stream.gateway");
const room_service_1 = require("./services/room.service");
const race_package_service_1 = require("./services/race-package.service");
const ws_jwt_auth_guard_1 = require("../auth/guards/ws-jwt-auth.guard");
const track_entity_1 = require("../tracks/entities/track.entity");
const ai_model_entity_1 = require("../ai-models/entities/ai-model.entity");
let RacingModule = class RacingModule {
};
exports.RacingModule = RacingModule;
exports.RacingModule = RacingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([track_entity_1.Track, ai_model_entity_1.AIModel]),
            config_1.ConfigModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: process.env.JWT_EXPIRATION },
            }),
        ],
        controllers: [racing_stream_controller_1.RacingController],
        providers: [racing_stream_gateway_1.RaceGateway, room_service_1.RoomService, race_package_service_1.RacePackageService, ws_jwt_auth_guard_1.WsJwtAuthGuard],
        exports: [room_service_1.RoomService, race_package_service_1.RacePackageService],
    })
], RacingModule);
//# sourceMappingURL=racing-stream.module.js.map