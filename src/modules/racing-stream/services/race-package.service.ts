import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from '../../tracks/entities/track.entity';
import { AIModel } from '../../ai-models/entities/ai-model.entity';
import {
  RacePackage,
  RaceConfiguration,
  AIModelData,
  TrackPoint,
  RacePackageServiceInterface,
} from '../interfaces/racing-stream.interface';

// Type definitions for configuration objects
interface AIModelConfiguration {
  inputSize?: number;
  outputSize?: number;
  hiddenLayers?: number[];
  [key: string]: unknown;
}

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
    // Validate input
    this.validateRaceConfigurationInput(raceConfig);

    // Get track data
    const track = await this.trackRepository.findOne({
      where: { id: raceConfig.trackId },
    });

    if (!track) {
      throw new Error(`Track with ID ${raceConfig.trackId} not found`);
    }

    // Get AI models
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

    // Convert track to race format
    const trackData = {
      id: track.id,
      name: track.name,
      layout: this.parseTrackLayout(track.layoutData),
      metadata: {
        length: track.length,
        width: 10, // Default width - could be added to track entity later
        checkpoints: this.countCheckpoints(track.layoutData),
        description: track.difficulty, // Using difficulty as description
      },
    };

    // Convert AI models to race format
    const aiModelData: AIModelData[] = aiModels.map((model) => ({
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

  async validateRaceConfiguration(
    raceConfig: RaceConfiguration,
  ): Promise<boolean> {
    try {
      // Validate input structure
      if (!this.isValidRaceConfigurationStructure(raceConfig)) {
        return false;
      }

      // Check if track exists
      const track = await this.trackRepository.findOne({
        where: { id: raceConfig.trackId },
      });
      if (!track) return false;

      // Check if all AI models exist
      const aiModels = await this.aiModelRepository.findByIds(
        raceConfig.aiModelIds,
      );
      if (aiModels.length !== raceConfig.aiModelIds.length) return false;

      // Validate race settings
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
    // Convert your track layout format to the racing interface format
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

  private parseWeights(modelData: unknown): number[][] {
    // Convert your AI model weights format to the racing interface format
    if (this.isModelDataWithWeights(modelData)) {
      return this.validateWeights(modelData.weights);
    }
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

  private parseHiddenLayers(configuration: unknown): number[] {
    if (this.isConfigurationWithHiddenLayers(configuration)) {
      return this.validateHiddenLayers(configuration.hiddenLayers);
    }
    return [10, 8]; // Default hidden layers if not specified
  }

  private isConfigurationWithHiddenLayers(
    data: unknown,
  ): data is AIModelConfiguration {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;
    return 'hiddenLayers' in obj && Array.isArray(obj.hiddenLayers);
  }

  private validateHiddenLayers(hiddenLayers: unknown): number[] {
    if (!Array.isArray(hiddenLayers)) {
      return [10, 8];
    }

    const validLayers = hiddenLayers.filter(
      (layer): layer is number => typeof layer === 'number' && layer > 0,
    );
    return validLayers.length > 0 ? validLayers : [10, 8];
  }

  private getInputSize(configuration: unknown): number {
    if (this.isConfigurationWithInputSize(configuration)) {
      return typeof configuration.inputSize === 'number' &&
        configuration.inputSize > 0
        ? configuration.inputSize
        : 7;
    }
    return 7; // Default input size for racing AI (speed, direction, distances to walls, etc.)
  }

  private isConfigurationWithInputSize(
    data: unknown,
  ): data is AIModelConfiguration {
    return typeof data === 'object' && data !== null && 'inputSize' in data;
  }

  private getOutputSize(configuration: unknown): number {
    if (this.isConfigurationWithOutputSize(configuration)) {
      return typeof configuration.outputSize === 'number' &&
        configuration.outputSize > 0
        ? configuration.outputSize
        : 3;
    }
    return 3; // Default output size (steering, acceleration, braking)
  }

  private isConfigurationWithOutputSize(
    data: unknown,
  ): data is AIModelConfiguration {
    return typeof data === 'object' && data !== null && 'outputSize' in data;
  }
}
