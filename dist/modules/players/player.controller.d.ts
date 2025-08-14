import { PlayersService } from './player.service';
import { CreatePlayerDto } from './dto/create-user.dto';
import { UpdatePlayerDto } from './dto/update-user.dto';
export declare class PlayersController {
    private readonly PlayersService;
    constructor(PlayersService: PlayersService);
    create(createUserDto: CreatePlayerDto): Promise<import("./entities/player.entity").Player>;
    findAll(): Promise<import("./entities/player.entity").Player[]>;
    findOne(username: string): Promise<import("./entities/player.entity").Player>;
    syncAiGeneration(username: string): Promise<import("./entities/player.entity").Player>;
    update(username: string, updateUserDto: UpdatePlayerDto): Promise<import("./entities/player.entity").Player>;
    remove(username: string): Promise<void>;
}
