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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const race_statistics_entity_1 = require("./entities/race-statistics.entity");
let StatisticsService = class StatisticsService {
    raceStatisticsRepository;
    constructor(raceStatisticsRepository) {
        this.raceStatisticsRepository = raceStatisticsRepository;
    }
    async create(createRaceStatisticsDto) {
        const raceStatistics = this.raceStatisticsRepository.create(createRaceStatisticsDto);
        return this.raceStatisticsRepository.save(raceStatistics);
    }
    async findAll(filters) {
        const query = this.raceStatisticsRepository.createQueryBuilder('raceStatistics');
        if (filters.trackId) {
            query.andWhere("raceStatistics.trackInfo->>'trackId' = :trackId", {
                trackId: filters.trackId,
            });
        }
        if (filters.aiModelId) {
            query.andWhere("EXISTS (SELECT 1 FROM json_each(raceStatistics.participants) WHERE json_extract(value, '$.aiModelId') = :aiModelId)", { aiModelId: filters.aiModelId });
        }
        if (filters.dateFrom) {
            query.andWhere('raceStatistics.raceDate >= :dateFrom', {
                dateFrom: new Date(filters.dateFrom),
            });
        }
        if (filters.dateTo) {
            query.andWhere('raceStatistics.raceDate <= :dateTo', {
                dateTo: new Date(filters.dateTo),
            });
        }
        if (filters.difficulty) {
            query.andWhere("raceStatistics.raceConditions->>'difficulty' = :difficulty", { difficulty: filters.difficulty });
        }
        return query.getMany();
    }
    async getAIModelStats(aiModelId) {
        const races = await this.raceStatisticsRepository
            .createQueryBuilder('raceStatistics')
            .where("EXISTS (SELECT 1 FROM json_each(raceStatistics.participants) WHERE json_extract(value, '$.aiModelId') = :aiModelId)", { aiModelId })
            .getMany();
        const stats = races.reduce((acc, race) => {
            const participant = race.participants.find((p) => p.aiModelId === aiModelId);
            if (participant) {
                acc.totalRaces++;
                acc.totalDistance += participant.distanceCompleted;
                acc.positions.push(participant.position);
                if (participant.lapTimes) {
                    acc.lapTimes.push(...participant.lapTimes);
                }
            }
            return acc;
        }, {
            totalRaces: 0,
            totalDistance: 0,
            positions: [],
            lapTimes: [],
        });
        return {
            ...stats,
            averagePosition: stats.positions.length > 0
                ? stats.positions.reduce((a, b) => a + b) / stats.positions.length
                : 0,
            bestPosition: Math.min(...stats.positions),
            bestLapTime: Math.min(...stats.lapTimes),
            averageLapTime: stats.lapTimes.reduce((a, b) => a + b) / stats.lapTimes.length,
        };
    }
    async getTrackLeaderboard(trackId) {
        const races = await this.raceStatisticsRepository
            .createQueryBuilder('raceStatistics')
            .where("raceStatistics.trackInfo->>'trackId' = :trackId", { trackId })
            .getMany();
        const leaderboard = new Map();
        races.forEach((race) => {
            race.participants.forEach((participant) => {
                const currentStats = leaderboard.get(participant.aiModelId) || {
                    aiModelId: participant.aiModelId,
                    bestPosition: Infinity,
                    bestLapTime: Infinity,
                    totalRaces: 0,
                    wins: 0,
                };
                currentStats.totalRaces++;
                if (participant.position === 1)
                    currentStats.wins++;
                if (participant.position < currentStats.bestPosition) {
                    currentStats.bestPosition = participant.position;
                }
                if (participant.lapTimes) {
                    const bestLap = Math.min(...participant.lapTimes);
                    if (bestLap < currentStats.bestLapTime) {
                        currentStats.bestLapTime = bestLap;
                    }
                }
                leaderboard.set(participant.aiModelId, currentStats);
            });
        });
        return Array.from(leaderboard.values()).sort((a, b) => b.wins - a.wins || a.bestPosition - b.bestPosition);
    }
    async getPlayerStatistics(_id) {
        console.error("TODO: getPlayerStatistics doesn't implement player ID yet");
        const races = await this.raceStatisticsRepository
            .createQueryBuilder('raceStatistics')
            .getMany();
        const playerStats = {
            totalRaces: 0,
            totalWins: 0,
            bestPosition: Infinity,
            totalDistance: 0,
            bestLapTime: Infinity,
            averageLapTime: 0,
            allLapTimes: [],
        };
        races.forEach((race) => {
            race.participants.forEach((participant) => {
                playerStats.totalRaces++;
                if (participant.position === 1)
                    playerStats.totalWins++;
                if (participant.position < playerStats.bestPosition) {
                    playerStats.bestPosition = participant.position;
                }
                playerStats.totalDistance += participant.distanceCompleted;
                if (participant.lapTimes) {
                    playerStats.allLapTimes.push(...participant.lapTimes);
                }
            });
        });
        if (playerStats.allLapTimes.length > 0) {
            playerStats.bestLapTime = Math.min(...playerStats.allLapTimes);
            playerStats.averageLapTime =
                playerStats.allLapTimes.reduce((a, b) => a + b) /
                    playerStats.allLapTimes.length;
        }
        const { allLapTimes: _, ...stats } = playerStats;
        return stats;
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(race_statistics_entity_1.RaceStatistics)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map