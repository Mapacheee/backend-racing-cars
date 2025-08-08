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

  /**
   * Synchronizes the player's aiGeneration with their actual AI models count
   */
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

    player.aiGeneration = aiModelCount;
    return this.playersRepository.save(player);
  }

  /**
   * Updates the player's aiGeneration to a specific value
   * Note: This should typically only be used for administrative purposes
   * In normal operation, aiGeneration should be synced with AI models count
   */
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

  // TODO: Don't increase the counter, just count the number of AI models
  // async increaseAiGeneration(username: string): Promise<Player> {
  //   const user = await this.findOne(username);

  //   const increasedAiGeneration = user.aiGeneration + 1;
  //   const updatedUser = { ...user, aiGeneration: increasedAiGeneration };
  //   return this.playersRepository.save(updatedUser);
  // }

  async findAll(): Promise<Player[]> {
    return this.playersRepository.find();
  }

  async findOne(username: string): Promise<Player> {
    const user = await this.playersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException(
        `Usuario con nombre ${username} no encontrado`,
      );
    }
    return user;
  }

  async findByUsername(username: string): Promise<Player | null> {
    return this.playersRepository.findOneBy({ username });
  }

  async update(
    username: string,
    updateUserDto: UpdatePlayerDto,
  ): Promise<Player> {
    const user = await this.findOne(username);

    // Handle password update separately
    if (updateUserDto.password) {
      const password_hash = await bcrypt.hash(updateUserDto.password, 10);
      const { password: _, aiGeneration, ...otherFields } = updateUserDto;
      Object.assign(user, { ...otherFields, password_hash });

      // Handle aiGeneration separately if provided
      if (aiGeneration !== undefined) {
        if (aiGeneration < 0) {
          throw new BadRequestException('aiGeneration cannot be negative');
        }
        user.aiGeneration = aiGeneration;
      }
    } else {
      // Handle aiGeneration validation
      if (
        updateUserDto.aiGeneration !== undefined &&
        updateUserDto.aiGeneration < 0
      ) {
        throw new BadRequestException('aiGeneration cannot be negative');
      }
      Object.assign(user, updateUserDto);
    }

    return this.playersRepository.save(user);
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
