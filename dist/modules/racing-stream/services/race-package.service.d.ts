import { Repository } from 'typeorm';
import { Track } from '../../tracks/entities/track.entity';
import { AIModel } from '../../ai-models/entities/ai-model.entity';
import { RacePackage, RaceConfiguration, RacePackageServiceInterface } from '../interfaces/racing-stream.interface';
export declare class RacePackageService implements RacePackageServiceInterface {
    private readonly trackRepository;
    private readonly aiModelRepository;
    constructor(trackRepository: Repository<Track>, aiModelRepository: Repository<AIModel>);
    buildRacePackage(raceConfig: RaceConfiguration): Promise<RacePackage>;
    validateRaceConfiguration(raceConfig: RaceConfiguration): Promise<boolean>;
    private validateRaceConfigurationInput;
    private isValidRaceConfigurationStructure;
    private parseTrackLayout;
    private validateTrackPoints;
    private countCheckpoints;
    private parseWeights;
    private isModelDataWithWeights;
    private validateWeights;
    private parseHiddenLayers;
    private isConfigurationWithHiddenLayers;
    private validateHiddenLayers;
    private getInputSize;
    private isConfigurationWithInputSize;
    private getOutputSize;
    private isConfigurationWithOutputSize;
}
