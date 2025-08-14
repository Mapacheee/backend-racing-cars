"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const player_service_1 = require("./player.service");
const player_controller_1 = require("./player.controller");
const player_entity_1 = require("./entities/player.entity");
const ai_model_entity_1 = require("../ai-models/entities/ai-model.entity");
let PlayersModule = class PlayersModule {
};
exports.PlayersModule = PlayersModule;
exports.PlayersModule = PlayersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([player_entity_1.Player, ai_model_entity_1.AIModel])],
        controllers: [player_controller_1.PlayersController],
        providers: [player_service_1.PlayersService],
        exports: [player_service_1.PlayersService],
    })
], PlayersModule);
//# sourceMappingURL=player.module.js.map