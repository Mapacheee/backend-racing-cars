import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModelsService } from './ai-models.service';
import { AiModelsController } from './ai-models.controller';
import { AIModel } from './entities/ai-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AIModel])],
  controllers: [AiModelsController],
  providers: [AiModelsService],
  exports: [AiModelsService],
})
export class AiModelsModule {}
