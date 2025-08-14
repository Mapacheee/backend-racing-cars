import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RacesService } from './races.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createRaceDto: CreateRaceDto) {
    return this.racesService.create(createRaceDto);
  }

  @Get()
  findAll() {
    return this.racesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.racesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRaceDto: UpdateRaceDto) {
    return this.racesService.update(id, updateRaceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.racesService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/participants')
  addParticipant(
    @Param('id') id: string,
    @Body() addParticipantDto: AddParticipantDto,
  ) {
    return this.racesService.addParticipant(id, addParticipantDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/participants/:participantId')
  updateParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    return this.racesService.updateParticipant(
      id,
      participantId,
      updateParticipantDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/participants/:participantId')
  removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ) {
    return this.racesService.removeParticipant(id, participantId);
  }
}
