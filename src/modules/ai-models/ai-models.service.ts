import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIModel } from './entities/ai-model.entity';
import { Player } from '../players/entities/player.entity';
import { CreateAiModelDto } from './dto/create-ai-model.dto';

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

    console.log('max Generation update');
    console.log({ maxGeneration });

    const aiGeneration = (maxGeneration?.maxGeneration as number) || 0;

    await this.playersRepository.update({ id: playerId }, { aiGeneration });
  }

  async createAiModel(
    playerId: string,
    createAiModelDto: CreateAiModelDto,
  ): Promise<AIModel> {
    const currentMaxGeneration = await this.aiModelsRepository
      .createQueryBuilder('aiModel')
      .select('MAX(aiModel.generationNumber)', 'maxGeneration')
      .where('aiModel.playerId = :playerId', { playerId })
      .getRawOne<{ maxGeneration: number }>();

    const generationNumber =
      ((currentMaxGeneration?.maxGeneration as number) || 0) + 1;

    console.log({ currentMaxGeneration, generationNumber });

    const currentMaxIndex = await this.aiModelsRepository
      .createQueryBuilder('aiModel')
      .select('MAX(aiModel.networkIndex)', 'maxIndex')
      .where('aiModel.playerId = :playerId', { playerId })
      .andWhere('aiModel.generationNumber = :generationNumber', {
        generationNumber,
      })
      .getRawOne<{ maxIndex: number }>();

    const networkIndex = ((currentMaxIndex?.maxIndex as number) || -1) + 1;

    const aiModel = this.aiModelsRepository.create({
      playerId,
      generationNumber,
      networkIndex,
      networkData: createAiModelDto.networkData as unknown,
      fitness: 0,
      metadata: createAiModelDto.metadata || {},
      neatConfig: createAiModelDto.neatConfig,
    });

    const savedModel = await this.aiModelsRepository.save(aiModel);
    await this.updatePlayerAiGeneration(playerId);

    return savedModel;
  }

  async updateNetworkFitness(
    playerId: string,
    networkId: string,
    fitness: number,
  ): Promise<AIModel> {
    const network = await this.aiModelsRepository.findOne({
      where: { id: networkId, playerId },
    });

    if (!network) {
      throw new NotFoundException('Network not found');
    }

    network.fitness = fitness;
    return this.aiModelsRepository.save(network);
  }

  async getLatestGeneration(playerId: string): Promise<AIModel[]> {
    const maxGeneration = await this.aiModelsRepository
      .createQueryBuilder('aiModel')
      .select('MAX(aiModel.generationNumber)', 'maxGeneration')
      .where('aiModel.playerId = :playerId', { playerId })
      .getRawOne<{ maxGeneration: number }>();

    if (!maxGeneration?.maxGeneration) {
      return [];
    }

    return this.aiModelsRepository.find({
      where: { playerId, generationNumber: maxGeneration.maxGeneration },
      order: { networkIndex: 'ASC' },
    });
  }

  async getGeneration(
    playerId: string,
    generationNumber: number,
  ): Promise<AIModel[]> {
    const networks = await this.aiModelsRepository.find({
      where: { playerId, generationNumber },
      order: { networkIndex: 'ASC' },
    });

    if (networks.length === 0) {
      throw new NotFoundException(
        `Generation ${generationNumber} not found for player`,
      );
    }

    return networks;
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
}
