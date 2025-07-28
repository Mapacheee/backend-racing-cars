import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race, RaceStatus } from './entities/race.entity';
import { RaceParticipant } from './entities/race-participant.entity';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { TracksService } from '../tracks/tracks.service';
import { AiModelsService } from '../ai-models/ai-models.service';

@Injectable()
export class RacesService {
  constructor(
    @InjectRepository(Race)
    private racesRepository: Repository<Race>,
    @InjectRepository(RaceParticipant)
    private participantsRepository: Repository<RaceParticipant>,
    private tracksService: TracksService,
    private aiModelsService: AiModelsService,
  ) {}

  async create(createRaceDto: CreateRaceDto): Promise<Race> {
    // Verificar que la pista existe
    await this.tracksService.findOne(createRaceDto.trackId);

    const race = this.racesRepository.create(createRaceDto);
    const savedRace = await this.racesRepository.save(race);

    // Agregar participantes si se proporcionan
    if (createRaceDto.participantIds && createRaceDto.participantIds.length > 0) {
      for (const aiModelId of createRaceDto.participantIds) {
        // Verificar que el modelo de IA existe
        await this.aiModelsService.findOne(aiModelId);

        const participant = this.participantsRepository.create({
          raceId: savedRace.id,
          aiModelId,
        });

        await this.participantsRepository.save(participant);
      }
    }

    return this.findOne(savedRace.id);
  }

  async findAll(): Promise<Race[]> {
    return this.racesRepository.find({
      relations: ['track', 'participants', 'participants.aiModel'],
    });
  }

  async findOne(id: string): Promise<Race> {
    const race = await this.racesRepository.findOne({
      where: { id },
      relations: ['track', 'participants', 'participants.aiModel'],
    });

    if (!race) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    return race;
  }

  async update(id: string, updateRaceDto: UpdateRaceDto): Promise<Race> {
    const race = await this.findOne(id);

    // No permitir cambios si la carrera ya está completada
    if (race.status === RaceStatus.COMPLETED) {
      throw new BadRequestException('No se puede modificar una carrera completada');
    }

    Object.assign(race, updateRaceDto);
    return this.racesRepository.save(race);
  }

  async remove(id: string): Promise<void> {
    const race = await this.findOne(id);

    // Eliminar participantes primero
    await this.participantsRepository.delete({ raceId: id });

    // Luego eliminar la carrera
    await this.racesRepository.remove(race);
  }

  async addParticipant(id: string, addParticipantDto: AddParticipantDto): Promise<RaceParticipant> {
    const race = await this.findOne(id);

    // Verificar que el modelo de IA existe
    await this.aiModelsService.findOne(addParticipantDto.aiModelId);

    // Verificar que el modelo no esté ya en la carrera
    const existingParticipant = await this.participantsRepository.findOne({
      where: {
        raceId: id,
        aiModelId: addParticipantDto.aiModelId,
      },
    });

    if (existingParticipant) {
      throw new BadRequestException('Este modelo de IA ya está participando en la carrera');
    }

    const participant = this.participantsRepository.create({
      raceId: id,
      aiModelId: addParticipantDto.aiModelId,
    });

    return this.participantsRepository.save(participant);
  }

  async updateParticipant(raceId: string, participantId: string, updateParticipantDto: UpdateParticipantDto): Promise<RaceParticipant> {
    const participant = await this.participantsRepository.findOne({
      where: { id: participantId, raceId },
    });

    if (!participant) {
      throw new NotFoundException(`Participante con ID ${participantId} no encontrado en la carrera ${raceId}`);
    }

    Object.assign(participant, updateParticipantDto);
    return this.participantsRepository.save(participant);
  }

  async removeParticipant(raceId: string, participantId: string): Promise<void> {
    const participant = await this.participantsRepository.findOne({
      where: { id: participantId, raceId },
    });

    if (!participant) {
      throw new NotFoundException(`Participante con ID ${participantId} no encontrado en la carrera ${raceId}`);
    }

    await this.participantsRepository.remove(participant);
  }
}
