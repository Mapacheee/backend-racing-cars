import { PlayerAuthService } from './player-auth.service';
import { PlayerLoginDto, PlayerLoginResponseDto } from './dto/player-login.dto';
import { PlayerRegisterDto } from './dto/player-register.dto';
export declare class PlayerAuthController {
    private readonly playerAuthService;
    constructor(playerAuthService: PlayerAuthService);
    register(registerDto: PlayerRegisterDto): Promise<PlayerLoginResponseDto>;
    login(loginDto: PlayerLoginDto): Promise<PlayerLoginResponseDto>;
    refresh(body: {
        token: string;
    }): PlayerLoginResponseDto;
}
