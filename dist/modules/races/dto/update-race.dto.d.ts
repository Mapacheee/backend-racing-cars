import { RaceStatus } from '../entities/race.entity';
export declare class UpdateRaceDto {
    name?: string;
    configuration?: Record<string, any>;
    status?: RaceStatus;
    startTime?: Date;
    endTime?: Date;
}
