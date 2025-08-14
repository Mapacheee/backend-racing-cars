import { Player } from '../../players/entities/player.entity';
export declare class AIModel {
    id: string;
    name: string;
    description: string;
    version: string;
    modelData: Record<string, any>;
    configuration: Record<string, any>;
    generationNumber: number;
    trainingMetrics: {
        distanceCompleted: number;
        timeElapsed: number;
        avgSpeed: number;
        collisions: number;
        lapTimes?: number[];
    };
    genetics: {
        parentIds?: string[];
        fitnessScore: number;
        mutationRate?: number;
    };
    lastTrainingDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    player: Player;
    playerId: string;
}
