import { Repository } from 'typeorm';
import { AIModel } from './entities/ai-model.entity';
import { Player } from '../players/entities/player.entity';
import { CreateAIModelDto, UpdateAIModelDto, AIModelFilterDto } from './dto/ai-model.dto';
export declare class AiModelsService {
    private aiModelsRepository;
    private playersRepository;
    constructor(aiModelsRepository: Repository<AIModel>, playersRepository: Repository<Player>);
    private updatePlayerAiGeneration;
    create(userId: string, createAiModelDto: CreateAIModelDto): Promise<AIModel>;
    findAll(filters: AIModelFilterDto): Promise<AIModel[]>;
    findOne(id: string, userId?: string): Promise<AIModel>;
    update(id: string, userId: string, updateAiModelDto: UpdateAIModelDto): Promise<AIModel>;
    evolve(parentIds: string[], userId: string): Promise<AIModel>;
    remove(id: string, userId: string): Promise<void>;
    getEvolutionHistory(id: string, userId: string): Promise<AIModel[]>;
}
