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
exports.PlayersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const player_entity_1 = require("./entities/player.entity");
const ai_model_entity_1 = require("../ai-models/entities/ai-model.entity");
const bcrypt = require("bcrypt");
let PlayersService = class PlayersService {
    playersRepository;
    aiModelsRepository;
    constructor(playersRepository, aiModelsRepository) {
        this.playersRepository = playersRepository;
        this.aiModelsRepository = aiModelsRepository;
    }
    async syncAiGeneration(playerId) {
        const aiModelCount = await this.aiModelsRepository.count({
            where: { playerId },
        });
        const player = await this.playersRepository.findOne({
            where: { id: playerId },
        });
        if (!player) {
            throw new common_1.NotFoundException(`Jugador con ID ${playerId} no encontrado`);
        }
        player.aiGeneration = aiModelCount;
        return this.playersRepository.save(player);
    }
    async updateAiGeneration(playerId, newGeneration) {
        if (newGeneration < 0) {
            throw new common_1.BadRequestException('aiGeneration cannot be negative');
        }
        const player = await this.playersRepository.findOne({
            where: { id: playerId },
        });
        if (!player) {
            throw new common_1.NotFoundException(`Jugador con ID ${playerId} no encontrado`);
        }
        player.aiGeneration = newGeneration;
        return this.playersRepository.save(player);
    }
    async create(createUserDto) {
        const { username, password } = createUserDto;
        const existingPlayer = await this.playersRepository.findOne({
            where: { username },
        });
        if (existingPlayer) {
            throw new common_1.ConflictException('Un usuario con ese nombre de usuario ya existe');
        }
        const password_hash = await bcrypt.hash(password, 10);
        const player = this.playersRepository.create({
            username,
            password_hash,
        });
        return this.playersRepository.save(player);
    }
    async findAll() {
        return this.playersRepository.find();
    }
    async findOne(username) {
        const user = await this.playersRepository.findOneBy({ username });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con nombre ${username} no encontrado`);
        }
        return user;
    }
    async findByUsername(username) {
        return this.playersRepository.findOneBy({ username });
    }
    async update(username, updateUserDto) {
        const user = await this.findOne(username);
        if (updateUserDto.password) {
            const password_hash = await bcrypt.hash(updateUserDto.password, 10);
            const { password: _, aiGeneration, ...otherFields } = updateUserDto;
            Object.assign(user, { ...otherFields, password_hash });
            if (aiGeneration !== undefined) {
                if (aiGeneration < 0) {
                    throw new common_1.BadRequestException('aiGeneration cannot be negative');
                }
                user.aiGeneration = aiGeneration;
            }
        }
        else {
            if (updateUserDto.aiGeneration !== undefined &&
                updateUserDto.aiGeneration < 0) {
                throw new common_1.BadRequestException('aiGeneration cannot be negative');
            }
            Object.assign(user, updateUserDto);
        }
        return this.playersRepository.save(user);
    }
    async remove(username) {
        const result = await this.playersRepository.delete({ username });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Usuario con nombre ${username} no encontrado`);
        }
    }
};
exports.PlayersService = PlayersService;
exports.PlayersService = PlayersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(player_entity_1.Player)),
    __param(1, (0, typeorm_1.InjectRepository)(ai_model_entity_1.AIModel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PlayersService);
//# sourceMappingURL=player.service.js.map