import { RaceStatus } from '../entities/race.entity';
export declare class CreateRaceDto {
    name: string;
    trackId: string;
    configuration?: Record<string, any>;
    status?: RaceStatus;
    participantIds?: string[];
}
