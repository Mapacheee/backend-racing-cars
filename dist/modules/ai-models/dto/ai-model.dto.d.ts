export declare class CreateAIModelDto {
    name: string;
    description?: string;
    version: string;
    modelData: Record<string, any>;
    configuration?: Record<string, any>;
    generationNumber?: number;
    trainingMetrics?: {
        distanceCompleted: number;
        timeElapsed: number;
        avgSpeed: number;
        collisions: number;
        lapTimes?: number[];
    };
    genetics?: {
        parentIds?: string[];
        fitnessScore: number;
        mutationRate?: number;
    };
}
export declare class UpdateAIModelDto {
    name?: string;
    description?: string;
    version?: string;
    modelData?: Record<string, any>;
    configuration?: Record<string, any>;
    generationNumber?: number;
    trainingMetrics?: {
        distanceCompleted: number;
        timeElapsed: number;
        avgSpeed: number;
        collisions: number;
        lapTimes?: number[];
    };
    genetics?: {
        parentIds?: string[];
        fitnessScore: number;
        mutationRate?: number;
    };
    isActive?: boolean;
}
export declare class AIModelFilterDto {
    userId?: string;
    minGeneration?: number;
    maxGeneration?: number;
    isActive?: boolean;
    minFitnessScore?: number;
}
