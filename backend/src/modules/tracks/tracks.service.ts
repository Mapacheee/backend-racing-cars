import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
  ) {}

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    const track = this.tracksRepository.create(createTrackDto);
    return this.tracksRepository.save(track);
  }

  async findAll(onlyActive = true): Promise<Track[]> {
    const queryOptions: any = {};

    if (onlyActive) {
      queryOptions.where = { isActive: true };
    }

    return this.tracksRepository.find(queryOptions);
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.tracksRepository.findOneBy({ id });

    if (!track) {
      throw new NotFoundException(`Pista con ID ${id} no encontrada`);
    }

    return track;
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    const track = await this.findOne(id);
    Object.assign(track, updateTrackDto);
    return this.tracksRepository.save(track);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tracksRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Pista con ID ${id} no encontrada`);
    }
  }
}
