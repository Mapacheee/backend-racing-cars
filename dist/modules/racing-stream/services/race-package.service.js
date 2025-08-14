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
exports.RacePackageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const track_entity_1 = require("../../tracks/entities/track.entity");
const ai_model_entity_1 = require("../../ai-models/entities/ai-model.entity");
let RacePackageService = class RacePackageService {
    trackRepository;
    aiModelRepository;
    constructor(trackRepository, aiModelRepository) {
        this.trackRepository = trackRepository;
        this.aiModelRepository = aiModelRepository;
    }
    async buildRacePackage(raceConfig) {
        this.validateRaceConfigurationInput(raceConfig);
        const track = await this.trackRepository.findOne({
            where: { id: raceConfig.trackId },
        });
        if (!track) {
            throw new Error(`Track with ID ${raceConfig.trackId} not found`);
        }
        const aiModels = await this.aiModelRepository.findByIds(raceConfig.aiModelIds);
        if (aiModels.length !== raceConfig.aiModelIds.length) {
            const foundIds = aiModels.map((model) => model.id);
            const missingIds = raceConfig.aiModelIds.filter((id) => !foundIds.includes(id));
            throw new Error(`AI Models not found: ${missingIds.join(', ')}`);
        }
        const trackData = {
            id: track.id,
            name: track.name,
            layout: this.parseTrackLayout(track.layoutData),
            metadata: {
                length: track.length,
                width: 10,
                checkpoints: this.countCheckpoints(track.layoutData),
                description: track.difficulty,
            },
        };
        const aiModelData = aiModels.map((model) => ({
            id: model.id,
            name: model.name,
            generation: model.generationNumber,
            weights: this.parseWeights(model.modelData),
            architecture: {
                inputs: this.getInputSize(model.configuration),
                hiddenLayers: this.parseHiddenLayers(model.configuration),
                outputs: this.getOutputSize(model.configuration),
            },
        }));
        return {
            trackData,
            aiModels: aiModelData,
            raceConfig,
        };
    }
    async validateRaceConfiguration(raceConfig) {
        try {
            if (!this.isValidRaceConfigurationStructure(raceConfig)) {
                return false;
            }
            const track = await this.trackRepository.findOne({
                where: { id: raceConfig.trackId },
            });
            if (!track)
                return false;
            const aiModels = await this.aiModelRepository.findByIds(raceConfig.aiModelIds);
            if (aiModels.length !== raceConfig.aiModelIds.length)
                return false;
            if (raceConfig.raceSettings.timeLimit &&
                raceConfig.raceSettings.timeLimit <= 0)
                return false;
            return true;
        }
        catch (_error) {
            return false;
        }
    }
    validateRaceConfigurationInput(raceConfig) {
        if (!raceConfig) {
            throw new Error('Race configuration is required');
        }
        if (!raceConfig.trackId || typeof raceConfig.trackId !== 'string') {
            throw new Error('Valid track ID is required');
        }
        if (!Array.isArray(raceConfig.aiModelIds) ||
            raceConfig.aiModelIds.length === 0) {
            throw new Error('At least one AI model ID is required');
        }
        if (!raceConfig.raceSettings) {
            throw new Error('Race settings are required');
        }
    }
    isValidRaceConfigurationStructure(raceConfig) {
        if (typeof raceConfig !== 'object' || raceConfig === null) {
            return false;
        }
        const config = raceConfig;
        return (typeof config.trackId === 'string' &&
            Array.isArray(config.aiModelIds) &&
            config.aiModelIds.every((id) => typeof id === 'string') &&
            typeof config.raceSettings === 'object' &&
            config.raceSettings !== null &&
            typeof config.raceSettings.laps === 'number');
    }
    parseTrackLayout(layout) {
        if (typeof layout === 'string') {
            try {
                const parsed = JSON.parse(layout);
                return this.validateTrackPoints(parsed);
            }
            catch {
                return [];
            }
        }
        if (Array.isArray(layout)) {
            return this.validateTrackPoints(layout);
        }
        return [];
    }
    validateTrackPoints(data) {
        if (!Array.isArray(data)) {
            return [];
        }
        return data
            .filter((item) => {
            if (typeof item !== 'object' || item === null) {
                return false;
            }
            const obj = item;
            return (typeof obj.x === 'number' &&
                typeof obj.y === 'number' &&
                typeof obj.z === 'number' &&
                typeof obj.type === 'string' &&
                ['track', 'checkpoint', 'start', 'finish'].includes(obj.type));
        })
            .map((point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
            type: point.type,
        }));
    }
    countCheckpoints(layout) {
        const parsedLayout = this.parseTrackLayout(layout);
        return parsedLayout.filter((point) => point.type === 'checkpoint').length;
    }
    parseWeights(modelData) {
        if (this.isModelDataWithWeights(modelData)) {
            return this.validateWeights(modelData.weights);
        }
        return [];
    }
    isModelDataWithWeights(data) {
        if (typeof data !== 'object' || data === null) {
            return false;
        }
        const obj = data;
        return 'weights' in obj && Array.isArray(obj.weights);
    }
    validateWeights(weights) {
        if (!Array.isArray(weights)) {
            return [];
        }
        return weights.filter((layer) => {
            return (Array.isArray(layer) &&
                layer.every((weight) => typeof weight === 'number'));
        });
    }
    parseHiddenLayers(configuration) {
        if (this.isConfigurationWithHiddenLayers(configuration)) {
            return this.validateHiddenLayers(configuration.hiddenLayers);
        }
        return [10, 8];
    }
    isConfigurationWithHiddenLayers(data) {
        if (typeof data !== 'object' || data === null) {
            return false;
        }
        const obj = data;
        return 'hiddenLayers' in obj && Array.isArray(obj.hiddenLayers);
    }
    validateHiddenLayers(hiddenLayers) {
        if (!Array.isArray(hiddenLayers)) {
            return [10, 8];
        }
        const validLayers = hiddenLayers.filter((layer) => typeof layer === 'number' && layer > 0);
        return validLayers.length > 0 ? validLayers : [10, 8];
    }
    getInputSize(configuration) {
        if (this.isConfigurationWithInputSize(configuration)) {
            return typeof configuration.inputSize === 'number' &&
                configuration.inputSize > 0
                ? configuration.inputSize
                : 7;
        }
        return 7;
    }
    isConfigurationWithInputSize(data) {
        return typeof data === 'object' && data !== null && 'inputSize' in data;
    }
    getOutputSize(configuration) {
        if (this.isConfigurationWithOutputSize(configuration)) {
            return typeof configuration.outputSize === 'number' &&
                configuration.outputSize > 0
                ? configuration.outputSize
                : 3;
        }
        return 3;
    }
    isConfigurationWithOutputSize(data) {
        return typeof data === 'object' && data !== null && 'outputSize' in data;
    }
};
exports.RacePackageService = RacePackageService;
exports.RacePackageService = RacePackageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(track_entity_1.Track)),
    __param(1, (0, typeorm_1.InjectRepository)(ai_model_entity_1.AIModel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RacePackageService);
//# sourceMappingURL=race-package.service.js.map