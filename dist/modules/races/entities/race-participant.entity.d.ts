import { Race } from './race.entity';
import { AIModel } from '../../ai-models/entities/ai-model.entity';
export declare class RaceParticipant {
    id: string;
    race: Race;
    raceId: string;
    aiModel: AIModel;
    aiModelId: string;
    position: number;
    finishingTime: number;
    performanceMetrics: Record<string, any>;
    createdAt: Date;
}
