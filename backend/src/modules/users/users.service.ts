import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/user.entity';
import { CreatePlayerDto } from './dto/create-user.dto';
import { UpdatePlayerDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Player)
    private usersRepository: Repository<Player>,
  ) {}

  async create(createUserDto: CreatePlayerDto): Promise<Player> {
    const { username, password } = createUserDto;

    const existingPlayer = await this.usersRepository.findOne({
      where: { username },
    });

    if (existingPlayer) {
      throw new ConflictException(
        'Un usuario con ese nombre de usuario ya existe',
      );
    }

    // Hash the password before saving
    const password_hash = await bcrypt.hash(password, 10);

    const player = this.usersRepository.create({
      username,
      password_hash,
    });

    return this.usersRepository.save(player);
  }

  async increaseAiGeneration(username: string): Promise<Player> {
    const user = await this.findOne(username);

    const increasedAiGeneration = user.aiGeneration + 1;
    const updatedUser = { ...user, aiGeneration: increasedAiGeneration };
    return this.usersRepository.save(updatedUser);
  }

  async findAll(): Promise<Player[]> {
    return this.usersRepository.find();
  }

  async findOne(username: string): Promise<Player> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException(
        `Usuario con nombre ${username} no encontrado`,
      );
    }
    return user;
  }

  async findByUsername(username: string): Promise<Player | null> {
    return this.usersRepository.findOneBy({ username });
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

    return this.usersRepository.save(user);
  }

  async remove(username: string): Promise<void> {
    const result = await this.usersRepository.delete({ username });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Usuario con nombre ${username} no encontrado`,
      );
    }
  }
}
