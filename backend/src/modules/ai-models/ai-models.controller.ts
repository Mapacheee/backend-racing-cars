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
} from '@nestjs/common';
import { AiModelsService } from './ai-models.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai-models')
@UseGuards(JwtAuthGuard)
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}

  @Post()
  create(@Request() req, @Body() createAiModelDto: CreateAiModelDto) {
    return this.aiModelsService.create(req.user.userId, createAiModelDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.aiModelsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.aiModelsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateAiModelDto: UpdateAiModelDto,
  ) {
    return this.aiModelsService.update(id, req.user.userId, updateAiModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.aiModelsService.remove(id, req.user.userId);
  }
}
