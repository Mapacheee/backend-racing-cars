import { AiModelsService } from './ai-models.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { AIModelFilterDto } from './dto/ai-model.dto';
import { PlayerFromJwt } from '../auth/player/interfaces/player-jwt.interface';
export declare class AiModelsController {
    private readonly aiModelsService;
    constructor(aiModelsService: AiModelsService);
    create({ player }: {
        player: PlayerFromJwt;
    }, createAiModelDto: CreateAiModelDto): Promise<import("./entities/ai-model.entity").AIModel>;
    findAll({ player }: {
        player: PlayerFromJwt;
    }, filters: AIModelFilterDto): Promise<import("./entities/ai-model.entity").AIModel[]>;
    findOne(id: string, { player }: {
        player: PlayerFromJwt;
    }): Promise<import("./entities/ai-model.entity").AIModel>;
    getEvolutionHistory(id: string, { player }: {
        player: PlayerFromJwt;
    }): Promise<import("./entities/ai-model.entity").AIModel[]>;
    evolve(id: string, { player }: {
        player: PlayerFromJwt;
    }, body: {
        parentIds: string[];
    }): Promise<import("./entities/ai-model.entity").AIModel>;
    update(id: string, { player }: {
        player: PlayerFromJwt;
    }, updateAiModelDto: UpdateAiModelDto): Promise<import("./entities/ai-model.entity").AIModel>;
    remove(id: string, { player }: {
        player: PlayerFromJwt;
    }): Promise<void>;
}
