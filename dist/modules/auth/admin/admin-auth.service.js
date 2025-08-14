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
exports.AdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const node_crypto_1 = require("node:crypto");
let AdminAuthService = class AdminAuthService {
    jwtService;
    configService;
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    generateAdminToken(admin) {
        const payload = {
            sub: admin.username,
            iat: Math.floor(Date.now() / 1000),
            jti: (0, node_crypto_1.randomUUID)(),
        };
        const jwtSecret = this.configService.get('JWT_SECRET');
        return this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: '24h',
        });
    }
    verifyAdminToken(token) {
        try {
            const jwtSecret = this.configService.get('JWT_SECRET');
            const decoded = this.jwtService.verify(token, {
                secret: jwtSecret,
            });
            if ('aiGeneration' in decoded) {
                throw new common_1.UnauthorizedException('Invalid token for admin');
            }
            return {
                username: decoded.sub,
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
    login(loginDto) {
        const { username, password } = loginDto;
        const adminUsername = this.configService.get('ADMIN_USERNAME');
        const adminPassword = this.configService.get('ADMIN_PASSWORD');
        if (username !== adminUsername || password !== adminPassword) {
            throw new common_1.UnauthorizedException('Credenciales de administrador inválidas');
        }
        const admin = { username: adminUsername };
        const token = this.generateAdminToken({ username: admin.username });
        return {
            username: admin.username,
            token,
        };
    }
    refreshToken(token) {
        try {
            const decoded = this.verifyAdminToken(token);
            const newToken = this.generateAdminToken({ username: decoded.username });
            return {
                username: decoded.username,
                token: newToken,
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AdminAuthService);
//# sourceMappingURL=admin-auth.service.js.map