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
exports.TracksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const track_entity_1 = require("./entities/track.entity");
let TracksService = class TracksService {
    tracksRepository;
    constructor(tracksRepository) {
        this.tracksRepository = tracksRepository;
    }
    async create(createTrackDto) {
        const track = this.tracksRepository.create(createTrackDto);
        return this.tracksRepository.save(track);
    }
    async findAll(onlyActive = true) {
        const queryOptions = {};
        if (onlyActive) {
            queryOptions['where'] = { isActive: true };
        }
        return this.tracksRepository.find(queryOptions);
    }
    async findOne(id) {
        const track = await this.tracksRepository.findOneBy({ id });
        if (!track) {
            throw new common_1.NotFoundException(`Pista con ID ${id} no encontrada`);
        }
        return track;
    }
    async update(id, updateTrackDto) {
        const track = await this.findOne(id);
        Object.assign(track, updateTrackDto);
        return this.tracksRepository.save(track);
    }
    async remove(id) {
        const result = await this.tracksRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Pista con ID ${id} no encontrada`);
        }
    }
};
exports.TracksService = TracksService;
exports.TracksService = TracksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(track_entity_1.Track)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TracksService);
//# sourceMappingURL=tracks.service.js.map