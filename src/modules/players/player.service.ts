import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { AIModel } from '../ai-models/entities/ai-model.entity';
import { CreatePlayerDto } from './dto/create-user.dto';
import { UpdatePlayerDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(AIModel)
    private aiModelsRepository: Repository<AIModel>,
  ) {}

  async syncAiGeneration(playerId: string): Promise<Player> {
    const aiModelCount = await this.aiModelsRepository.count({
      where: { playerId },
    });

    const player = await this.playersRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException(`Jugador con ID ${playerId} no encontrado`);
    }

    player.aiGeneration = aiModelCount + 1;
    return this.playersRepository.save(player);
  }

  async updateAiGeneration(
    playerId: string,
    newGeneration: number,
  ): Promise<Player> {
    if (newGeneration < 0) {
      throw new BadRequestException('aiGeneration cannot be negative');
    }

    const player = await this.playersRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException(`Jugador con ID ${playerId} no encontrado`);
    }

    player.aiGeneration = newGeneration;
    return this.playersRepository.save(player);
  }

  async create(createUserDto: CreatePlayerDto): Promise<Player> {
    const { username, password } = createUserDto;

    const existingPlayer = await this.playersRepository.findOne({
      where: { username },
    });

    if (existingPlayer) {
      throw new ConflictException(
        'Un usuario con ese nombre de usuario ya existe',
      );
    }

    // Hash the password before saving
    const password_hash = await bcrypt.hash(password, 10);

    const player = this.playersRepository.create({
      username,
      password_hash,
    });

    return this.playersRepository.save(player);
  }

  async findAll(): Promise<Player[]> {
    return this.playersRepository.find();
  }

  async findOne(username: string): Promise<Player> {
    const player = await this.playersRepository.findOneBy({ username });
    if (!player) {
      throw new NotFoundException(
        `Usuario con nombre ${username} no encontrado`,
      );
    }
    return player;
  }

  async findByUsername(username: string): Promise<Player | null> {
    return this.playersRepository.findOneBy({ username });
  }

  async update(
    username: string,
    updateUserDto: UpdatePlayerDto,
  ): Promise<Player> {
    const player = await this.findOne(username);

    // Handle password update separately
    if (updateUserDto.password) {
      const password_hash = await bcrypt.hash(updateUserDto.password, 10);
      const { password: _, aiGeneration, ...otherFields } = updateUserDto;
      Object.assign(player, { ...otherFields, password_hash });

      // Handle aiGeneration separately if provided
      if (aiGeneration !== undefined) {
        if (aiGeneration < 0) {
          throw new BadRequestException('aiGeneration cannot be negative');
        }
        player.aiGeneration = aiGeneration;
      }
    } else {
      // Handle aiGeneration validation
      if (
        updateUserDto.aiGeneration !== undefined &&
        updateUserDto.aiGeneration < 0
      ) {
        throw new BadRequestException('aiGeneration cannot be negative');
      }
      Object.assign(player, updateUserDto);
    }

    return this.playersRepository.save(player);
  }

  async remove(username: string): Promise<void> {
    const result = await this.playersRepository.delete({ username });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Usuario con nombre ${username} no encontrado`,
      );
    }
  }
}
