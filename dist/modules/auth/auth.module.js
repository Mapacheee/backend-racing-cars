"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const admin_auth_controller_1 = require("./admin/admin-auth.controller");
const player_auth_controller_1 = require("./player/player-auth.controller");
const admin_auth_service_1 = require("./admin/admin-auth.service");
const player_auth_service_1 = require("./player/player-auth.service");
const player_module_1 = require("../players/player.module");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            player_module_1.PlayersModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRATION'),
                    },
                }),
            }),
        ],
        controllers: [admin_auth_controller_1.AdminAuthController, player_auth_controller_1.PlayerAuthController],
        providers: [admin_auth_service_1.AdminAuthService, player_auth_service_1.PlayerAuthService, jwt_strategy_1.JwtStrategy],
        exports: [admin_auth_service_1.AdminAuthService, player_auth_service_1.PlayerAuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map