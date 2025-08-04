import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PlayerAuthService } from './player-auth.service';
import { PlayerLoginDto } from './dto/player-login.dto';
import { PlayerRegisterDto } from './dto/player-register.dto';
import { PlayerLoginResponseDto } from './dto/player-login-response.dto';

@Controller('auth/player')
export class PlayerAuthController {
  constructor(private readonly playerAuthService: PlayerAuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: PlayerRegisterDto,
  ): Promise<PlayerLoginResponseDto> {
    return this.playerAuthService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: PlayerLoginDto,
  ): Promise<PlayerLoginResponseDto> {
    return this.playerAuthService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { token: string }): PlayerLoginResponseDto {
    return this.playerAuthService.refreshToken(body.token);
  }
}
