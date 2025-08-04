import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { PlayersService } from './player.service';
import { CreatePlayerDto } from './dto/create-user.dto';
import { UpdatePlayerDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // Para excluir campos sensibles como password
export class PlayersController {
  constructor(private readonly PlayersService: PlayersService) {}

  @Post()
  create(@Body() createUserDto: CreatePlayerDto) {
    return this.PlayersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.PlayersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  increaseAiGeneration(@Param('username') username: string) {
    return this.PlayersService.increaseAiGeneration(username);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.PlayersService.findOne(username);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':username')
  update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdatePlayerDto,
  ) {
    return this.PlayersService.update(username, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username')
  remove(@Param('username') username: string) {
    return this.PlayersService.remove(username);
  }
}
