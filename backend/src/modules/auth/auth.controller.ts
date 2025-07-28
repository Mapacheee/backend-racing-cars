import { Controller, Post, UseGuards, Request, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SimpleAuthGuard } from './guards/simple-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateSimpleUserDto } from '../users/dto/create-simple-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @Post('register-simple')
  async registerSimple(@Body() createSimpleUserDto: CreateSimpleUserDto) {
    const user = await this.usersService.createSimpleUser(createSimpleUserDto);
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      token: this.authService.generateSimpleToken(user)
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(SimpleAuthGuard)
  @Post('login-simple')
  async loginSimple(@Request() req) {
    return {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.fullName,
      token: this.authService.generateSimpleToken(req.user)
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
