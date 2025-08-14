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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerAuthController = void 0;
const common_1 = require("@nestjs/common");
const player_auth_service_1 = require("./player-auth.service");
const player_login_dto_1 = require("./dto/player-login.dto");
const player_register_dto_1 = require("./dto/player-register.dto");
let PlayerAuthController = class PlayerAuthController {
    playerAuthService;
    constructor(playerAuthService) {
        this.playerAuthService = playerAuthService;
    }
    async register(registerDto) {
        return this.playerAuthService.register(registerDto);
    }
    async login(loginDto) {
        return this.playerAuthService.login(loginDto);
    }
    refresh(body) {
        return this.playerAuthService.refreshToken(body.token);
    }
};
exports.PlayerAuthController = PlayerAuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [player_register_dto_1.PlayerRegisterDto]),
    __metadata("design:returntype", Promise)
], PlayerAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [player_login_dto_1.PlayerLoginDto]),
    __metadata("design:returntype", Promise)
], PlayerAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", player_login_dto_1.PlayerLoginResponseDto)
], PlayerAuthController.prototype, "refresh", null);
exports.PlayerAuthController = PlayerAuthController = __decorate([
    (0, common_1.Controller)('auth/player'),
    __metadata("design:paramtypes", [player_auth_service_1.PlayerAuthService])
], PlayerAuthController);
//# sourceMappingURL=player-auth.controller.js.map