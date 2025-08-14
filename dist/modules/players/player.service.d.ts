import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { AIModel } from '../ai-models/entities/ai-model.entity';
import { CreatePlayerDto } from './dto/create-user.dto';
import { UpdatePlayerDto } from './dto/update-user.dto';
export declare class PlayersService {
    private playersRepository;
    private aiModelsRepository;
    constructor(playersRepository: Repository<Player>, aiModelsRepository: Repository<AIModel>);
    syncAiGeneration(playerId: string): Promise<Player>;
    updateAiGeneration(playerId: string, newGeneration: number): Promise<Player>;
    create(createUserDto: CreatePlayerDto): Promise<Player>;
    findAll(): Promise<Player[]>;
    findOne(username: string): Promise<Player>;
    findByUsername(username: string): Promise<Player | null>;
    update(username: string, updateUserDto: UpdatePlayerDto): Promise<Player>;
    remove(username: string): Promise<void>;
}
