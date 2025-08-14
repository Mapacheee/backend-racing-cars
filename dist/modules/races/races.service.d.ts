import { Repository } from 'typeorm';
import { Race } from './entities/race.entity';
import { RaceParticipant } from './entities/race-participant.entity';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { TracksService } from '../tracks/tracks.service';
import { AiModelsService } from '../ai-models/ai-models.service';
export declare class RacesService {
    private racesRepository;
    private participantsRepository;
    private tracksService;
    private aiModelsService;
    constructor(racesRepository: Repository<Race>, participantsRepository: Repository<RaceParticipant>, tracksService: TracksService, aiModelsService: AiModelsService);
    create(createRaceDto: CreateRaceDto): Promise<Race>;
    findAll(): Promise<Race[]>;
    findOne(id: string): Promise<Race>;
    update(id: string, updateRaceDto: UpdateRaceDto): Promise<Race>;
    remove(id: string): Promise<void>;
    addParticipant(id: string, addParticipantDto: AddParticipantDto): Promise<RaceParticipant>;
    updateParticipant(raceId: string, participantId: string, updateParticipantDto: UpdateParticipantDto): Promise<RaceParticipant>;
    removeParticipant(raceId: string, participantId: string): Promise<void>;
}
