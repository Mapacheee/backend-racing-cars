import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSimpleUserDto } from './dto/create-simple-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, isAdmin } = createUserDto;

    // Verificar si el usuario ya existe
    const whereConditions = [{ username }];
    if (email) {
      whereConditions.push({ email: email });
    }

    const existingUser = await this.usersRepository.findOne({
      where: whereConditions,
    });

    if (existingUser) {
      throw new ConflictException(
        'Un usuario con ese nombre de usuario o email ya existe',
      );
    }

    // Crear nuevo usuario
    const user = this.usersRepository.create({
      ...createUserDto,
    });

    // Solo hacer hash de la contraseña si se proporciona (para administradores)
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    return this.usersRepository.save(user);
  }

  async createSimpleUser(createSimpleUserDto: CreateSimpleUserDto): Promise<User> {
    const { username } = createSimpleUserDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException(
        'Un usuario con ese nombre ya existe',
      );
    }

    // Crear nuevo usuario simple (sin contraseña ni email)
    const user = this.usersRepository.create({
      ...createSimpleUserDto,
      isAdmin: false, // Usuario simple nunca es admin
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
}
