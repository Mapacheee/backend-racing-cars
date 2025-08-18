import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from '../../tracks/entities/track.entity';
import { AIModel } from '../../ai-models/entities/ai-model.entity';
import { Genome } from '../../ai-models/interfaces/ai-model.interface';
import {
  RacePackage,
  RaceConfiguration,
  AIModelData,
  TrackPoint,
  RacePackageServiceInterface,
} from '../interfaces/racing-stream.interface';

interface ParsedTrackLayout {
  x: number;
  y: number;
  z: number;
  type: 'track' | 'checkpoint' | 'start' | 'finish';
  [key: string]: unknown;
}

interface ModelDataWeights {
  weights?: number[][];
  [key: string]: unknown;
}

@Injectable()
export class RacePackageService implements RacePackageServiceInterface {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(AIModel)
    private readonly aiModelRepository: Repository<AIModel>,
  ) {}

  async buildRacePackage(raceConfig: RaceConfiguration): Promise<RacePackage> {
    this.validateRaceConfigurationInput(raceConfig);

    const track = await this.trackRepository.findOne({
      where: { id: raceConfig.trackId },
    });

    if (!track) {
      throw new Error(`Track with ID ${raceConfig.trackId} not found`);
    }

    const aiModels = await this.aiModelRepository.findByIds(
      raceConfig.aiModelIds,
    );

    if (aiModels.length !== raceConfig.aiModelIds.length) {
      const foundIds = aiModels.map((model) => model.id);
      const missingIds = raceConfig.aiModelIds.filter(
        (id) => !foundIds.includes(id),
      );
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

    const aiModelData: AIModelData[] = aiModels.map((model) => ({
      id: model.id,
      name: `Generation ${model.generationNumber}`,
      generation: model.generationNumber,
      weights: this.extractNEATWeights(model.neatGenomes),
      architecture: {
        inputs: model.config.inputNodes,
        hiddenLayers: this.extractHiddenLayersFromGenomes(model.neatGenomes),
        outputs: model.config.outputNodes,
      },
    }));

    return {
      trackData,
      aiModels: aiModelData,
      raceConfig,
    };
  }

  async validateRaceConfiguration(
    raceConfig: RaceConfiguration,
  ): Promise<boolean> {
    try {
      if (!this.isValidRaceConfigurationStructure(raceConfig)) {
        return false;
      }

      const track = await this.trackRepository.findOne({
        where: { id: raceConfig.trackId },
      });
      if (!track) return false;

      const aiModels = await this.aiModelRepository.findByIds(
        raceConfig.aiModelIds,
      );
      if (aiModels.length !== raceConfig.aiModelIds.length) return false;

      if (
        raceConfig.raceSettings.timeLimit &&
        raceConfig.raceSettings.timeLimit <= 0
      )
        return false;

      return true;
    } catch (_error) {
      return false;
    }
  }

  private validateRaceConfigurationInput(raceConfig: RaceConfiguration): void {
    if (!raceConfig) {
      throw new Error('Race configuration is required');
    }

    if (!raceConfig.trackId || typeof raceConfig.trackId !== 'string') {
      throw new Error('Valid track ID is required');
    }

    if (
      !Array.isArray(raceConfig.aiModelIds) ||
      raceConfig.aiModelIds.length === 0
    ) {
      throw new Error('At least one AI model ID is required');
    }

    if (!raceConfig.raceSettings) {
      throw new Error('Race settings are required');
    }
  }

  private isValidRaceConfigurationStructure(
    raceConfig: unknown,
  ): raceConfig is RaceConfiguration {
    if (typeof raceConfig !== 'object' || raceConfig === null) {
      return false;
    }

    const config = raceConfig as Record<string, unknown>;

    return (
      typeof config.trackId === 'string' &&
      Array.isArray(config.aiModelIds) &&
      config.aiModelIds.every((id) => typeof id === 'string') &&
      typeof config.raceSettings === 'object' &&
      config.raceSettings !== null &&
      typeof (config.raceSettings as Record<string, unknown>).laps === 'number'
    );
  }

  private parseTrackLayout(layout: unknown): TrackPoint[] {
    if (typeof layout === 'string') {
      try {
        const parsed = JSON.parse(layout) as unknown;
        return this.validateTrackPoints(parsed);
      } catch {
        return [];
      }
    }

    if (Array.isArray(layout)) {
      return this.validateTrackPoints(layout);
    }

    return [];
  }

  private validateTrackPoints(data: unknown): TrackPoint[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((item): item is ParsedTrackLayout => {
        if (typeof item !== 'object' || item === null) {
          return false;
        }

        const obj = item as Record<string, unknown>;
        return (
          typeof obj.x === 'number' &&
          typeof obj.y === 'number' &&
          typeof obj.z === 'number' &&
          typeof obj.type === 'string' &&
          ['track', 'checkpoint', 'start', 'finish'].includes(obj.type)
        );
      })
      .map((point) => ({
        x: point.x,
        y: point.y,
        z: point.z,
        type: point.type,
      }));
  }

  private countCheckpoints(layout: unknown): number {
    const parsedLayout = this.parseTrackLayout(layout);
    return parsedLayout.filter((point) => point.type === 'checkpoint').length;
  }

  private extractNEATWeights(genomes: Genome[]): number[][] {
    if (!genomes || genomes.length === 0) return [];

    const bestGenome = genomes.reduce((best, current) =>
      current.fitness > best.fitness ? current : best,
    );

    return bestGenome.connectionGenes
      .filter((gene) => gene.enabled)
      .map((gene) => [gene.weight]);
  }

  private extractHiddenLayersFromGenomes(genomes: Genome[]): number[] {
    if (!genomes || genomes.length === 0) return [10, 8];

    const bestGenome = genomes.reduce((best, current) =>
      current.fitness > best.fitness ? current : best,
    );

    const hiddenNodes = bestGenome.nodeGenes.filter(
      (node) => node.type === 'hidden',
    );
    const layerCounts = new Map<number, number>();

    hiddenNodes.forEach((node) => {
      const count = layerCounts.get(node.layer) || 0;
      layerCounts.set(node.layer, count + 1);
    });

    const layers = Array.from(layerCounts.values());
    return layers.length > 0 ? layers : [10, 8];
  }

  private parseWeights(_modelData: unknown): number[][] {
    console.warn(
      'parseWeights is deprecated. Use extractNEATWeights for NEAT models.',
    );
    return [];
  }

  private isModelDataWithWeights(data: unknown): data is ModelDataWeights {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;
    return 'weights' in obj && Array.isArray(obj.weights);
  }

  private validateWeights(weights: unknown): number[][] {
    if (!Array.isArray(weights)) {
      return [];
    }

    return weights.filter((layer): layer is number[] => {
      return (
        Array.isArray(layer) &&
        layer.every((weight) => typeof weight === 'number')
      );
    });
  }
}
