"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const player_module_1 = require("./modules/players/player.module");
const auth_module_1 = require("./modules/auth/auth.module");
const ai_models_module_1 = require("./modules/ai-models/ai-models.module");
const tracks_module_1 = require("./modules/tracks/tracks.module");
const races_module_1 = require("./modules/races/races.module");
const statistics_module_1 = require("./modules/statistics/statistics.module");
const database_config_1 = require("./config/database.config");
const racing_stream_module_1 = require("./modules/racing-stream/racing-stream.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: database_config_1.getDatabaseConfig,
            }),
            player_module_1.PlayersModule,
            auth_module_1.AuthModule,
            ai_models_module_1.AiModelsModule,
            tracks_module_1.TracksModule,
            races_module_1.RacesModule,
            statistics_module_1.StatisticsModule,
            racing_stream_module_1.RacingModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map