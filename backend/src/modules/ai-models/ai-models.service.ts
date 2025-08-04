import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIModel } from './entities/ai-model.entity';
import {
  CreateAIModelDto,
  UpdateAIModelDto,
  AIModelFilterDto,
} from './dto/ai-model.dto';

@Injectable()
export class AiModelsService {
  constructor(
    @InjectRepository(AIModel)
    private aiModelsRepository: Repository<AIModel>,
  ) {}

  async create(
    userId: string,
    createAiModelDto: CreateAIModelDto,
  ): Promise<AIModel> {
    const aiModel = this.aiModelsRepository.create({
      ...createAiModelDto,
      playerId: userId,
      generationNumber: createAiModelDto.generationNumber || 1,
      lastTrainingDate: new Date(),
    });

    return this.aiModelsRepository.save(aiModel);
  }

  async findAll(filters: AIModelFilterDto): Promise<AIModel[]> {
    const query = this.aiModelsRepository.createQueryBuilder('aiModel');

    if (filters.userId) {
      query.andWhere('aiModel.userId = :userId', { userId: filters.userId });
    }

    if (filters.minGeneration) {
      query.andWhere('aiModel.generationNumber >= :minGeneration', {
        minGeneration: filters.minGeneration,
      });
    }

    if (filters.maxGeneration) {
      query.andWhere('aiModel.generationNumber <= :maxGeneration', {
        maxGeneration: filters.maxGeneration,
      });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('aiModel.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.minFitnessScore) {
      query.andWhere(
        "CAST(aiModel.genetics->'$.fitnessScore' AS DECIMAL) >= :minFitnessScore",
        {
          minFitnessScore: filters.minFitnessScore,
        },
      );
    }

    return query.getMany();
  }

  async findOne(id: string, userId?: string): Promise<AIModel> {
    const queryOptions: any = { where: { id } };

    if (userId) {
      queryOptions.where.userId = userId;
    }

    const aiModel = await this.aiModelsRepository.findOne(queryOptions);

    if (!aiModel) {
      throw new NotFoundException(`Modelo de IA con ID ${id} no encontrado`);
    }

    return aiModel;
  }

  async update(
    id: string,
    userId: string,
    updateAiModelDto: UpdateAIModelDto,
  ): Promise<AIModel> {
    const aiModel = await this.findOne(id);

    if (aiModel.playerId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este modelo de IA',
      );
    }

    Object.assign(aiModel, updateAiModelDto);

    if (updateAiModelDto.trainingMetrics) {
      aiModel.lastTrainingDate = new Date();
    }

    return this.aiModelsRepository.save(aiModel);
  }

  async evolve(parentIds: string[], userId: string): Promise<AIModel> {
    const parents = await Promise.all(
      parentIds.map((id) => this.findOne(id, userId)),
    );

    // Encuentra el padre con mejor fitness score
    const bestParent = parents.reduce((best, current) => {
      const currentFitness = current.genetics?.fitnessScore || 0;
      const bestFitness = best.genetics?.fitnessScore || 0;
      return currentFitness > bestFitness ? current : best;
    });

    // Crea una nueva generación basada en el mejor padre
    return this.create(userId, {
      name: `${bestParent.name}_gen_${bestParent.generationNumber + 1}`,
      version: `${bestParent.version}.${bestParent.generationNumber + 1}`,
      modelData: bestParent.modelData,
      configuration: bestParent.configuration,
      generationNumber: bestParent.generationNumber + 1,
      genetics: {
        parentIds,
        fitnessScore: 0, // Se actualizará después del entrenamiento
        mutationRate: 0.1, // Tasa de mutación configurable
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const aiModel = await this.findOne(id);

    if (aiModel.playerId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este modelo de IA',
      );
    }

    await this.aiModelsRepository.remove(aiModel);
  }

  async getEvolutionHistory(id: string, userId: string): Promise<AIModel[]> {
    const currentModel = await this.findOne(id, userId);
    const history = [currentModel];

    let currentParents = currentModel.genetics?.parentIds || [];
    while (currentParents.length > 0) {
      const parents = await Promise.all(
        currentParents.map((parentId) => this.findOne(parentId, userId)),
      );
      history.push(...parents);
      currentParents = parents.flatMap((p) => p.genetics?.parentIds || []);
    }

    return history;
  }
}
