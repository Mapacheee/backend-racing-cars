import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PlayersService } from '../../players/player.service';
import { PlayerLoginDto, PlayerLoginResponseDto } from './dto/player-login.dto';
import { PlayerRegisterDto } from './dto/player-register.dto';
export declare class PlayerAuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly playersService;
    constructor(jwtService: JwtService, configService: ConfigService, playersService: PlayersService);
    private generatePlayerToken;
    private verifyPlayerToken;
    register(registerDto: PlayerRegisterDto): Promise<PlayerLoginResponseDto>;
    login(loginDto: PlayerLoginDto): Promise<PlayerLoginResponseDto>;
    refreshToken(token: string): PlayerLoginResponseDto;
}
