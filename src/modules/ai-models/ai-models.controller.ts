import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiModelsService } from './ai-models.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayerFromJwt } from '../auth/player/interfaces/player-jwt.interface';

@Controller('ai-models')
@UseGuards(JwtAuthGuard)
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}

  @Post('generations')
  @HttpCode(HttpStatus.CREATED)
  async pushGeneration(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Body() createAiModelDto: CreateAiModelDto,
  ) {
    return this.aiModelsService.pushGeneration(player.id, createAiModelDto);
  }

  @Get('generations/latest')
  async getLatestGeneration(
    @Request() { user: player }: { user: PlayerFromJwt },
  ) {
    return this.aiModelsService.getLatestGeneration(player.id);
  }

  @Get('generations/:generationNumber')
  async getGeneration(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Param('generationNumber') generationNumber: number,
  ) {
    return this.aiModelsService.getGeneration(player.id, generationNumber);
  }

  @Get('generations')
  async getAllGenerations(
    @Request() { player }: { player: PlayerFromJwt },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.aiModelsService.getAllGenerations(player.id, {
      page,
      limit,
      sortOrder,
    });
  }

  @Delete('generations/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetAllGenerations(
    @Request() { user: player }: { user: PlayerFromJwt },
  ) {
    return this.aiModelsService.resetAllGenerations(player.id);
  }

  @Delete('generations/:generationNumber')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGeneration(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Param('generationNumber') generationNumber: number,
  ) {
    return this.aiModelsService.deleteGeneration(player.id, generationNumber);
  }

  @Get('statistics')
  async getGenerationStatistics(
    @Request() { user: player }: { user: PlayerFromJwt },
  ) {
    return this.aiModelsService.getGenerationStatistics(player.id);
  }

  @Get('statistics/fitness-progression')
  async getFitnessProgression(
    @Request() { user: player }: { user: PlayerFromJwt },
  ) {
    return this.aiModelsService.getFitnessProgression(player.id);
  }

  @Get('statistics/best-performers')
  async getBestPerformers(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Query('limit') limit: number = 5,
  ) {
    return this.aiModelsService.getBestPerformers(player.id, limit);
  }

  @Get('genomes/best')
  async getBestGenomes(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Query('limit') limit: number = 10,
  ) {
    return this.aiModelsService.getBestGenomes(player.id, limit);
  }

  @Get('genomes/generation/:generationNumber')
  async getGenomesFromGeneration(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Param('generationNumber') generationNumber: number,
  ) {
    return this.aiModelsService.getGenomesFromGeneration(
      player.id,
      generationNumber,
    );
  }

  @Get('genomes/export')
  async exportGenomes(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Query('generationNumber') generationNumber?: number,
    @Query('topN') topN?: number,
  ) {
    return this.aiModelsService.exportGenomes(player.id, {
      generationNumber,
      topN,
    });
  }
}
