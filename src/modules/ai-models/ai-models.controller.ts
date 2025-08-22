import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AiModelsService } from './ai-models.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayerFromJwt } from '../auth/player/interfaces/player-jwt.interface';

@Controller('ai-models')
@UseGuards(JwtAuthGuard)
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAiModel(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Body() createAiModelDto: CreateAiModelDto,
  ) {
    return this.aiModelsService.createAiModel(player.id, createAiModelDto);
  }

  @Patch(':networkId/fitness')
  async updateNetworkFitness(
    @Request() { user: player }: { user: PlayerFromJwt },
    @Param('networkId') networkId: string,
    @Body('fitness') fitness: number,
  ) {
    return this.aiModelsService.updateNetworkFitness(
      player.id,
      networkId,
      fitness,
    );
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
}
