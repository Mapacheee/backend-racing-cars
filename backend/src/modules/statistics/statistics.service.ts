import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaceStatistics } from './entities/race-statistics.entity';
import {
  CreateRaceStatisticsDto,
  RaceStatisticsFilterDto,
} from './dto/race-statistics.dto';
import {
  AIModelStats,
  TrackLeaderboardEntry,
  PlayerStatistics,
} from './interfaces/statistics.interface';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(RaceStatistics)
    private readonly raceStatisticsRepository: Repository<RaceStatistics>,
  ) {}

  async create(
    createRaceStatisticsDto: CreateRaceStatisticsDto,
  ): Promise<RaceStatistics> {
    const raceStatistics = this.raceStatisticsRepository.create(
      createRaceStatisticsDto,
    );
    return this.raceStatisticsRepository.save(raceStatistics);
  }

  async findAll(filters: RaceStatisticsFilterDto): Promise<RaceStatistics[]> {
    const query =
      this.raceStatisticsRepository.createQueryBuilder('raceStatistics');

    if (filters.trackId) {
      query.andWhere("raceStatistics.trackInfo->>'trackId' = :trackId", {
        trackId: filters.trackId,
      });
    }

    if (filters.aiModelId) {
      query.andWhere(
        "EXISTS (SELECT 1 FROM json_each(raceStatistics.participants) WHERE json_extract(value, '$.aiModelId') = :aiModelId)",
        { aiModelId: filters.aiModelId },
      );
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
      query.andWhere(
        "raceStatistics.raceConditions->>'difficulty' = :difficulty",
        { difficulty: filters.difficulty },
      );
    }

    return query.getMany();
  }

  async getAIModelStats(aiModelId: string): Promise<AIModelStats> {
    const races = await this.raceStatisticsRepository
      .createQueryBuilder('raceStatistics')
      .where(
        "EXISTS (SELECT 1 FROM json_each(raceStatistics.participants) WHERE json_extract(value, '$.aiModelId') = :aiModelId)",
        { aiModelId },
      )
      .getMany();

    const stats = races.reduce(
      (
        acc: {
          totalRaces: number;
          totalDistance: number;
          positions: number[];
          lapTimes: number[];
        },
        race,
      ) => {
        const participant = race.participants.find(
          (p) => p.aiModelId === aiModelId,
        );
        if (participant) {
          acc.totalRaces++;
          acc.totalDistance += participant.distanceCompleted;
          acc.positions.push(participant.position);
          if (participant.lapTimes) {
            acc.lapTimes.push(...participant.lapTimes);
          }
        }
        return acc;
      },
      {
        totalRaces: 0,
        totalDistance: 0,
        positions: [] as number[],
        lapTimes: [] as number[],
      },
    );

    return {
      ...stats,
      averagePosition:
        stats.positions.length > 0
          ? stats.positions.reduce((a, b) => a + b) / stats.positions.length
          : 0,
      bestPosition: Math.min(...stats.positions),
      bestLapTime: Math.min(...stats.lapTimes),
      averageLapTime:
        stats.lapTimes.reduce((a, b) => a + b) / stats.lapTimes.length,
    };
  }

  async getTrackLeaderboard(trackId: string): Promise<TrackLeaderboardEntry[]> {
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
        if (participant.position === 1) currentStats.wins++;
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

    return Array.from(leaderboard.values()).sort(
      (a, b) => b.wins - a.wins || a.bestPosition - b.bestPosition,
    );
  }

  async getPlayerStatistics(userId: string): Promise<PlayerStatistics> {
    const races = await this.raceStatisticsRepository
      .createQueryBuilder('raceStatistics')
      .getMany();

    const playerStats: {
      totalRaces: number;
      totalWins: number;
      bestPosition: number;
      totalDistance: number;
      bestLapTime: number;
      averageLapTime: number;
      allLapTimes: number[];
    } = {
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
        if (participant.position === 1) playerStats.totalWins++;
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

    const { allLapTimes, ...stats } = playerStats;
    return stats;
  }
}
