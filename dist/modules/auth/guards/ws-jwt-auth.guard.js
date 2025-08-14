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
exports.WsJwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const config_1 = require("@nestjs/config");
let WsJwtAuthGuard = class WsJwtAuthGuard {
    jwtService;
    configService;
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    canActivate(context) {
        try {
            const client = context.switchToWs().getClient();
            const token = this.extractTokenFromSocket(client);
            if (!token) {
                throw new websockets_1.WsException('Authentication token not provided');
            }
            const payload = this.validateToken(token);
            client.data.user = payload;
            return true;
        }
        catch (_error) {
            throw new websockets_1.WsException('Authentication failed');
        }
    }
    extractTokenFromSocket(client) {
        const authToken = client.handshake.auth?.token;
        if (authToken && typeof authToken === 'string') {
            return authToken;
        }
        const authHeader = client.handshake.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        const queryToken = client.handshake.query?.token;
        if (typeof queryToken === 'string') {
            return queryToken;
        }
        return null;
    }
    validateToken(token) {
        try {
            const jwtSecret = this.configService.get('JWT_SECRET');
            const payload = this.jwtService.verify(token, {
                secret: jwtSecret,
            });
            if (!payload.sub) {
                throw new websockets_1.WsException('Invalid token payload');
            }
            return {
                id: payload.sub,
                username: payload.username,
                aiGeneration: payload.aiGeneration,
            };
        }
        catch (_error) {
            throw new websockets_1.WsException('Invalid or expired token');
        }
    }
};
exports.WsJwtAuthGuard = WsJwtAuthGuard;
exports.WsJwtAuthGuard = WsJwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], WsJwtAuthGuard);
//# sourceMappingURL=ws-jwt-auth.guard.js.map