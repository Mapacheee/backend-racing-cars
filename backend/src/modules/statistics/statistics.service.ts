import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race } from '../races/entities/race.entity';
import { RaceParticipant } from '../races/entities/race-participant.entity';
import { AIModel } from '../ai-models/entities/ai-model.entity';
import { LeaderboardEntry } from './interfaces/leaderboard-entry.interface';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Race)
    private racesRepository: Repository<Race>,
    @InjectRepository(RaceParticipant)
    private participantsRepository: Repository<RaceParticipant>,
    @InjectRepository(AIModel)
    private aiModelsRepository: Repository<AIModel>,
  ) {}

  async getUserStatistics(userId: string) {
    // Obtener todos los modelos de IA del usuario
    const aiModels = await this.aiModelsRepository.find({
      where: { userId },
    });

    const aiModelIds = aiModels.map((model) => model.id);

    // Obtener todas las participaciones en carreras de estos modelos
    const participations = await this.participantsRepository
      .createQueryBuilder('participant')
      .where('participant.aiModelId IN (:...aiModelIds)', { aiModelIds })
      .leftJoinAndSelect('participant.race', 'race')
      .leftJoinAndSelect('participant.aiModel', 'aiModel')
      .getMany();

    // Calcular estadísticas
    const totalRaces = new Set(
      participations.map((p) => p.raceId),
    ).size;
    const victories = participations.filter((p) => p.position === 1).length;
    const podiums = participations.filter((p) => p.position <= 3).length;

    // Calcular tiempo promedio
    const validTimes = participations
      .filter((p) => p.finishingTime != null)
      .map((p) => p.finishingTime);
    const averageTime =
      validTimes.length > 0
        ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
        : 0;

    // Calcular modelo más exitoso
    const modelStats = {};
    for (const p of participations) {
      if (!modelStats[p.aiModelId]) {
        modelStats[p.aiModelId] = {
          id: p.aiModelId,
          name: p.aiModel.name,
          races: 0,
          victories: 0,
          podiums: 0,
        };
      }

      modelStats[p.aiModelId].races++;
      if (p.position === 1) modelStats[p.aiModelId].victories++;
      if (p.position <= 3) modelStats[p.aiModelId].podiums++;
    }

    const mostSuccessfulModel = Object.values(modelStats).sort(
      (a: any, b: any) => b.victories - a.victories,
    )[0];

    return {
      totalModels: aiModels.length,
      totalRaces,
      victories,
      podiums,
      averageTime,
      mostSuccessfulModel,
      recentParticipations: participations
        .sort((a, b) => {
          return (
            new Date(b.race.createdAt).getTime() -
            new Date(a.race.createdAt).getTime()
          );
        })
        .slice(0, 5)
        .map((p) => ({
          raceId: p.raceId,
          raceName: p.race.name,
          aiModelId: p.aiModelId,
          aiModelName: p.aiModel.name,
          position: p.position,
          finishingTime: p.finishingTime,
          date: p.race.createdAt,
        })),
    };
  }

  async getAiModelStatistics(aiModelId: string) {
    // Obtener todas las participaciones en carreras de este modelo
    const participations = await this.participantsRepository.find({
      where: { aiModelId },
      relations: ['race'],
    });

    // Calcular estadísticas
    const totalRaces = participations.length;
    const victories = participations.filter((p) => p.position === 1).length;
    const podiums = participations.filter((p) => p.position <= 3).length;

    // Calcular tiempo promedio
    const validTimes = participations
      .filter((p) => p.finishingTime != null)
      .map((p) => p.finishingTime);
    const averageTime =
      validTimes.length > 0
        ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
        : 0;

    // Mejor tiempo
    const bestTime =
      validTimes.length > 0 ? Math.min(...validTimes) : null;

    return {
      totalRaces,
      victories,
      podiums,
      averageTime,
      bestTime,
      victoryRate: totalRaces > 0 ? (victories / totalRaces) * 100 : 0,
      podiumRate: totalRaces > 0 ? (podiums / totalRaces) * 100 : 0,
      recentParticipations: participations
        .sort((a, b) => {
          return (
            new Date(b.race.createdAt).getTime() -
            new Date(a.race.createdAt).getTime()
          );
        })
        .slice(0, 5)
        .map((p) => ({
          raceId: p.raceId,
          raceName: p.race.name,
          position: p.position,
          finishingTime: p.finishingTime,
          date: p.race.createdAt,
        })),
    };
  }

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Obtener todos los modelos de IA con sus participaciones
    const aiModels = await this.aiModelsRepository.find({
      relations: ['user'],
    });

    const leaderboardData: LeaderboardEntry[] = [];

    for (const model of aiModels) {
      // Obtener participaciones del modelo
      const participations = await this.participantsRepository.find({
        where: { aiModelId: model.id },
      });

      if (participations.length === 0) continue;

      const totalRaces = participations.length;
      const victories = participations.filter((p) => p.position === 1)
        .length;
      const podiums = participations.filter((p) => p.position <= 3).length;

      // Calcular tiempo promedio
      const validTimes = participations
        .filter((p) => p.finishingTime != null)
        .map((p) => p.finishingTime);
      const averageTime =
        validTimes.length > 0
          ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
          : 0;

      // Mejor tiempo
      const bestTime =
        validTimes.length > 0 ? Math.min(...validTimes) : null;

      leaderboardData.push({
        aiModelId: model.id,
        aiModelName: model.name,
        username: model.user.username,
        totalRaces,
        victories,
        podiums,
        victoryRate: (victories / totalRaces) * 100,
        podiumRate: (podiums / totalRaces) * 100,
        averageTime,
        bestTime,
      });
    }

    // Ordenar por tasa de victorias (mejor criterio para un leaderboard)
    return leaderboardData.sort((a, b) => b.victoryRate - a.victoryRate);
  }
}
