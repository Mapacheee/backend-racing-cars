import { RacesService } from './races.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
export declare class RacesController {
    private readonly racesService;
    constructor(racesService: RacesService);
    create(createRaceDto: CreateRaceDto): Promise<import("./entities/race.entity").Race>;
    findAll(): Promise<import("./entities/race.entity").Race[]>;
    findOne(id: string): Promise<import("./entities/race.entity").Race>;
    update(id: string, updateRaceDto: UpdateRaceDto): Promise<import("./entities/race.entity").Race>;
    remove(id: string): Promise<void>;
    addParticipant(id: string, addParticipantDto: AddParticipantDto): Promise<import("./entities/race-participant.entity").RaceParticipant>;
    updateParticipant(id: string, participantId: string, updateParticipantDto: UpdateParticipantDto): Promise<import("./entities/race-participant.entity").RaceParticipant>;
    removeParticipant(id: string, participantId: string): Promise<void>;
}
