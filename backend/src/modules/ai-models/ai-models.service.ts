import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIModel } from './entities/ai-model.entity';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';

@Injectable()
export class AiModelsService {
  constructor(
    @InjectRepository(AIModel)
    private aiModelsRepository: Repository<AIModel>,
  ) {}

  async create(userId: string, createAiModelDto: CreateAiModelDto): Promise<AIModel> {
    const aiModel = this.aiModelsRepository.create({
      ...createAiModelDto,
      userId,
    });

    return this.aiModelsRepository.save(aiModel);
  }

  async findAll(userId?: string): Promise<AIModel[]> {
    const queryOptions: any = {};

    if (userId) {
      queryOptions.where = { userId };
    }

    return this.aiModelsRepository.find(queryOptions);
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

  async update(id: string, userId: string, updateAiModelDto: UpdateAiModelDto): Promise<AIModel> {
    const aiModel = await this.findOne(id);

    // Verificar si el usuario tiene permiso para actualizar este modelo
    if (aiModel.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar este modelo de IA');
    }

    Object.assign(aiModel, updateAiModelDto);
    return this.aiModelsRepository.save(aiModel);
  }

  async remove(id: string, userId: string): Promise<void> {
    const aiModel = await this.findOne(id);

    // Verificar si el usuario tiene permiso para eliminar este modelo
    if (aiModel.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este modelo de IA');
    }

    await this.aiModelsRepository.remove(aiModel);
  }
}
