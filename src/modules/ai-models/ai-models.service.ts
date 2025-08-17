import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIModel } from './entities/ai-model.entity';
import { Player } from '../players/entities/player.entity';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { Genome, NEATConfig } from './interfaces/ai-model.interface';

export interface GenerationPaginationOptions {
  page: number;
  limit: number;
  sortOrder: 'ASC' | 'DESC';
}

export interface ExportOptions {
  generationNumber?: number;
  topN?: number;
}

@Injectable()
export class AiModelsService {
  constructor(
    @InjectRepository(AIModel)
    private aiModelsRepository: Repository<AIModel>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
  ) {}

  private async updatePlayerAiGeneration(playerId: string): Promise<void> {
    const maxGeneration = await this.aiModelsRepository
      .createQueryBuilder('aiModel')
      .select('MAX(aiModel.generationNumber)', 'maxGeneration')
      .where('aiModel.playerId = :playerId', { playerId })
      .getRawOne<{ maxGeneration: number }>();

    const aiGeneration = (maxGeneration?.maxGeneration as number) || 0;

    await this.playersRepository.update({ id: playerId }, { aiGeneration });
  }

  async pushGeneration(
    playerId: string,
    createAiModelDto: CreateAiModelDto,
  ): Promise<AIModel> {
    // Get the current highest generation number for this player
    const currentMaxGeneration = await this.aiModelsRepository
      .createQueryBuilder('aiModel')
      .select('MAX(aiModel.generationNumber)', 'maxGeneration')
      .where('aiModel.playerId = :playerId', { playerId })
      .getRawOne<{ maxGeneration: number }>();

    const nextGenerationNumber =
      ((currentMaxGeneration?.maxGeneration as number) || 0) + 1;

    // Validate that we're not skipping generations
    if (
      nextGenerationNumber >
      ((currentMaxGeneration?.maxGeneration as number) || 0) + 1
    ) {
      throw new BadRequestException(
        `Cannot skip generations. Expected generation ${
          ((currentMaxGeneration?.maxGeneration as number) || 0) + 1
        }, got ${nextGenerationNumber}`,
      );
    }

    // Check if this generation already exists
    const existingGeneration = await this.aiModelsRepository.findOne({
      where: { playerId, generationNumber: nextGenerationNumber },
    });

    if (existingGeneration) {
      throw new BadRequestException(
        `Generation ${nextGenerationNumber} already exists`,
      );
    }

    // Create new AI model with the generation
    const aiModel = this.aiModelsRepository.create({
      playerId,
      neatGenomes: createAiModelDto.neatGenomes,
      config: createAiModelDto.config,
      generationNumber: nextGenerationNumber,
    });

    const savedModel = await this.aiModelsRepository.save(aiModel);

    // Update player's generation count
    await this.updatePlayerAiGeneration(playerId);

    return savedModel;
  }

  async getLatestGeneration(playerId: string): Promise<AIModel | null> {
    return this.aiModelsRepository.findOne({
      where: { playerId },
      order: { generationNumber: 'DESC' },
    });
  }

  async getGeneration(
    playerId: string,
    generationNumber: number,
  ): Promise<AIModel> {
    const generation = await this.aiModelsRepository.findOne({
      where: { playerId, generationNumber },
    });

    if (!generation) {
      throw new NotFoundException(
        `Generation ${generationNumber} not found for player`,
      );
    }

    return generation;
  }

  async getAllGenerations(
    playerId: string,
    options: GenerationPaginationOptions,
  ): Promise<{
    generations: AIModel[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page, limit, sortOrder } = options;
    const skip = (page - 1) * limit;

    const [generations, total] = await this.aiModelsRepository.findAndCount({
      where: { playerId },
      order: { generationNumber: sortOrder },
      skip,
      take: limit,
    });

    return {
      generations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async resetAllGenerations(playerId: string): Promise<void> {
    await this.aiModelsRepository.delete({ playerId });
    await this.updatePlayerAiGeneration(playerId);
  }

  async deleteGeneration(
    playerId: string,
    generationNumber: number,
  ): Promise<void> {
    const result = await this.aiModelsRepository.delete({
      playerId,
      generationNumber,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Generation ${generationNumber} not found for player`,
      );
    }

    await this.updatePlayerAiGeneration(playerId);
  }

  async getGenerationStatistics(playerId: string): Promise<{
    totalGenerations: number;
    averageFitness: number;
    bestFitness: number;
    latestGeneration: number;
    totalGenomes: number;
  }> {
    const generations = await this.aiModelsRepository.find({
      where: { playerId },
      order: { generationNumber: 'ASC' },
    });

    if (generations.length === 0) {
      return {
        totalGenerations: 0,
        averageFitness: 0,
        bestFitness: 0,
        latestGeneration: 0,
        totalGenomes: 0,
      };
    }

    let totalFitness = 0;
    let maxFitness = 0;
    let totalGenomes = 0;

    generations.forEach((generation) => {
      generation.neatGenomes.forEach((genome) => {
        totalFitness += genome.fitness;
        maxFitness = Math.max(maxFitness, genome.fitness);
        totalGenomes++;
      });
    });

    return {
      totalGenerations: generations.length,
      averageFitness: totalGenomes > 0 ? totalFitness / totalGenomes : 0,
      bestFitness: maxFitness,
      latestGeneration: Math.max(...generations.map((g) => g.generationNumber)),
      totalGenomes,
    };
  }

  async getFitnessProgression(playerId: string): Promise<
    {
      generationNumber: number;
      avgFitness: number;
      maxFitness: number;
      minFitness: number;
    }[]
  > {
    const generations = await this.aiModelsRepository.find({
      where: { playerId },
      order: { generationNumber: 'ASC' },
    });

    return generations.map((generation) => {
      const fitnesses = generation.neatGenomes.map((genome) => genome.fitness);

      return {
        generationNumber: generation.generationNumber,
        avgFitness: fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
        maxFitness: Math.max(...fitnesses),
        minFitness: Math.min(...fitnesses),
      };
    });
  }

  async getBestPerformers(
    playerId: string,
    limit: number = 5,
  ): Promise<
    {
      generationNumber: number;
      bestGenome: Genome;
      averageFitness: number;
    }[]
  > {
    const generations = await this.aiModelsRepository.find({
      where: { playerId },
      order: { generationNumber: 'ASC' },
    });

    return generations
      .map((generation) => {
        const genomes = generation.neatGenomes;
        const bestGenome = genomes.reduce((best, current) =>
          current.fitness > best.fitness ? current : best,
        );

        const averageFitness =
          genomes.reduce((sum, genome) => sum + genome.fitness, 0) /
          genomes.length;

        return {
          generationNumber: generation.generationNumber,
          bestGenome,
          averageFitness,
        };
      })
      .slice(-limit);
  }

  async getBestGenomes(
    playerId: string,
    limit: number = 10,
  ): Promise<Genome[]> {
    const latestGeneration = await this.getLatestGeneration(playerId);

    if (!latestGeneration) {
      return [];
    }

    return latestGeneration.neatGenomes
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, limit);
  }

  async getGenomesFromGeneration(
    playerId: string,
    generationNumber: number,
  ): Promise<Genome[]> {
    const generation = await this.getGeneration(playerId, generationNumber);
    return generation.neatGenomes;
  }

  async exportGenomes(
    playerId: string,
    options: ExportOptions,
  ): Promise<{
    genomes: Genome[];
    config: NEATConfig;
    generationNumber: number;
    exportDate: Date;
  }> {
    let generation: AIModel;

    if (options.generationNumber) {
      generation = await this.getGeneration(playerId, options.generationNumber);
    } else {
      const latestGeneration = await this.getLatestGeneration(playerId);
      if (!latestGeneration) {
        throw new NotFoundException('No generations found for player');
      }
      generation = latestGeneration;
    }

    let genomes = generation.neatGenomes;

    if (options.topN) {
      genomes = genomes
        .sort((a, b) => b.fitness - a.fitness)
        .slice(0, options.topN);
    }

    return {
      genomes,
      config: generation.config,
      generationNumber: generation.generationNumber,
      exportDate: new Date(),
    };
  }
}
