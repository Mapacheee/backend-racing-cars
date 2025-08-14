export declare class CreateAiModelDto {
    name: string;
    description?: string;
    version: string;
    modelData: Record<string, any>;
    configuration?: Record<string, any>;
    trainingStats?: string;
}
