import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLoginResponse } from './interfaces/admin-login-response.dto';
export declare class AdminAuthService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    private generateAdminToken;
    private verifyAdminToken;
    login(loginDto: AdminLoginDto): AdminLoginResponse;
    refreshToken(token: string): AdminLoginResponse;
}
