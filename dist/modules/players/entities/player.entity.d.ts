import { AIModel } from '../../ai-models/entities/ai-model.entity';
export declare class Player {
    id: string;
    username: string;
    password_hash: string;
    aiGeneration: number;
    createdAt: Date;
    updatedAt: Date;
    aiModels: AIModel[];
}
