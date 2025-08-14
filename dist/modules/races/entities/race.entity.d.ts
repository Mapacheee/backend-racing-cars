import { Track } from '../../tracks/entities/track.entity';
import { RaceParticipant } from './race-participant.entity';
export declare enum RaceStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Race {
    id: string;
    name: string;
    track: Track;
    trackId: string;
    configuration: Record<string, any>;
    status: RaceStatus;
    startTime: Date;
    endTime: Date;
    participants: RaceParticipant[];
    createdAt: Date;
}
