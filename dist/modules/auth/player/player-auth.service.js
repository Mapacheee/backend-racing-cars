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
exports.PlayerAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const player_service_1 = require("../../players/player.service");
const bcrypt = require("bcrypt");
let PlayerAuthService = class PlayerAuthService {
    jwtService;
    configService;
    playersService;
    constructor(jwtService, configService, playersService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.playersService = playersService;
    }
    generatePlayerToken(player) {
        const payload = {
            sub: player.id,
            username: player.username,
            aiGeneration: player.aiGeneration,
        };
        const jwtSecret = this.configService.get('JWT_SECRET');
        return this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: '24h',
        });
    }
    verifyPlayerToken(token) {
        try {
            const jwtSecret = this.configService.get('JWT_SECRET');
            const decoded = this.jwtService.verify(token, {
                secret: jwtSecret,
            });
            return {
                id: decoded.sub,
                username: decoded.username,
                aiGeneration: decoded.aiGeneration,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('expired')) {
                throw new common_1.UnauthorizedException('Token expirado');
            }
            if (errorMessage.includes('invalid') ||
                errorMessage.includes('malformed')) {
                throw new common_1.UnauthorizedException('Token inválido');
            }
            throw new common_1.UnauthorizedException('La verificación del token falló');
        }
    }
    async register(registerDto) {
        const { username, password } = registerDto;
        try {
            const existingPlayer = await this.playersService.findByUsername(username);
            if (existingPlayer) {
                throw new common_1.ConflictException('El usuario ya existe');
            }
            const newPlayer = await this.playersService.create({
                username,
                password,
            });
            const token = this.generatePlayerToken({
                id: newPlayer.id,
                username: newPlayer.username,
                aiGeneration: newPlayer.aiGeneration,
            });
            return {
                id: newPlayer.id,
                username: newPlayer.username,
                aiGeneration: newPlayer.aiGeneration,
                token,
            };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Error al crear el usuario');
        }
    }
    async login(loginDto) {
        const { username, password } = loginDto;
        try {
            const player = await this.playersService.findByUsername(username);
            if (!player) {
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            const isPasswordValid = await bcrypt.compare(password, player.password_hash);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('La contraseña es incorrecta');
            }
            const token = this.generatePlayerToken({
                id: player.id,
                username: player.username,
                aiGeneration: player.aiGeneration,
            });
            return {
                id: player.id,
                username: player.username,
                aiGeneration: player.aiGeneration,
                token,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Error de autenticación');
        }
    }
    refreshToken(token) {
        try {
            const decoded = this.verifyPlayerToken(token);
            const newToken = this.generatePlayerToken({
                id: decoded.id,
                username: decoded.username,
                aiGeneration: decoded.aiGeneration,
            });
            return {
                id: decoded.id,
                username: decoded.username,
                aiGeneration: decoded.aiGeneration,
                token: newToken,
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
    }
};
exports.PlayerAuthService = PlayerAuthService;
exports.PlayerAuthService = PlayerAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        player_service_1.PlayersService])
], PlayerAuthService);
//# sourceMappingURL=player-auth.service.js.map