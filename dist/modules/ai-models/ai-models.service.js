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
exports.AiModelsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_model_entity_1 = require("./entities/ai-model.entity");
const player_entity_1 = require("../players/entities/player.entity");
let AiModelsService = class AiModelsService {
    aiModelsRepository;
    playersRepository;
    constructor(aiModelsRepository, playersRepository) {
        this.aiModelsRepository = aiModelsRepository;
        this.playersRepository = playersRepository;
    }
    async updatePlayerAiGeneration(playerId) {
        const aiModelCount = await this.aiModelsRepository.count({
            where: { playerId },
        });
        await this.playersRepository.update({ id: playerId }, { aiGeneration: aiModelCount });
    }
    async create(userId, createAiModelDto) {
        const aiModel = this.aiModelsRepository.create({
            ...createAiModelDto,
            playerId: userId,
            generationNumber: createAiModelDto.generationNumber || 1,
            lastTrainingDate: new Date(),
        });
        const savedModel = await this.aiModelsRepository.save(aiModel);
        await this.updatePlayerAiGeneration(userId);
        return savedModel;
    }
    async findAll(filters) {
        const query = this.aiModelsRepository.createQueryBuilder('aiModel');
        if (filters.userId) {
            query.andWhere('aiModel.userId = :userId', { userId: filters.userId });
        }
        if (filters.minGeneration) {
            query.andWhere('aiModel.generationNumber >= :minGeneration', {
                minGeneration: filters.minGeneration,
            });
        }
        if (filters.maxGeneration) {
            query.andWhere('aiModel.generationNumber <= :maxGeneration', {
                maxGeneration: filters.maxGeneration,
            });
        }
        if (filters.isActive !== undefined) {
            query.andWhere('aiModel.isActive = :isActive', {
                isActive: filters.isActive,
            });
        }
        if (filters.minFitnessScore) {
            query.andWhere("CAST(aiModel.genetics->'$.fitnessScore' AS DECIMAL) >= :minFitnessScore", {
                minFitnessScore: filters.minFitnessScore,
            });
        }
        return query.getMany();
    }
    async findOne(id, userId) {
        const queryOptions = { where: { id } };
        if (userId) {
            queryOptions.where['userId'] = userId;
        }
        const aiModel = await this.aiModelsRepository.findOne(queryOptions);
        if (!aiModel) {
            throw new common_1.NotFoundException(`Modelo de IA con ID ${id} no encontrado`);
        }
        return aiModel;
    }
    async update(id, userId, updateAiModelDto) {
        const aiModel = await this.findOne(id);
        if (aiModel.playerId !== userId) {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar este modelo de IA');
        }
        Object.assign(aiModel, updateAiModelDto);
        if (updateAiModelDto.trainingMetrics) {
            aiModel.lastTrainingDate = new Date();
        }
        return this.aiModelsRepository.save(aiModel);
    }
    async evolve(parentIds, userId) {
        const parents = await Promise.all(parentIds.map((id) => this.findOne(id, userId)));
        const bestParent = parents.reduce((best, current) => {
            const currentFitness = current.genetics?.fitnessScore || 0;
            const bestFitness = best.genetics?.fitnessScore || 0;
            return currentFitness > bestFitness ? current : best;
        });
        const newModel = await this.create(userId, {
            name: `${bestParent.name}_gen_${bestParent.generationNumber + 1}`,
            version: `${bestParent.version}.${bestParent.generationNumber + 1}`,
            modelData: bestParent.modelData,
            configuration: bestParent.configuration,
            generationNumber: bestParent.generationNumber + 1,
            genetics: {
                parentIds,
                fitnessScore: 0,
                mutationRate: 0.1,
            },
        });
        return newModel;
    }
    async remove(id, userId) {
        const aiModel = await this.findOne(id);
        if (aiModel.playerId !== userId) {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar este modelo de IA');
        }
        await this.aiModelsRepository.remove(aiModel);
        await this.updatePlayerAiGeneration(userId);
    }
    async getEvolutionHistory(id, userId) {
        const currentModel = await this.findOne(id, userId);
        const history = [currentModel];
        let currentParents = currentModel.genetics?.parentIds || [];
        while (currentParents.length > 0) {
            const parents = await Promise.all(currentParents.map((parentId) => this.findOne(parentId, userId)));
            history.push(...parents);
            currentParents = parents.flatMap((p) => p.genetics?.parentIds || []);
        }
        return history;
    }
};
exports.AiModelsService = AiModelsService;
exports.AiModelsService = AiModelsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_model_entity_1.AIModel)),
    __param(1, (0, typeorm_1.InjectRepository)(player_entity_1.Player)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AiModelsService);
//# sourceMappingURL=ai-models.service.js.map