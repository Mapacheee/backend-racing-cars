import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AiModelsService } from './ai-models.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIModelFilterDto } from './dto/ai-model.dto';
import { PlayerFromJwt } from '../auth/player/interfaces/player-jwt.interface';

@Controller('ai-models')
@UseGuards(JwtAuthGuard)
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}

  @Post()
  create(
    @Request() { player }: { player: PlayerFromJwt },
    @Body() createAiModelDto: CreateAiModelDto,
  ) {
    return this.aiModelsService.create(player.id, createAiModelDto);
  }

  @Get()
  findAll(
    @Request() { player }: { player: PlayerFromJwt },
    @Query() filters: AIModelFilterDto,
  ) {
    filters.userId = player.id;
    return this.aiModelsService.findAll(filters);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() { player }: { player: PlayerFromJwt },
  ) {
    return this.aiModelsService.findOne(id, player.id);
  }

  @Get(':id/evolution-history')
  getEvolutionHistory(
    @Param('id') id: string,
    @Request() { player }: { player: PlayerFromJwt },
  ) {
    return this.aiModelsService.getEvolutionHistory(id, player.id);
  }

  @Post(':id/evolve')
  evolve(
    @Param('id') id: string,
    @Request() { player }: { player: PlayerFromJwt },
    @Body() body: { parentIds: string[] },
  ) {
    return this.aiModelsService.evolve([id, ...body.parentIds], player.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() { player }: { player: PlayerFromJwt },
    @Body() updateAiModelDto: UpdateAiModelDto,
  ) {
    return this.aiModelsService.update(id, player.id, updateAiModelDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() { player }: { player: PlayerFromJwt },
  ) {
    return this.aiModelsService.remove(id, player.id);
  }
}
