import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-user.dto';
import { UpdatePlayerDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
  ) {}

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

  async increaseAiGeneration(username: string): Promise<Player> {
    const user = await this.findOne(username);

    const increasedAiGeneration = user.aiGeneration + 1;
    const updatedUser = { ...user, aiGeneration: increasedAiGeneration };
    return this.playersRepository.save(updatedUser);
  }

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

    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      const password_hash = await bcrypt.hash(updateUserDto.password, 10);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...otherFields } = updateUserDto;
      Object.assign(user, { ...otherFields, password_hash });
    } else {
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
