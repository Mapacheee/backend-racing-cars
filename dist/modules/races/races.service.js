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
exports.RacesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const race_entity_1 = require("./entities/race.entity");
const race_participant_entity_1 = require("./entities/race-participant.entity");
const tracks_service_1 = require("../tracks/tracks.service");
const ai_models_service_1 = require("../ai-models/ai-models.service");
let RacesService = class RacesService {
    racesRepository;
    participantsRepository;
    tracksService;
    aiModelsService;
    constructor(racesRepository, participantsRepository, tracksService, aiModelsService) {
        this.racesRepository = racesRepository;
        this.participantsRepository = participantsRepository;
        this.tracksService = tracksService;
        this.aiModelsService = aiModelsService;
    }
    async create(createRaceDto) {
        await this.tracksService.findOne(createRaceDto.trackId);
        const race = this.racesRepository.create(createRaceDto);
        const savedRace = await this.racesRepository.save(race);
        if (createRaceDto.participantIds &&
            createRaceDto.participantIds.length > 0) {
            for (const aiModelId of createRaceDto.participantIds) {
                await this.aiModelsService.findOne(aiModelId);
                const participant = this.participantsRepository.create({
                    raceId: savedRace.id,
                    aiModelId,
                });
                await this.participantsRepository.save(participant);
            }
        }
        return this.findOne(savedRace.id);
    }
    async findAll() {
        return this.racesRepository.find({
            relations: ['track', 'participants', 'participants.aiModel'],
        });
    }
    async findOne(id) {
        const race = await this.racesRepository.findOne({
            where: { id },
            relations: ['track', 'participants', 'participants.aiModel'],
        });
        if (!race) {
            throw new common_1.NotFoundException(`Carrera con ID ${id} no encontrada`);
        }
        return race;
    }
    async update(id, updateRaceDto) {
        const race = await this.findOne(id);
        if (race.status === race_entity_1.RaceStatus.COMPLETED) {
            throw new common_1.BadRequestException('No se puede modificar una carrera completada');
        }
        Object.assign(race, updateRaceDto);
        return this.racesRepository.save(race);
    }
    async remove(id) {
        const race = await this.findOne(id);
        await this.participantsRepository.delete({ raceId: id });
        await this.racesRepository.remove(race);
    }
    async addParticipant(id, addParticipantDto) {
        await this.aiModelsService.findOne(addParticipantDto.aiModelId);
        const existingParticipant = await this.participantsRepository.findOne({
            where: {
                raceId: id,
                aiModelId: addParticipantDto.aiModelId,
            },
        });
        if (existingParticipant) {
            throw new common_1.BadRequestException('Este modelo de IA ya está participando en la carrera');
        }
        const participant = this.participantsRepository.create({
            raceId: id,
            aiModelId: addParticipantDto.aiModelId,
        });
        return this.participantsRepository.save(participant);
    }
    async updateParticipant(raceId, participantId, updateParticipantDto) {
        const participant = await this.participantsRepository.findOne({
            where: { id: participantId, raceId },
        });
        if (!participant) {
            throw new common_1.NotFoundException(`Participante con ID ${participantId} no encontrado en la carrera ${raceId}`);
        }
        Object.assign(participant, updateParticipantDto);
        return this.participantsRepository.save(participant);
    }
    async removeParticipant(raceId, participantId) {
        const participant = await this.participantsRepository.findOne({
            where: { id: participantId, raceId },
        });
        if (!participant) {
            throw new common_1.NotFoundException(`Participante con ID ${participantId} no encontrado en la carrera ${raceId}`);
        }
        await this.participantsRepository.remove(participant);
    }
};
exports.RacesService = RacesService;
exports.RacesService = RacesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(race_entity_1.Race)),
    __param(1, (0, typeorm_1.InjectRepository)(race_participant_entity_1.RaceParticipant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        tracks_service_1.TracksService,
        ai_models_service_1.AiModelsService])
], RacesService);
//# sourceMappingURL=races.service.js.map