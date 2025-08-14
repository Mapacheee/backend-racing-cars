import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLoginResponse } from './interfaces/admin-login-response.dto';
export declare class AdminAuthController {
    private readonly adminAuthService;
    constructor(adminAuthService: AdminAuthService);
    login(loginDto: AdminLoginDto): AdminLoginResponse;
    refresh(body: {
        token: string;
    }): AdminLoginResponse;
}
